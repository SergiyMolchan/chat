const usersMap = require('../usersMap');

const newMessageSubscriber = message => {
  const {data} = JSON.parse(message);
  usersMap.getAllSockets().forEach(client => {
    if (client.room === data.room) {
      client.socket.send(message);
    }
  });
};

module.exports = newMessageSubscriber;
