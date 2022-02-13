const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const rooms = {};

io.on("connection", socket => {
    

    socket.on("join room", roomID => {
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }

        const otherUsersInRoom = rooms[roomID].filter(id =>id!==socket.id)
        if (otherUsersInRoom){
            socket.emit("other user", otherUsersInRoom);
        }
        
    });

    socket.on("sending signal", payload =>{
        io.to(payload.userToSignal).emit("user joined", {signal : payload.signal, callerID:payload.callerID})
    })
    socket.on("returning signal", payload =>{
        io.to(payload.callerID).emit("receiving returned signal", { signal: payload.signal, id: socket.id });
    })

    /**
    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        console.log(incoming);
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
     */
});


server.listen(8000, () => console.log('server is running on port 8000'));
