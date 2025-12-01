import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const SOCKET_URL = 'http://localhost:3000/terminal';

export const useTerminal = () => {
    const socketRef = useRef<Socket | null>(null);
    const [terminal, setTerminal] = useState<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize Socket
        socketRef.current = io(SOCKET_URL);
        const socket = socketRef.current;

        // Initialize xterm.js
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
            },
            convertEol: true, // Help with line endings
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        setTerminal(term);
        fitAddonRef.current = fitAddon;

        // Socket events
        socket.on('connect', () => {
            setIsConnected(true);
            term.write('\r\n*** Connected to Backend Terminal ***\r\n');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            term.write('\r\n*** Disconnected ***\r\n');
        });

        socket.on('terminal:output', (data) => {
            term.write(data);
        });

        return () => {
            socket.disconnect();
            term.dispose();
        };
    }, []);

    return { terminal, fitAddonRef, socketRef, isConnected };
};

