import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as os from 'os';
import { spawn, ChildProcess } from 'child_process';

@Injectable()
export class TerminalService {
    private sessions: Map<string, ChildProcess> = new Map();

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

        console.log(`[Terminal] Spawning shell: ${shell}`);

        // Use child_process.spawn as a fallback for node-pty
        // shell: false ensures we can pass paths with spaces correctly without cmd.exe interference
        const args = shell.toLowerCase().includes('bash') ? ['-i'] : [];
        const ptyProcess = spawn(shell, args, {
            cwd: process.cwd(),
            env: { ...process.env, FORCE_COLOR: '1' },
            shell: false,
        });

        this.sessions.set(client.id, ptyProcess);

        // Initial setup for Windows to support UTF-8
        if (os.platform() === 'win32') {
            if (shell.includes('cmd') || shell.includes('powershell')) {
                ptyProcess.stdin.write('chcp 65001\r\n');
            }
        }

        // Handle output
        ptyProcess.stdout.on('data', (data) => {
            const output = data.toString('utf-8');
            client.emit('terminal:output', output);
        });

        ptyProcess.stderr.on('data', (data) => {
            const output = data.toString('utf-8');
            client.emit('terminal:output', output);
        });

        ptyProcess.on('exit', (code) => {
            client.emit('terminal:output', `\r\nProcess exited with code ${code}\r\n`);
        });

        ptyProcess.on('error', (err) => {
            client.emit('terminal:output', `\r\nError: ${err.message}\r\n`);
        });

        return ptyProcess;
    }

    handleInput(clientId: string, input: string) {
        const ptyProcess = this.sessions.get(clientId);
        if (ptyProcess && ptyProcess.stdin) {
            ptyProcess.stdin.write(input);
        }
    }

    handleResize(clientId: string, cols: number, rows: number) {
        // child_process doesn't support resizing natively like pty
    }

    removeSession(clientId: string) {
        const ptyProcess = this.sessions.get(clientId);
        if (ptyProcess) {
            ptyProcess.kill();
            this.sessions.delete(clientId);
        }
    }
}
