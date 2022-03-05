const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);
const axios = require('axios');
const path = require('path');

const cors = require('cors');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('./config/winston');
const morgan = require('morgan');

const combined = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
const morganFormat = process.env.NODE_ENV !=="production" ? "dev" : combined;

const MONGO_URI = 'mongodb://localhost:27017/mongoose';

/* DB Connection */
mongoose.Promise = global.Promise;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Successfully connected to mongodb'))
  .catch((e) => {
    console.error(e);
  });

/* Cors */
app.use(
  cors({
    origin: '*',
  })
);

/* middleware setting */
app.use(morgan(combined, {stream: logger.stream}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* routing */
app.use('/api_test', require('./routes/api_test'));
app.use('/myroom', require('./routes/myroom'));

/**
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
 */

const users = {};
// const usersName = {};
const socketToRoom = {};
const userToRoom = {}; // socket.id로 persistUser 얻기위해.

io.on('connection', (socket) => {
  console.log(`socket.id : ${socket.id}  서버에 연결`);
  socket.on('join room', ({ roomID, persistUser, persistEmail }) => {
    console.log('들어온 방은 ', roomID);
    console.log('들어온 유저는', persistUser);
    console.log('들어온 메일은', persistEmail);

    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit('room full');
        return;
      }
      if (users[roomID].includes(socket.id)) {
        socket.emit('already exist');
        return;
      }
      users[roomID].push(socket.id);
      // usersName[socket.id].push(persistUser);
    } else {
      users[roomID] = [socket.id];
      // usersName[socket.id] = [persistUser];
    }

    //socket roomID랑 조인하기
    socket.join(roomID);
    // 같은 방에 있는 소켓들에게 인사하기.
    socket.to(roomID).emit('hello', persistUser);

    socketToRoom[socket.id] = roomID;
    userToRoom[socket.id] = persistUser;

    console.log(
      `[roomID: ${socketToRoom[socket.id]}], 신규입장 socketID: ${socket.id}`
    );

    // 본인을 제외한 같은 room의 user array
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit('all users', { users: usersInThisRoom, names: userToRoom });
  });

  socket.on('sending signal', (payload) => {
    io.to(payload.userToSignal).emit('user joined', {
      signal: payload.signal,
      callerID: payload.callerID,
      names: userToRoom,
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
    console.log(
      `roomID: ${socketToRoom[socket.id]}, 퇴장 socketID: ${socket.id}`
    );
    // disconnect한 user가 포함된 roomID
    const roomID = socketToRoom[socket.id];
    const persistUser = userToRoom[socket.id];
    // room에 포함된 유저
    let room = users[roomID];
    // room이 존재한다면(user들이 포함된)
    if (room) {
      // disconnect user를 제외
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
      // room 에 아무도 없다면 방 지우기.
      if (room.length === 0) {
        console.log(`방에 아무도 없어서 ${users[roomID]} 를 삭제합니다.`);
        delete users[roomID];
        return;
      }
    }
    socket.to(roomID).emit('bye', persistUser);
    //방에 남아있는 사람 콘솔.
    console.log(users[roomID]);
  });

  socket.on('code compile', (payload) => {
    const url = 'https://api.jdoodle.com/v1/execute';
    console.log(users, "도대체 왜 없지")

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
        console.log(response.data.output, "response 보자")
        users[payload.roomInfo].forEach((userID) => {
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
