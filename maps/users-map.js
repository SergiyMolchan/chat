// const usersRedis = require('./users-redis-cluster');
const usersRedis = require('./users-redis');
class UsersMap {
	constructor() {
		this.users = new Map();
		this.rooms = new Map();
	}

	init() {
		usersRedis.clearListUsersInRedis().then();
	}

	add(user) {
		this.users.set(user.socket, user.user);
		this.rooms.set(user.socket, user.room);
		usersRedis.add(user);
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
