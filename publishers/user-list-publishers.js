const usersMap = require('../users-map');
const responses = require('./message-type-for-publish');

module.exports.addUser = (publisher, socket, {user, room} = user) => {
  usersMap.removeBySocket(socket).then(() => {
    usersMap.add({room, user, socket});
    responses.usersListMessage(room).then(usersListMessage => {
      console.log('number of users in redis db: ', usersListMessage.data.users.length);
      const message = responses.message(room, 'room', `User ${user} join in room.`);
      const welcomeMessage = responses.message(room, 'room',  `Welcome in room.`);
      publisher.publish('usersListMessage', JSON.stringify(usersListMessage));
      publisher.publish('message', JSON.stringify(message));
      socket.send(JSON.stringify(responses.userJoinedInRoom(usersListMessage, welcomeMessage)));
    });
  });
};

module.exports.removeUser = (publisher, socket) => {
  const room = usersMap.getRoom(socket);
  const userLeftMessage = responses.message(room, 'room', `User ${usersMap.getName(socket)} left from room.`);
  usersMap.removeBySocket(socket).then(() => {
    // const usersListMessage = JSON.stringify(responses.usersListMessage(room));
    responses.usersListMessage(room).then(usersListMessage => {
      console.log('number of users in redis db: ', usersListMessage.data.users.length);
      publisher.publish('message', JSON.stringify(userLeftMessage));
      publisher.publish('usersListMessage', JSON.stringify(usersListMessage));
    });
  });
};
