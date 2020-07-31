const redis = require('redis');
const util = require('util');

class UsersRedis {
  constructor() {
    this.usersListRedis = redis.createClient();
  }

  keyGenerator(user) {
    return `${user.user}-${user.room}`;
  }

  add(user) {
    this.usersListRedis.set(this.keyGenerator(user), JSON.stringify({user: user.user, room: user.room}));
  }

  // async getUser(socket) {
  //   try {
  //     const getUser = util.promisify(this.usersListRedis.get.bind(this.usersListRedis));
  //     return await getUser(JSON.stringify(socket));
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  async getByRoom(room) {
    try {
      const users = [];
      const getKeys = util.promisify(this.usersListRedis.keys.bind(this.usersListRedis));
      const getByKey = util.promisify(this.usersListRedis.get.bind(this.usersListRedis));
      for (const key of await getKeys('*')) {
        const userItem = await getByKey(key);
        const user = JSON.parse(userItem);
        if (user.room === room) {
          users.push(user);
        }
      }
      return users;
    } catch (err) {
      console.log(err);
    }
  }

  // async getAllSockets() {
  //   try {
  //     const users = [];
  //     const getKeys = util.promisify(this.usersListRedis.keys.bind(this.usersListRedis));
  //     const getByKey = util.promisify(this.usersListRedis.get.bind(this.usersListRedis));
  //     for (const key of await getKeys('*')) {
  //       if (!!key) {
  //         const userItem = JSON.parse(await getByKey(key));
  //         users.push({user: userItem.user, room: userItem.room, socket: JSON.parse(key)});
  //       }
  //     }
  //     return users;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  async removeBySocket(user) {
    const removeUser = util.promisify(this.usersListRedis.del.bind(this.usersListRedis));
    return await removeUser(this.keyGenerator(user));
  }

  async clearListUsersInRedis () {
    const getKeys = util.promisify(this.usersListRedis.keys.bind(this.usersListRedis));
    const removeUser = util.promisify(this.usersListRedis.del.bind(this.usersListRedis));
    for (const key of await getKeys('*')) {
      await removeUser(key);
      // this.removeBySocket(key);
    }
  }

}

module.exports = new UsersRedis();
