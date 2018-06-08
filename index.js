const
    express = require('express'),
    socketIO = require('socket.io'),
    path = require('path'),
    PORT = process.env.PORT || 3000,
    INDEX = path.join(__dirname, 'index.html'),
    server = express()
        .use((req, res) => res.sendFile(INDEX))
        .listen(PORT, () => console.log(`Lisetening on ${PORT}`));

const io = socketIO(server);
const Game = require('./game/_Game');

let game = new Game(io);