import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WorkflowStep {
    id: string;
    stepName: string;
    status: string;
    resultSummary?: string;
    startedAt?: string;
    completedAt?: string;
}

interface WorkflowJob {
    id: string;
    issueId: string;
    status: string;
    isAutoMode: boolean;
    currentStepIndex: number;
    steps: WorkflowStep[];
}

const SOCKET_URL = 'http://localhost:3000/workflow';

export const useWorkflow = (jobId?: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [job, setJob] = useState<WorkflowJob | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('workflow:update', ({ jobId: updatedJobId }) => {
            if (updatedJobId === jobId) {
                // Re-fetch job data
                fetchJob();
            }
        });

        newSocket.on('workflow:approval-needed', ({ jobId: approvalJobId }) => {
            if (approvalJobId === jobId) {
                fetchJob();
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [jobId]);

    const fetchJob = async () => {
        if (!jobId) return;
        try {
            const response = await fetch(`http://localhost:3000/api/workflows/${jobId}`);
            const data = await response.json();
            setJob(data);
        } catch (error) {
            console.error('Failed to fetch workflow:', error);
        }
    };

    useEffect(() => {
        if (jobId && socket) {
            socket.emit('workflow:subscribe', { jobId });
            fetchJob();

            return () => {
                socket.emit('workflow:unsubscribe', { jobId });
            };
        }
    }, [jobId, socket]);

    const approveNext = async () => {
        if (!jobId) return;
        try {
            await fetch(`http://localhost:3000/api/workflows/${jobId}/approve`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to approve:', error);
        }
    };

    return { job, isConnected, approveNext };
};
