const responses = require('./message-type-for-publish');

module.exports.newMessage = (publisher, { room, author, message } = data) => {
	const newMessage = JSON.stringify(responses.message(room, author, message));
	publisher.publish('message', newMessage);
};
