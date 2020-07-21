const path  = require('path');
const express  = require('express');
const app = express();
const WebwsServer = require('ws');
const users = require('./Users');

app.use(express.static(path.join(__dirname, '/build'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 4000;

const ws = new WebwsServer.Server({port: PORT + 1});

ws.on('connection', function connection(ws, req) {
  const id = req.socket.remoteAddress + Math.random();
  // message contain fields data (data format JSON) and type
  ws.on('message', message => {
    const {type, data} = JSON.parse(message);

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

      const welcomeMessage = {
        type: 'message',
        data: {userId: id, author: 'room', message: `Welcome ${user.user}.`}
      };

      const message = {
        type: 'message',
        data: {author: 'room', message: `User ${user.user} join in room.`}
      };

      const usersListMessage = {
        type: 'updateUsers',
        data: {users: users.getByRoom(user.room)}
      };

      ws.send(JSON.stringify(welcomeMessage));
      ws.send(JSON.stringify(usersListMessage));

      users.getAll().forEach(client => {
        if (client.socket.readyState === ws.OPEN && client.user !== data.user) {
          if (client.room === data.room) {
            client.socket.emit('message', JSON.stringify(message));
          }
        }
        if (client.room === data.room) {
          client.socket.send(JSON.stringify(usersListMessage));
        }
      });

    } else if (type === 'message') {
      const message = {
        type: 'message',
        data: {author: data.author, message: data.message}
      };

      users.getAll().forEach(client => {
        if (client.room === data.room) {
          client.socket.send(JSON.stringify(message));
        }
      });

    } else if (type === 'close') {
      const message = {
        type: 'message',
        data: {author: 'room', message: `User `}
      };

      users.getAll().forEach(client => {
        if (client.socket.readyState === ws.OPEN) {
          client.socket.send(JSON.stringify(message));
        }
      });
    }
  });

});


//   ws.on('userLeftFromRoom', () => {
//     if (users.get(ws.id)) {
//       const user = users.get(ws.id);
//       users.remove(ws.id);
//       ws.to(user.room).emit('message', JSON.stringify({author: 'Room', message: `${user.user} is left in room.`}));
//       ws.to(user.room).emit('updateUsers', JSON.stringify({users: users.getByRoom(user.room)}));
//     }
//   });
//
//   ws.on('disconnect', () => {
//     if (users.get(ws.id)) {
//       const user = users.get(ws.id);
//       users.remove(ws.id);
//       ws.to(user.room).emit('message', JSON.stringify({author: 'Room', message: `${user.user} is left in room.`}));
//       ws.to(user.room).emit('updateUsers', JSON.stringify({users: users.getByRoom(user.room)}));
//     }
//   });
// });

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
