

class Moderator {
    constructor (socketId, socket, distant) {
        // Intel
        this._socketId  = socketId;
        this._socket    = socket;
        this._distant   = distant;
    }

    _emit (evt, data) {
        this._socket.emit(evt, data);
    }

    _on (evt, callback) {
        this._socket.on(evt, callback);
    }
}

module.exports = Moderator;