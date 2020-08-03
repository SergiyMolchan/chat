const usersRedis = require('./users-redis');

class UsersMap {
	constructor() {
		this.users = new Map();
		this.rooms = new Map();
		this.usersListInRoom = [];
	}

	init() {
		usersRedis.clearListUsersInRedis().then();
		// usersRedis.getAllSockets().then(users => {
		//   users.forEach(user => {
		//     console.log('Users from redis: \n', user);
		//     this.users.set(user.socket, user.user);
		//     this.rooms.set(user.socket, user.room);
		//   });
		// });
	}

	add(user) {
		// const ws = JSON.stringify(user.socket);
		// console.log('socket test: ', JSON.stringify(user.socket) === ws); // true

		this.users.set(user.socket, user.user);
		this.rooms.set(user.socket, user.room);
		usersRedis.add(user);
		// console.log(this.rooms);
	}

	getName(socket) {
		return this.users.get(socket);
	}

	getRoom(socket) {
		return this.rooms.get(socket);
	}

	getAllSockets() {
		const rooms = [];
		for (let [key, value] of this.rooms.entries()) {
			rooms.push({ room: value, socket: key });
		}
		return rooms;
	}

	async getByRoom(room) {
		try {
			// const users = [];
			// for (let [key, value] of this.rooms.entries()) {
			//   if (value === room) {
			//       users.push({user: this.users.get(key)});
			//   }
			// }
			return await usersRedis.getByRoom(room);
		} catch (err) {
			console.log(err);
		}
	}

	async removeBySocket(socket) {
		const user = { user: this.getName(socket), room: this.getRoom(socket) };
		this.rooms.delete(socket);
		this.users.delete(socket);
		return await usersRedis.removeBySocket(user);
	}

}

module.exports = new UsersMap();
