// websocket-server.ts
import { Server } from 'socket.io';
import { NotificationPayload } from './index';

const io = new Server(3001, {
    cors: { origin: '*' },
});

export const emitNotification = (notification: NotificationPayload) => {
    io.to(notification.clientId).emit('notification', notification);
};

io.on('connection', socket => {
    const clientId = socket.handshake.query.clientId as string;
    if (clientId) {
        socket.join(clientId);
    }
});
