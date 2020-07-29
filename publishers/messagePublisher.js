const responses = require('./messageTypeForPublish');

module.exports.newMessage = (publisher, {room, author, message} = data) => {
  const newMessage = JSON.stringify(responses.message(room, author, message));
  publisher.publish('message', newMessage);
};
