const redis = require('redis');

class UsersRedis {
  constructor() {
    this.usersListRedis = redis.createClient();
  }

  add(user) {
    this.usersListRedis.set(JSON.stringify(user.socket), JSON.stringify({user: user.user, room: user.room}));
  }

  getByRoom(room) {
    const users = [];
    this.usersListRedis.keys('*', (err, keys) => {
      keys.map(key => {
        this.usersListRedis.get(key, (err, usersItem) => {
          const user = JSON.parse(usersItem);
          if (user.room === room) {
            users.push(usersItem);
            console.log('Redis users from all - value: ', usersItem);
          }
        });
      });
    });
    return users;
  }

}

module.exports = new UsersRedis();
