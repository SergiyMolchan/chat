const path  = require('path');
const express  = require('express');
const app = express();
const WebwsServer = require('ws');
const users = require('./Users');
const redis = require("redis");
const redisClient = redis.createClient();

app.use(express.static(path.join(__dirname, '/build'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 4000;

const ws = new WebwsServer.Server({port: PORT + 1});

redisClient.on('connect', () => {
  console.log('connected');
});

// redisClient.set('test', 'test');
//
// redisClient.get('test', (err, reply) => {
//   console.log('welcomeMessage', reply);
// });


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
        data: {author: 'room', message: `Welcome ${user.user}.`}
      };

      const message = {
        type: 'message',
        data: {author: 'room', message: `User ${user.user} join in room.`}
      };

      const usersListMessage = {
        type: 'updateUsers',
        data: {users: users.getByRoom(user.room)}
      };

      redisClient.set('welcomeMessage', JSON.stringify(welcomeMessage));
      redisClient.set('message', JSON.stringify(message));
      redisClient.set('usersListMessage', JSON.stringify(usersListMessage));

      redisClient.get('welcomeMessage', (err, reply) => {
        console.log('welcomeMessage', reply);
        ws.send(reply);
      });

      redisClient.get('usersListMessage', (err, reply) => {
        console.log('usersListMessage');
        ws.send(reply);
      });

      ws.send(JSON.stringify(dataForUser));

      users.getAll().forEach(client => {
        if (client.socket.readyState === ws.OPEN && client.user !== data.user) {
          if (client.room === data.room) {
            redisClient.get('message', (err, reply) => {
              console.log('message', reply);
              client.socket.send(reply);
            });
          }
        }
        if (client.room === data.room) {
          redisClient.get('usersListMessage', (err, reply) => {
            console.log('usersListMessage');
            client.socket.send(reply);
          });
        }
      });

    // new message
    } else if (type === 'message') {
      const message = {
        type: 'message',
        data: {author: data.author, message: data.message}
      };

      redisClient.set('message', JSON.stringify(message));

      users.getAll().forEach(client => {
        if (client.room === data.room) {
          redisClient.get('message', (err, reply) => {
            console.log('message', reply);
            client.socket.send(reply);
          });
        }
      });

    // user left from room
    } else if (type === 'userLeftFromRoom') {
      console.log('left');
      const {id, user} = data;
      users.remove(id);
      const message = {
        type: 'message',
        data: {author: 'room', message: `User ${user} left from room.`}
      };


      const usersListMessage = {
        type: 'updateUsers',
        data: {users: users.getByRoom(data.room)}
      };

      redisClient.set('message', JSON.stringify(message));
      redisClient.set('usersListMessage', JSON.stringify(usersListMessage));

      users.getAll().forEach(client => {
        if (client.socket.readyState === ws.OPEN && client.user !== data.user) {
          if (client.room === data.room) {
            redisClient.get('message', (err, reply) => {
              console.log('message', reply);
              client.socket.send(reply);
            });
          }
        }
        if (client.room === data.room) {
          redisClient.get('usersListMessage', (err, reply) => {
            console.log('usersListMessage');
            client.socket.send(reply);
          });
        }
      });
    }
  });

});

(function start(){
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
