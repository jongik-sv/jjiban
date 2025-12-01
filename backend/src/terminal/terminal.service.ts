import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as os from 'os';
import { spawn, ChildProcess } from 'child_process';

interface TerminalSession {
    process: ChildProcess;
    buffer: string;
}

@Injectable()
export class TerminalService {
    private sessions: Map<string, TerminalSession> = new Map();

    getAvailableShells() {
        const isWin = os.platform() === 'win32';
        if (isWin) {
            return [
                { name: 'Git Bash', value: 'C:\\PROGRA~1\\Git\\bin\\bash.exe' },
                { name: 'PowerShell', value: 'powershell.exe' },
                { name: 'CMD', value: 'cmd.exe' },
                { name: 'WSL', value: 'wsl.exe' },
            ];
        }
        return [
            { name: 'Bash', value: 'bash' },
            { name: 'Sh', value: 'sh' },
        ];
    }

    createSession(client: Socket, shellPath?: string) {
        const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const shell = shellPath || defaultShell;

        console.log(`[Terminal] Spawning shell with child_process: ${shell}`);

        try {
            // Use child_process instead of node-pty
            const childProcess = spawn(shell, [], {
                cwd: process.cwd(),
                env: process.env,
                shell: true,
                windowsHide: false,
            });

            const session: TerminalSession = {
                process: childProcess,
                buffer: '',
            };

            this.sessions.set(client.id, session);

            // Handle stdout
            childProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                client.emit('terminal:output', output);
            });

            // Handle stderr
            childProcess.stderr?.on('data', (data) => {
                const output = data.toString();
                client.emit('terminal:output', output);
            });

            // Handle exit
            childProcess.on('exit', (code, signal) => {
                client.emit('terminal:output', `\r\nProcess exited with code ${code}\r\n`);
                this.sessions.delete(client.id);
            });

            // Handle errors
            childProcess.on('error', (error) => {
                console.error(`[Terminal] Process error:`, error);
                client.emit('terminal:output', `\r\nError: ${error.message}\r\n`);
            });

            console.log(`[Terminal] Process created with PID: ${childProcess.pid}`);

            // Send welcome message
            client.emit('terminal:output', `*** Connected to Backend Terminal ***\r\n\r\n`);

            return childProcess;
        } catch (error) {
            console.error(`[Terminal] Error spawning process:`, error);
            client.emit('terminal:output', `\r\nError: ${error.message}\r\n`);
            throw error;
        }
    }

    handleInput(clientId: string, input: string) {
        const session = this.sessions.get(clientId);
        if (session && session.process.stdin) {
            session.process.stdin.write(input);
        }
    }

    handleResize(clientId: string, cols: number, rows: number) {
        // child_process doesn't support resize like PTY
        // This is a limitation compared to node-pty
        console.log(`[Terminal] Resize requested (${cols}x${rows}) but not supported with child_process`);
    }

    removeSession(clientId: string) {
        const session = this.sessions.get(clientId);
        if (session) {
            session.process.kill();
            this.sessions.delete(clientId);
        }
    }
}
