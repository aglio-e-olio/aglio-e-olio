const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);
const axios = require('axios');
const path = require('path');

const cors = require('cors')

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/mongoose';

/* DB Connection */
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI)
  .then(()=>console.log("Successfully connected to mongodb"))
  .catch(e=>{
      console.error(e);
  })

/* Cors */
app.use(cors({
  origin:'*'
}))

/* middleware setting */
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



/* routing */
app.use('/myroom', require('./routes/myroom'));


app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const users = {};

const socketToRoom = {};

io.on('connection', (socket) => {
  console.log(`${socket.id} 가 서버에 연결됨`);
  socket.on('join room', (roomID) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit('room full');
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }

    //socket roomID랑 조인하기
    socket.join(roomID);
    // 같은 방에 있는 소켓들에게 인사하기.
    socket.to(roomID).emit("hello", socket.id);

    socketToRoom[socket.id] = roomID;

    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

    // 본인을 제외한 같은 room의 user array
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit('all users', usersInThisRoom);
  });

  socket.on('sending signal', (payload) => {
    io.to(payload.userToSignal).emit('user joined', {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });
  socket.on('returning signal', (payload) => {
    io.to(payload.callerID).emit('receiving returned signal', {
      signal: payload.signal,
      id: socket.id,
    });
  });
  // user가 연결이 끊겼을 때 처리
  socket.on('disconnect', () => {
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
    // disconnect한 user가 포함된 roomID
    const roomID = socketToRoom[socket.id];
    // room에 포함된 유저
    let room = users[roomID];
    // room이 존재한다면(user들이 포함된)
    if (room) {
      // disconnect user를 제외
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
      // room 에 아무도 없다면 방 지우기.
      if (room.length === 0) {
        delete users[roomID];
        return;
      }
    }
    socket.to(roomID).emit('bye', socket.id);
    //방에 남아있는 사람 콘솔.
    console.log(users);
  });

  socket.on('code compile', (payload) => {
    const url = 'https://api.jdoodle.com/v1/execute';

    const sendData = {
      // put your own client id and client secret of jdoodle
      clientId: '29c0d13db4b041ca805305faac6c9155',
      clientSecret:
        '73a9ee5ae33448935b7736ef5c9bdcbdf8365da265cdbc036842db09edad5372',
      script: payload.codes,
      stdin: '',
      language: 'nodejs',
      versionIndex: '3',
    };

    let response = {};
    try {
      response = axios({
        method: 'post', //you can set what request you want to be
        url,
        data: sendData,
      }).then((response) => {
        rooms[payload.roomID].forEach((userID) => {
          io.to(userID).emit('code response', response.data.output);
        });
      });
    } catch (e) {
      response = e;
      return {
        data: {
          e: 'Error:404\nOops Something went wrong\n😢😞🙁',
        },
      };
    }
  });
});

server.listen(process.env.PORT || 8000, () =>
  console.log('server is running on port 8000')
);
