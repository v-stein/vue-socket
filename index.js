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


class Player {
    constructor (socketId) {
        // Intel
        this.socketId = socketId;
        this.nickname = '';
        this.points = 0;

        // Logic
        this.ready = false;
        this.skip = false;
    }

    setNickname (nickname) {
        this.nickname = nickname;
    }

    getNickname () {
        return this.nickname;
    }

    setPoints (points) {
        this.points = points;
    }

    addPoints (points) {
        this.points += points;
    }

    getPoints () {
        return this.points;
    }

    resetPoints () {
        this.points = 0;
    }

    changeReadyState () {
        this.ready = !this.ready;
    }

    isReady () {
        return this.ready;
    }

    wantsToSkip () {
        this.skip = true;
    }

    resetSkip () {
        this.skip = false;
    }
}

class Game {
    constructor () {
        this.mod = null;
        this.players = [];
        this.questions = [{foo: 'bar', baz: 'boo'}];

        this.question = 0;
    }

    setMod (player) {
        this.mod = player;
        return player;
    }

    addPlayer (player) {
        this.players.push(player);
        return player;
    }

    removePlayer (playerSocketId) {
        let idx = this.players.findIndex(p => p.socketId === playerSocketId);

        this.players.splice(idx, 1);
    }

    allPlayersReady () {
        let readyPlayers = this.players.filter(p => p.isReady());

        return readyPlayers.length === this.players.length;
    }

    nextQuestion () {
        this.question++;
        return this.getQuestion();
    }

    getQuestion () {
        return this.questions[this.question - 1];
    }

    resetGame () {
        this.question = 0;
    }
}

let game = new Game();


io.on('connection', function (socket) {
    let player = new Player(socket.id);
    socket.emit('connected', true);     /** EVENT to Socket **/

    socket.on('set-nickname', function (nickname) {     /** EVENT from Socket **/
        if (typeof nickname === 'object') { // Mod
            player.setNickname(nickname.name);
            if (nickname.answer !== 42) socket.emit('not-allowed');     /** EVENT to Socket **/
            else {
                let mod = game.setMod(player);
                console.log('Moderator is ' + mod.getNickname());

                socket.on('start-game', function () {      /** EVENT from Socket **/
                    let question = game.nextQuestion();

                    for (let p of game.players) {
                        io.to(p.socketId).emit('question', question); /** EVENT to Socket **/
                    }
                })
            }
        }
        else { // Regular player
            game.addPlayer(player);
            player.setNickname(nickname);
            socket.emit('nickname-set', player.getNickname());      /** EVENT to Socket **/

            console.log('new player ' + player.getNickname());

            socket.on('set-ready', function () {        /** EVENT from Socekt **/
                player.changeReadyState();
                socket.emit('ready-state', player.isReady());       /** EVENT to Socket **/

                if (game.allPlayersReady()) {
                    console.log('All players ready')
                    io.to(game.mod.socketId).emit('players-ready');      /** EVENT to Socket **/
                }
            })
        }
    })
});


module.exports = {
    g: Game,
    p: Player,
    io: io
}