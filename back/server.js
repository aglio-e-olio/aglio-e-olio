const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const axios = require("axios");
const path = require('path');

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

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
      clientId: "29c0d13db4b041ca805305faac6c9155",
      clientSecret: "73a9ee5ae33448935b7736ef5c9bdcbdf8365da265cdbc036842db09edad5372",
      script: payload.codes,
      stdin: "",
      language: "nodejs",
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

server.listen(process.env.PORT || 8000, () => console.log("server is running on port 8000"));
