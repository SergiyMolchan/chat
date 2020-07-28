class Users {
  constructor() {
    this.users = [];
  }

  add(user) {
    this.users.push(user);
  }

  get(socket) {
    return this.users.find(user => user.socket === socket);
  }

  remove(socket) {
    const user = this.get(id);

    if (user) {
      this.users = this.users.filter(user => user.socket !== socket);
    }
    return this.users;
  }

  removeBySocket(socket) {
    const user = this.get(socket);

    if (user) {
      this.users = this.users.filter(user => user.socket !== socket);
    }
    return this.users;
  }

  getAll() {
    return this.users;
  }

  getByRoom(room) {
    return this.users.filter(user => user.room === room);
  }

}

module.exports = new Users();
