class ActiveUsersMap {
  constructor() {
    this.activeUsers = new Map(); // save unique values
  }

  setStatus(socket, status) {
    this.activeUsers.set(socket, status);
  }

  getStatus(socket) {
    return this.activeUsers.get(socket);
  }

}

module.exports = new ActiveUsersMap();
