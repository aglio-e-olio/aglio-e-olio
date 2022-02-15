const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const axios = require("axios");

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }

    const otherUsersInRoom = rooms[roomID].filter((id) => id !== socket.id);
    if (otherUsersInRoom) {
      socket.emit("other user", otherUsersInRoom);
    }
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });
  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });
  socket.on("code compile", (payload) => {
    const url = "https://api.jdoodle.com/v1/execute";

    const sendData = {
        // put your own client id and client secret of jdoodle
      clientId: "",
      clientSecret: "",
      script: payload.codes,
      stdin: "",
      language: "python3",
      versionIndex: "3",
    };

    let response = {};
    try {
      response = axios({
        method: "post", //you can set what request you want to be
        url,
        data: sendData,
      }).then((response) => {
          rooms[payload.roomID].forEach((userID) => {
            io.to(userID).emit("code response", response.data.output);
          })
      })
    } catch (e) {
      response = e;
      return {
        data: {
          e: "Error:404\nOops Something went wrong\n😢😞🙁",
        },
      };
    }
  });
});

server.listen(8000, () => console.log("server is running on port 8000"));
