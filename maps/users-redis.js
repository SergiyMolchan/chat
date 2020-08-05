const redis = require('redis');
const util = require('util');
const Redis = require('ioredis');
const redisClusterNodes = require('../redis-cluster-list');

class UsersRedis {
	constructor() {
		// this.usersListRedis = redis.createClient(6379, '127.0.0.1'); // default redis
		this.usersListRedis = new Redis.Cluster(redisClusterNodes, { scaleReads: 'master' });
	}

	keyGenerator(user) {
		return `${user.user}-${user.room}`;
	}

	add(user) {
	  for (const node of this.usersListRedis.nodes('master')) {
			node.set(this.keyGenerator(user), JSON.stringify({ user: user.user, room: user.room }));
		}
	}

	async getByRoom(room) {
		try {
			const users = [];

			for (const node of this.usersListRedis.nodes('slave')) {
				const getKeys = util.promisify(node.keys.bind(node));
				const getByKey = util.promisify(node.get.bind(node));
				for (const key of await getKeys('*')) {
					const userItem = await getByKey(key);
					const user = JSON.parse(userItem);
					if (user.room === room) {
						users.push(user);
					}
				}
			}

			return users;
		} catch (err) {
			console.log(err);
		}
	}

	async removeBySocket(user) {
		const removeUser = util.promisify(this.usersListRedis.del.bind(this.usersListRedis));
		return removeUser(this.keyGenerator(user));
	}

	async clearListUsersInRedis() {
		const getKeys = util.promisify(this.usersListRedis.keys.bind(this.usersListRedis));
		const removeUser = util.promisify(this.usersListRedis.del.bind(this.usersListRedis));
		for (const key of await getKeys('*')) {
			await removeUser(key);
		}
	}

}

module.exports = new UsersRedis();
