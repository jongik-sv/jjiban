import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'workflow',
})
export class WorkflowGateway {
    @WebSocketServer()
    server: Server;

    broadcastWorkflowUpdate(jobId: string) {
        this.server.emit('workflow:update', { jobId });
    }

    requestApproval(jobId: string, nextStepIndex: number) {
        this.server.emit('workflow:approval-needed', { jobId, nextStepIndex });
    }

    @SubscribeMessage('workflow:subscribe')
    handleSubscribe(
        @MessageBody() data: { jobId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`workflow:${data.jobId}`);
        return { subscribed: true, jobId: data.jobId };
    }

    @SubscribeMessage('workflow:unsubscribe')
    handleUnsubscribe(
        @MessageBody() data: { jobId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(`workflow:${data.jobId}`);
        return { unsubscribed: true, jobId: data.jobId };
    }
}
