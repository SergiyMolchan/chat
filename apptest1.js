const path  = require('path');
const express  = require('express');
const app = express();
const WebwsServer = require('ws');
const users = require('./Users');
const redis = require("redis");
// const subscriber = redis.createClient();
// const publisher = redis.createClient();
const redisClient = redis.createClient();

app.use(express.static(path.join(__dirname, '/build'))); //path statics
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 8070;

const ws = new WebwsServer.Server({port: PORT + 1});

redisClient.on('connect', () => {
    console.log('subscriber connected', PORT);
});

ws.on('connection', function connection(ws, req) {
    const id = req.socket.remoteAddress + Math.random();
// message contain fields data (data format JSON) and type
    ws.on('message', message => {
        const {type, data} = JSON.parse(message);

        // user connect in room
        if (type === 'userJoinInRoom') {
            console.log('joined');
            const user = data;
            users.remove(id);
            users.add({
                id: id,
                room: user.room,
                user: user.user,
                socket: ws
            });

            const dataForUser = {
                type: 'id',
                data: {userId: id}
            };

            const welcomeMessage = {
                type: 'message',
                data: {author: 'room', message: `Welcome ${user.user}.`}
            };

            // this message do not send because bag
            const message = {
                type: 'message',
                data: {author: 'room', message: `User ${user.user} join in room.`}
            };

            const usersListMessage = {
                type: 'updateUsers',
                data: {users: users.getByRoom(user.room)}
            };

            redisClient.set('usersListMessage', JSON.stringify(usersListMessage));
            redisClient.set('message', JSON.stringify(message));

            ws.send(JSON.stringify(welcomeMessage));
            ws.send(JSON.stringify(usersListMessage));
            ws.send(JSON.stringify(dataForUser));

        }
        // new message
        if (type === 'message') {
            const message = {
                type: 'message',
                data: {author: data.author, message: data.message}
            };

            redisClient.set('message', JSON.stringify(message));
        }
        // user left from room
        if (type === 'userLeftFromRoom') {
            console.log('left');
            const {id, user} = data;
            users.remove(id);

            // this message do not send because bag
            const message = {
                type: 'message',
                data: {author: 'room', message: `User ${user} left from room.`}
            };

            const usersListMessage = {
                type: 'updateUsers',
                data: {users: users.getByRoom(data.room)}
            };

            redisClient.set('usersListMessage', JSON.stringify(usersListMessage));
            redisClient.set('message', JSON.stringify(message));
        }

        //redisClient.on('ready', () => {
            redisClient.get('usersListMessage', (err, reply) => {
                if (type === 'userLeftFromRoom' || type === 'userJoinInRoom') {
                    users.getAll().forEach(client => {
                        console.log('room', client.room === data.room);
                        if (client.room === data.room) {
                            console.log("User update Redis");
                            client.socket.send(reply);
                        }
                    });
                }
            });
            redisClient.get('message', (err, reply) => {
                if (type === 'message') {
                    console.log('mess Redis');
                    users.getAll().forEach(client => {
                        if (client.room === data.room) {
                            client.socket.send(reply);
                        }
                    });
                }
            });
        //});

    });

});

(function start(){
    try {
        app.listen(PORT, () => {
            console.info(`Server is runing on ${PORT}`);
        })
    } catch (error) {
        throw Error(error);
    }
})();

app.get('*', (req, res) => {
    res.sendFile(path.resolve('public', 'index.html'));
});
