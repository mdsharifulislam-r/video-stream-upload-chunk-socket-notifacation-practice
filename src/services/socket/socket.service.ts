import { Server } from "socket.io";

export const SocketService = (io:Server)=>{
    io.on('connection', (socket) => {
        console.log('A user connected',socket.id);
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
        socket.on('send-message',(message:{room:string, message:string})=>{
            console.log(`Message from ${socket.id}: ${message.message}`);
            io.to(message.room).emit('notification',`message from ${socket.id}: ${message.message}`);
            io.to(message.room).emit('receive-message',{message:message.message, sender:socket.id});
        })
    })
}