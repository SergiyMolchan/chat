const path  = require('path');
const express  = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const users = require('./Users');

app.use(express.static(path.join(__dirname, '/public'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 4000;

io.on('connection', socket => {
  socket.on('userJoinInRoom', data => {
    const user = JSON.parse(data);
    users.remove(socket.id);
    users.add({
      id: socket.id,
      room: user.room,
      user: user.user
    });
    socket.join(user.room);
    socket.emit('updateUsers', JSON.stringify({users: users.getByRoom(user.room)}));
    socket.to(user.room).emit('updateUsers', JSON.stringify({users: users.getByRoom(user.room)}));
    socket.broadcast.to(user.room).emit('message', JSON.stringify({author: 'Room', message: `${user.user} is join in room.`}));
    socket.emit('message', JSON.stringify({author: 'Room', message: `${user.user} hello.`}));
  });

  socket.on('message', data => {
    const newMessage = JSON.parse(data);
    io.to(newMessage.room).emit('message', data);
  });

  socket.on('userLeftFromRoom', () => {
    if (users.get(socket.id)) {
      const user = users.get(socket.id);
      users.remove(socket.id);
      socket.to(user.room).emit('message', JSON.stringify({author: 'Room', message: `${user.user} is left in room.`}));
      socket.to(user.room).emit('updateUsers', JSON.stringify({users: users.getByRoom(user.room)}));
    }
  });

  socket.on('disconnect', () => {
    if (users.get(socket.id)) {
      const user = users.get(socket.id);
      users.remove(socket.id);
      socket.to(user.room).emit('message', JSON.stringify({author: 'Room', message: `${user.user} is left in room.`}));
      socket.to(user.room).emit('updateUsers', JSON.stringify({users: users.getByRoom(user.room)}));
    }
  });
});

(function start(){
  try {
    http.listen(PORT, () => {
      console.info(`Server is runing on ${PORT}`);
    })
  } catch (error) {
    throw Error(error);
  }
})();

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});