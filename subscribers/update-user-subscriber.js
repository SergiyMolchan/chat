const usersMap = require('../maps/users-map');

const updateUser = message => {
  const {data} = JSON.parse(message);
  if (!!data) {
    usersMap.getAllSockets().forEach(client => {
      if (client.room === data.room) {
        client.socket.send(message);
      }
    });
  }
};
module.exports = updateUser;
