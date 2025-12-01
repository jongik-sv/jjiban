import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TerminalService } from './terminal.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'terminal',
})
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private terminalService: TerminalService) { }

    handleConnection(client: Socket) {
        console.log(`Terminal client connected: ${client.id}`);
        client.emit('terminal:connected', { message: '*** Connected to Backend Terminal ***' });
    }

    handleDisconnect(client: Socket) {
        console.log(`Terminal client disconnected: ${client.id}`);
        this.terminalService.removeSession(client.id);
    }

    @SubscribeMessage('terminal:shells')
    handleGetShells() {
        return this.terminalService.getAvailableShells();
    }

    @SubscribeMessage('terminal:create')
    handleCreate(@ConnectedSocket() client: Socket, @MessageBody() shellPath: string) {
        this.terminalService.createSession(client, shellPath);
    }

    @SubscribeMessage('terminal:input')
    handleInput(@ConnectedSocket() client: Socket, @MessageBody() input: string) {
        this.terminalService.handleInput(client.id, input);
    }

    @SubscribeMessage('terminal:resize')
    handleResize(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { cols: number; rows: number },
    ) {
        this.terminalService.handleResize(client.id, data.cols, data.rows);
    }
}
