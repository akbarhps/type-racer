const PORT = process.env.PORT || 3000;
const express = require("express");
const socket = require("socket.io");
const app = express();

app.use(express.static("public"));
const server = app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
const io = socket(server);

const Room = require('./room.js');
const Player = require('./player.js');

let rooms = {};

function createRoom(id) {
    const newRoom = new Room(id);
    rooms[newRoom.id] = newRoom;
    console.log('room created', '--id', newRoom.id);
    return newRoom;
}

function findRoom() {
    for (let key of Object.keys(rooms)) {
        let current = rooms[key];
        if (current.isAvailable()) return current;
    }
}

io.sockets.on("connection", socket => {
    let room, player;

    socket.on('join', data => {
        if (!player) player = new Player(socket.id, data.username);
        if (data.roomId) {
            room = rooms[data.roomId] || createRoom(data.roomId);
        } else {
            room = findRoom() || createRoom();
        }
        room.join(socket, player);
        console.log('join', '--uid', player.id, '--username', player.username, '--roomId', room.id);
    });

    socket.on('update', () => {
        if (player) room.update(socket, player);
    });

    socket.on('vote', () => {
        if (player) room.voteReset(socket, player.id);
    });

    socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected');
        if (room) room.removePlayer(socket, player);
        room = player = undefined;
    });
});