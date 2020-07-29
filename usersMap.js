const redis = require('redis');
const usersListRedis = redis.createClient();

const usersRedis = require('./usersRedis');

class UsersMap {
  constructor() {
    this.users = new Map();
    this.rooms = new Map();
  }

  add(user) {
    // test redis start

    /* set key and value */
    // usersListRedis.set(JSON.stringify(user.socket), JSON.stringify({user: user.user, room: user.room}));
    // usersListRedis.get(JSON.stringify(user.socket), (err, reply) => {
    //   console.log('Redis users - add: ', reply);
    // });

    /* delete by key */
    // usersListRedis.del(JSON.stringify(user.socket), (err, reply) => {
    //   console.log('Redis users - del: ', reply);
    // });

    /* get all keys */
    usersRedis.add(user);
    console.log('Redis users in room: ', usersRedis.getByRoom(user.room));
    // end test redis


    this.users.set(user.socket, user.user);
    this.rooms.set(user.socket, user.room);
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
      rooms.push({room: value, socket: key});
    }
    return rooms;
  }

  getByRoom(room) {
    const users = [];
    for (let [key, value] of this.rooms.entries()) {
      if (value === room) {
          users.push({user: this.users.get(key)});
      }
    }
    return users;
  }


  removeBySocket(socket) {
    this.rooms.delete(socket);
    this.users.delete(socket);
  }

}

module.exports = new UsersMap();
