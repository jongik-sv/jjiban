import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = 'http://localhost:3000/kanban';

export const useKanbanSocket = (projectId: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket: Socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to Kanban WebSocket');
            socket.emit('joinProject', projectId);
        });

        socket.on('issue:moved', (issue) => {
            console.log('Issue moved:', issue);
            queryClient.invalidateQueries({ queryKey: ['issues'] });
        });

        socket.on('issue:created', (issue) => {
            console.log('Issue created:', issue);
            queryClient.invalidateQueries({ queryKey: ['issues'] });
        });

        return () => {
            socket.emit('leaveProject', projectId);
            socket.disconnect();
        };
    }, [projectId, queryClient]);
};
