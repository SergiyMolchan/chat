const path = require('path');
const express = require('express');
const app = express();
const WebwsServer = require('ws');
const users = require('./Users');
const redis = require("redis");
const subscriber = redis.createClient();
const publisher = redis.createClient();

app.use(express.static(path.join(__dirname, '/build'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 8080;

const ws = new WebwsServer.Server({port: PORT + 1});

subscriber.on('connect', () => {
  console.log('subscriber connected', PORT);
});

publisher.on('connect', () => {
  console.log('publisher connected', PORT);
});

subscriber.subscribe('message');
subscriber.subscribe('usersListMessage');

ws.on('connection', function connection(ws, req) {
  const id = req.socket.remoteAddress + Math.random();
  // message contain fields data (data format JSON) and type
  ws.on('message', message => {
    const {type, data} = JSON.parse(message);

    // user connect in room
    if (type === 'userJoinInRoom') {
      console.log('joined');

      const user = data;
      users.remove(id);
      users.add({
        id: id,
        room: user.room,
        user: user.user,
        socket: ws
      });

      const dataForUser = {
        type: 'id',
        data: {userId: id}
      };

      const welcomeMessage = {
        type: 'message',
        data: {room: data.room, author: 'room', message: `Welcome ${user.user}.`}
      };

      // this message do not send because bag
      const message = {
        type: 'message',
        data: {room: data.room, author: 'room', message: `User ${user.user} join in room.`}
      };

      const usersListMessage = {
        type: 'updateUsers',
        data: {room: data.room, users: users.getByRoom(user.room)}
      };

      publisher.publish('usersListMessage', JSON.stringify(usersListMessage));
      publisher.publish('message', JSON.stringify(message));

      ws.send(JSON.stringify(welcomeMessage));
      ws.send(JSON.stringify(usersListMessage));
      ws.send(JSON.stringify(dataForUser));

    }
    // new message
    if (type === 'message') {
      const message = {
        type: 'message',
        data: {room: data.room, author: data.author, message: data.message}
      };

      publisher.publish('message', JSON.stringify(message));
    }
    // user left from room
    if (type === 'userLeftFromRoom') {
      console.log('left');
      const {id, user} = data;
      users.remove(id);

      // this message do not send because bag
      const message = {
        type: 'message',
        data: {room: data.room, author: 'room', message: `User ${user} left from room.`}
      };

      const usersListMessage = {
        type: 'updateUsers',
        data: {room: data.room, users: users.getByRoom(data.room)}
      };

      publisher.publish('usersListMessage', JSON.stringify(usersListMessage));
      publisher.publish('message', JSON.stringify(message));
    }


  });

});

// listener messages from redis
subscriber.on('message', (channel, mess) => {
  const {data} = JSON.parse(mess);
  // update users list at join room and exit from room
  if (channel === 'usersListMessage') {
    users.getAll().forEach(client => {
      console.log('ok', channel, 'room', client.room === data.room);
      if (client.room === data.room) {
        console.log("User update Redis");
        client.socket.send(mess);
      }
    });
  }
  // get message from redis then send message all users in room
  if (channel === 'message') {
    console.log('mess Redis', mess);
    users.getAll().forEach(client => {
      if (client.room === data.room) {
        client.socket.send(mess);
      }
    });
  }
});

(function start() {
  try {
    app.listen(PORT, () => {
      console.info(`Server is runing on ${PORT}`);
    })
  } catch (error) {
    throw Error(error);
  }
})();

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});
