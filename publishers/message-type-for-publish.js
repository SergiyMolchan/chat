const usersMap = require('../users-map');
const usersRedis = require('../users-redis');

const responses = {
  usersListMessage: async (room) => {
    const users = await usersMap.getByRoom(room);
    return {
      type: 'updateUsers',
      data: {room, users: users}
    }
  },
  message: (room, author, message) => ({
    type: 'message',
    data: {room, author, message}
  }),
  userJoinedInRoom: (usersList, message) => ({
    type: 'userJoinedInRoom',
    data: {messageList: [usersList, message]}
  }),
  userLeftFromRoom: (usersList, message) => ({
    type: 'userLeftFromRoom',
    data: {messageList: [usersList, message]}
  })
};

module.exports = responses;
