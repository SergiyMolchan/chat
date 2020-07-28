const express = require('express');
const path = require('path');
const redis = require('redis');
const {Server: WSServer} = require('ws');
const users = require('./Users');
const app = express();
const subscriber = redis.createClient();
const publisher = redis.createClient();

app.use(express.static(path.join(__dirname, '/build'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 8080;

const ws = new WSServer({server: start()});

const responses = {
  usersListMessage: (room) => ({
    type: 'updateUsers',
    data: {room, users: users.getByRoom(room)}
  }),
  message: (room, author, message) => ({
    type: 'message',
    data: {room, author, message}
  }),
  userJoinedInRoom: (usersList, message) => ({
    type: 'userJoinedInRoom',
    data: {messageList: [usersList, message]}
  }),
  userLeftFromRoom: (usersList, message) => ({
    type: 'userLeftFromRoom',
    data: {messageList: [usersList, message]}
  })
};

subscriber.on('connect', () => console.log('subscriber connected', PORT));
publisher.on('connect', () => console.log('publisher connected', PORT));

subscriber.subscribe('message');
subscriber.subscribe('usersListMessage');

function heartbeat() {
  this.isAlive = true;
}

ws.on('connection', function connection(ws, req) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  // message contain fields data (data format JSON) and type
  ws.on('message', message => {
    const {type, data} = JSON.parse(message);
    // user connect in room
    if (type === 'userJoinInRoom') {
      console.log('joined');

      const user = data;
      users.removeBySocket(ws);
      users.add({
        room: user.room,
        user: user.user,
        socket: ws
      });

      const usersListMessage = JSON.stringify(responses.usersListMessage(user.room));
      const message = JSON.stringify(responses.message(data.room, 'room', `User ${user.user} join in room.`));
      const welcomeMessage = JSON.stringify(responses.message(data.room, 'room',  `Welcome in room.`));

      publisher.publish('usersListMessage', usersListMessage);
      publisher.publish('message', message);
      console.log('update',responses.userJoinedInRoom(usersListMessage, welcomeMessage));
      ws.send(JSON.stringify(responses.userJoinedInRoom(usersListMessage, welcomeMessage)));

    // new message
    } else if (type === 'message') {
      const message = JSON.stringify(responses.message(data.room, data.author, data.message));
      publisher.publish('message', message);
    // user left from room
    } else if (type === 'userLeftFromRoom') {
      console.log('left');
      const {user, room} = data;
        users.removeBySocket(ws);
        const usersListMessage = JSON.stringify(responses.usersListMessage(room));
        publisher.publish('usersListMessage', usersListMessage);
        publisher.publish('message', JSON.stringify(responses.message(room, 'room', `User ${user} left from room.`)));
    }
  });

});

const interval = setInterval(() => {
  users.getAll().forEach(user => {
    if (user.socket.isAlive === false) {
      users.removeBySocket(user.socket);
      const usersListMessage = JSON.stringify(responses.usersListMessage(user.room));
      publisher.publish('usersListMessage', usersListMessage);
      publisher.publish('message', JSON.stringify(responses.message(user.room, 'room', `User ${user.user} left from room.`)));
      return user.socket.terminate();
    }
    user.socket.isAlive = false;
    user.socket.ping();
  });
}, 30000);

ws.on('close', () => {
  clearInterval(interval);
});

// listener messages from redis
subscriber.on('message', (channel, mess) => {
  const {data} = JSON.parse(mess);
  // update users list at join room and exit from room
  if (channel === 'usersListMessage') {
    users.getAll().forEach(client => {
      if (client.room === data.room) {
        console.log("User update Redis");
        client.socket.send(mess);
      }
    });
  // get message from redis then send message all users in room
  } else if (channel === 'message') {
    console.log('mess Redis', mess);
    users.getAll().forEach(client => {
      if (client.room === data.room) {
        client.socket.send(mess);
      }
    });
  }
});

function start() {
  try {
    return app.listen(PORT, () => {
      console.info(`Server is running on ${PORT}`);
    })
  } catch (error) {
    throw Error(error);
  }
};
