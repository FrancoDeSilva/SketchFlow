import { randomUUID } from "crypto";
import { Server } from "socket.io";

interface Room {
    roomName: string;
    users: string[];
    room_id: string;
}

const rooms: Room[] = [];

const io = new Server({
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // Create a room
    socket.on("create room", (roomName: string) => {

        const room: Room = {
            roomName: roomName,
            users: [socket.id],
            room_id: randomUUID(),
        };

        rooms.push(room);

        socket.join(room.room_id);

        console.log("Room created:", room);
    });


    // Get all rooms
    socket.on("get room", (callback) => {

        callback(
            rooms.map((room) => ({
                name: room.roomName,
                id: room.room_id,
            }))
        );

    });


    // Join a room
    socket.on("join room", (room_id: string) => {

        const room = rooms.find(
            (room) => room.room_id === room_id
        );

        if (room) {

            room.users.push(socket.id);

            socket.join(room_id);

            console.log(
                `${socket.id} joined room ${room.roomName}`
            );

        } else {

            console.log("Room not found");

        }
    });


    // Disconnect
    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

        // Remove user from rooms
        rooms.forEach((room) => {
            room.users = room.users.filter(
                (userId) => userId !== socket.id
            );
        });

    });

});


io.listen(3000);

console.log("Server started on port 3000");