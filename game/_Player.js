
const Answers = Object.freeze(
    Object.seal({
        A: 0,
        B: 1,
        C: 2,
        D: 3
    })
);


class Player {
    constructor (socketId, socket, distant) {
        // Intel
        this._socketId  = socketId;
        this._socket    = socket;
        this._nickname  = '';
        this._points    = 0;

        // Logic
        this._distant   = distant; // False means we are on the server side
        this._ready     = false;

        // Questions logic
        this._question  = null;
        this._answers   = null;
        this._answer    = null;
        this._correct   = null;


        this.registerEvents();
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
        this._points = points;
        if (!this.isDistant()) this._emit('set-points', points);
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

    answer (choice) {
        if (this.isDistant()) this._emit('answer', choice);
        this._answer = choice;
    }

    resetAnswer () {
        this._answer = null;
    }

    gotCorrect () {
        if (!this.isDistant()) return;
        this.resetAnswer();
        this._correct = true;
    }

    gotIncorrect () {
        if (!this.isDistant()) return;
        this.resetAnswer();
        this._correct = false;
    }

    resetCorrect () {
        this._correct = null;
    }

    askQuestion (detail) {
        if (!this.isDistant()) return;

        this.resetCorrect();

        this._question  = detail.question;
        this._answers   = detail.answers;
    }

    isDistant () {
        return this._distant;
    }

    registerEvents () {
        this._on('set-nickname' , this.setNickname.bind(this));
        this._on('set-points'   , this.setPoints.bind(this));
        this._on('ready'        , this.ready.bind(this));
        this._on('answer'       , this.answer.bind(this));
        this._on('unready'      , this.unready.bind(this));
        this._on('correct'      , this.gotCorrect.bind(this));
        this._on('incorrect'    , this.gotIncorrect.bind(this));
        this._on('question'     , this.askQuestion.bind(this));
    }
}

module.exports = Player;