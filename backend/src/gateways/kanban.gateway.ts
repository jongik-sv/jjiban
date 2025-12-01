import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'kanban',
})
export class KanbanGateway {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('KanbanGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinProject')
    handleJoinProject(
        @MessageBody() projectId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`project:${projectId}`);
        this.logger.log(`Client ${client.id} joined project ${projectId}`);
        return { event: 'joined', data: projectId };
    }

    @SubscribeMessage('leaveProject')
    handleLeaveProject(
        @MessageBody() projectId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(`project:${projectId}`);
        this.logger.log(`Client ${client.id} left project ${projectId}`);
        return { event: 'left', data: projectId };
    }

    // Broadcast issue update to all clients in the project
    broadcastIssueMoved(projectId: string, issue: any) {
        this.server.to(`project:${projectId}`).emit('issue:moved', issue);
    }

    broadcastIssueCreated(projectId: string, issue: any) {
        this.server.to(`project:${projectId}`).emit('issue:created', issue);
    }
}
