const usersMap = require('../usersMap');
const responses = require('./messageTypeForPublish');

module.exports.addUser = (publisher, socket, {user, room} = user) => {
  usersMap.removeBySocket(socket);
  usersMap.add({room, user, socket});

  const usersListMessage = JSON.stringify(responses.usersListMessage(room));
  const message = JSON.stringify(responses.message(room, 'room', `User ${user} join in room.`));
  const welcomeMessage = JSON.stringify(responses.message(room, 'room',  `Welcome in room.`));

  publisher.publish('usersListMessage', usersListMessage);
  publisher.publish('message', message);
  socket.send(JSON.stringify(responses.userJoinedInRoom(usersListMessage, welcomeMessage)));
};

module.exports.removeUser = (publisher, socket) => {
  const room = usersMap.getRoom(socket);
  const userLeftMessage = JSON.stringify(responses.message(room, 'room', `User ${usersMap.getName(socket)} left from room.`));
  usersMap.removeBySocket(socket);
  const usersListMessage = JSON.stringify(responses.usersListMessage(room));
  publisher.publish('message', userLeftMessage);
  publisher.publish('usersListMessage', usersListMessage);
};

