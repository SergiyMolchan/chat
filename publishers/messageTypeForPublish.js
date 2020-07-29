const usersMap = require('../usersMap');

const responses = {
  usersListMessage: (room) => ({
    type: 'updateUsers',
    data: {room, users: usersMap.getByRoom(room)}
  }),
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
