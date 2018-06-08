const Player    = require('./_Player');
const Moderator = require('./_Moderator');


class Game {

    constructor (server) {
        this._server = server;
        this._questions = [{foo: 'bar'}, {baz: 'boo'}];
        this._actualQuestion = 0;

        this._players = [];
        this._moderator = null;

        this.registerEvents();
    }

    _findBySocketId (id) {
        return this._players.find(p => p.getId() === id);
    }

    _findIndexBySocketId (id) {
        return this._players.findIndex(p => p.getId() === id);
    }

    _on (evt, callback) {
        this._server.on(evt, callback);
    }

    _addPlayer (socket) {
        console.log('Adding player');
        let player = new Player(socket.id, socket, false);
        this._players.push(player);

        this._updatePlayersCount();

        player._on('ready', this._updateReady.bind(this));

        socket.on('disconnect', this._removePlayer.bind(this, socket));
    }

    _removePlayer (socket) {
        console.log('removing Player');
        let idx = this._findIndexBySocketId(socket.id);
        if (idx !== -1) this._players.splice(idx, 1);
    }

    _addModerator (socket) {
        console.log('adding Moderator.');
        this._moderator = new Moderator(socket.id, socket, false);

        this._moderator._on('question', this._sendNextQuestion.bind(this));
    }

    _updatePlayersCount () {
        console.log('updating players-count');
        this._server.sockets.emit('players-count', this._players.length);
    }

    _updateReady () {
        console.log('Updating readiness');
        let playersReadyCount = this._players.filter(p => p.ready).length;
        if (this._players.length && playersReadyCount === this._players.length) {
            console.log('Noticing moderator');
            this._moderator._emit('players-ready', true);
        }
    }

    _handleConnection (socket) {
        console.log('handle connection');
        if (socket.handshake.query.secret === 'Trippy') {
            this._addModerator(socket)
        }
        else {
            this._addPlayer(socket);
        }
    }

    _sendNextQuestion () {
        console.log('sending next question');
        this._actualQuestion++;
        let question = this._questions[this._actualQuestion - 1];

        let sendRemainingSeconds = (remaining, callback) => {
            this._server.sockets.emit('time', remaining);
            remaining -= 1000;
            console.log((remaining / 1000) + 's left');
            if (remaining > 0) setTimeout(sendRemainingSeconds.bind(this, remaining, callback), 1000);
            else callback();
        };

        this._server.sockets.emit('question', question);

        sendRemainingSeconds(15000, () => {
            console.log('Time over');
            this._server.sockets.emit('time-over');
        });
    }


    registerEvents () {
        console.log('Register events');
        this._on('connection', this._handleConnection.bind(this));
    }

}

module.exports = Game;