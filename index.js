const
    express     = require('express'),
    socketIO    = require('socket.io'),
    path        = require('path'),
    PORT        = process.env.PORT || 3000,
    INDEX       = path.join(__dirname, 'index.html'),
    server      = express()
        .use((req, res) => res.sendFile(INDEX))
        .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);



let Clients = [];

/**
 * @property {number} id
 * @property {Socket} socket
 * @property {string} nickname
 */
class Client {
    constructor (socket) {
        this.id         = Clients.length + 1;
        this.socket     = socket;
        this.nickname   = '';
    }
}

function findClient (id) {
    return Clients.find(o => o.id === id)
}

function generateNewClient (socket) {
    let client = new Client(socket);
    Clients.push(client);
    return client.id;
}

function returnClientId (socket, id) {
    socket.emit('your-id', id);
}



io.on('connection', socket => {
    let id = generateNewClient(socket);
    returnClientId(socket, id);
});

io.on('set-nickname', (id, nickname) => {
    let client = findClient(id);
    client.nickname = nickname;
});

io.on('get-nickname', (id) => {
    let client = findClient(id);
    client.socket.emit('your-nickname', client.nickname);
});