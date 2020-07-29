class UsersMap {
  constructor() {
    this.users = new Map();
    this.rooms = new Map();
  }

  add(user) {
    this.users.set(user.socket, user.user);
    this.rooms.set(user.socket, user.room);
    this.getAllSockets();
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
