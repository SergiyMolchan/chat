const path  = require('path');
const express  = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

//app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, '/public'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 4000;


io.on('connection', socket => {
  console.log('conected')

  socket.on('message', data => {
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('disconnect')
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