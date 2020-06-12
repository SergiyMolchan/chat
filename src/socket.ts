import io from 'socket.io-client';

const socket = io();
socket.connect();

export default socket;