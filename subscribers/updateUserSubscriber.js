const usersMap = require('../usersMap');

const updateUser = message => {
  const {data} = JSON.parse(message);
  usersMap.getAllSockets().forEach(client => {
    if (client.room === data.room) {
      client.socket.send(message);
    }
  });
};
module.exports = updateUser;
