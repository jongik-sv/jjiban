import { useEffect, useRef, useState } from 'react';
import 'xterm/css/xterm.css';
import { useTerminal } from '../hooks/useTerminal';
import { AskAIButton } from '../../llm/ui/AskAIButton';

interface Shell {
    name: string;
    value: string;
}

export const WebTerminal = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { terminal, fitAddonRef, socketRef, isConnected } = useTerminal();
    const [shells, setShells] = useState<Shell[]>([]);
    const [selectedShell, setSelectedShell] = useState<string>('');
    const [isSessionActive, setIsSessionActive] = useState(false);

    // Line buffering state
    const inputBuffer = useRef<string>('');

    useEffect(() => {
        if (isConnected && socketRef.current) {
            // Request available shells
            socketRef.current.emit('terminal:shells', {}, (response: Shell[]) => {
                setShells(response);
                if (response.length > 0) {
                    setSelectedShell(response[0].value);
                }
            });
        }
    }, [isConnected, socketRef]);

    useEffect(() => {
        if (containerRef.current && terminal) {
            terminal.open(containerRef.current);

            // Delay fit() to ensure terminal is fully initialized
            setTimeout(() => {
                fitAddonRef.current?.fit();
            }, 0);

            const term = terminal;

            // Handle resize
            const handleResize = () => fitAddonRef.current?.fit();
            window.addEventListener('resize', handleResize);

            // Custom Input Handling (Cooked Mode / Line Buffering)
            // This solves the Backspace issue in non-PTY environments
            const disposable = term.onData((data) => {
                if (!socketRef.current) return;

                const code = data.charCodeAt(0);

                // Handle Escape Sequences (Arrow keys, Alt keys, etc.) and Control Characters (Ctrl+C, etc.)
                // excluding Enter (13) which is handled by the buffer logic
                if (data.length > 1 || (code < 32 && code !== 13)) {
                    socketRef.current.emit('terminal:input', data);
                    return;
                }

                // Enter key (13)
                if (code === 13) {
                    term.write('\r\n');
                    socketRef.current.emit('terminal:input', inputBuffer.current + '\r\n');
                    inputBuffer.current = '';
                }
                // Backspace (127)
                else if (code === 127) {
                    if (inputBuffer.current.length > 0) {
                        // Remove last char from buffer
                        inputBuffer.current = inputBuffer.current.slice(0, -1);
                        // Visual backspace: Move back, print space, move back
                        term.write('\b \b');
                    }
                }
                // Printable characters
                else {
                    inputBuffer.current += data;
                    term.write(data); // Local echo
                }
            });

            return () => {
                window.removeEventListener('resize', handleResize);
                disposable.dispose();
            };
        }
    }, [terminal, fitAddonRef, socketRef]);

    const startSession = () => {
        if (socketRef.current && selectedShell) {
            socketRef.current.emit('terminal:create', selectedShell);
            setIsSessionActive(true);
            terminal?.focus();
        }
    };

    return (
        <div className="flex flex-col h-80 w-full bg-black rounded-t-lg border-t border-border">
            <div className="flex items-center justify-between p-2 bg-secondary/20 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">Terminal</span>
                    {!isSessionActive && (
                        <div className="flex gap-2">
                            <select
                                className="bg-background text-foreground text-xs border rounded px-2 py-1"
                                value={selectedShell}
                                onChange={(e) => setSelectedShell(e.target.value)}
                            >
                                {shells.map(shell => (
                                    <option key={shell.value} value={shell.value}>{shell.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={startSession}
                                className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded hover:bg-primary/90"
                            >
                                Start
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    {isSessionActive && socketRef.current && (
                        <AskAIButton terminalClientId={socketRef.current.id} />
                    )}
                </div>
            </div>
            <div className="flex-1 p-2 overflow-hidden">
                <div ref={containerRef} className="h-full w-full" />
            </div>
        </div>
    );
};
