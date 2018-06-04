

class Player {
    constructor (socketId, socket) {
        // Intel
        this._socketId = socketId;
        this._socket  = socket;
        this._nickname  = '';
        this._points    = 0;

        // Logic
        this._distant   = false; // False means we are on the server side
        this._ready     = false;
        this._answer    = null;


        this.registerEvents(this._distant);
    }

    _emit (evt, data) {
        this._socket.emit(evt, data);
    }

    _on (evt, callback) {
        this._socket.on(evt, callback);
    }

    getId () {
        return this._socketId;
    }

    setNickname (nick) {
        if (this.isDistant()) this._emit('set-nickname', nick);
        this._nickname = nick;
    }

    getNickname () {
        return this._nickname;
    }

    setPoints (points) {
        if (!this.isDistant()) this._emit('set-points', points);
        this._points = points;
    }

    addPoints (points) {
        this._points += points;
        if (!this.isDistant()) this._emit('set-points', this.getPoints());
    }

    getPoints () {
        return this._points;
    }

    ready () {
        if (this.isDistant()) this._emit('ready', true);
        this._ready = true;
    }

    unready () {
        if (this.isDistant()) this._emit('unready', true);
        this._ready = false;
    }

    isDistant () {
        return this._distant;
    }

    registerEvents () {
        this._on('set-nickname', this.setNickname);
        this._on('set-points', this.setPoints);
        this._on('ready', this.ready);
        this._on('unready', this.unready);
    }
}