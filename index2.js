const express = require('express');
const path = require('path');
const redis = require('redis');
const {Server: WSServer} = require('ws');
const usersMap = require('./users-map');
const userListPublishers = require('./publishers/user-list-publishers');
const messagePublisher = require('./publishers/message-publisher');
const updateUserSubscriber = require('./subscribers/update-user-subscriber');
const newMessageSubscriber = require('./subscribers/message-subscriber');
const app = express();
const subscriber = redis.createClient();
const publisher = redis.createClient();

app.use(express.static(path.join(__dirname, '/build'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 8000;

const ws = new WSServer({server: start()});

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

    if (type === 'userJoinInRoom') { // user connect in room
      console.log('joined');
      userListPublishers.addUser(publisher, ws, data);
    } else if (type === 'message') { // new message
      messagePublisher.newMessage(publisher, data);
    } else if (type === 'userLeftFromRoom') { // user left from room
      console.log('left');
      userListPublishers.removeUser(publisher, ws);
    }

  });
});

// close the connection with the user who dropped the connection
const interval = setInterval(() => {
  usersMap.getAllSockets().forEach(user => {
    if (user.socket.isAlive === false) {
      userListPublishers.removeUser(publisher, user.socket);
      return user.socket.terminate();
    }
    user.socket.isAlive = false;
    // console.log('ping start: ', user, 'ping end');
    user.socket.ping();
  });
}, 30000);

ws.on('close', () => {
  clearInterval(interval);
});

// listener messages from redis
subscriber.on('message', (channel, mess) => {
  if (channel === 'usersListMessage') { // update users list at join room and exit from room
    updateUserSubscriber(mess);
  } else if (channel === 'message') { // get message from redis then send message all users in room
    newMessageSubscriber(mess);
  }
});

function start() {
  try {
    // usersMap.init();
    return app.listen(PORT, () => {
      console.info(`Server is running on ${PORT}`);
    })
  } catch (error) {
    throw Error(error);
  }
}
