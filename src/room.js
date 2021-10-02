const {generateRandomId, generateRandomWord} = require('./helper.js');

module.exports = class Room {
    id;
    players = {};
    playersCount = 0;
    resetVoter = 0;
    currentRank = 1;
    waitingList = [];
    isPlaying = false;

    phrase = '';
    phraseLength = 0;

    constructor(id = generateRandomId(8)) {
        this.id = id;
    }

    isAvailable() {
        return !this.isPlaying && this.playersCount < 2;
    }

    join(socket, player) {
        if (this.isAvailable()) {
            this.players[player.id] = player;
            this.playersCount++;
        } else {
            if (this.waitingList.includes(player)) return;
            player.isWaiting = true;
            this.waitingList.push(player);
        }

        socket.join(this.id);
        this.broadcastToRoom(socket, 'join', player);
        this.emitToRoom(socket, 'roomInfo', {
            roomId: this.id,
            phrase: this.phrase,
            playerId: player.id,
            players: this.players,
            waitingList: this.waitingList
        });

        if (!this.isPlaying && this.playersCount >= 2) {
            this.start(socket);
        }
    }

    start(socket) {
        Object.keys(this.players).forEach(key => {
            this.players[key].isWaiting = false;
        });

        this.isPlaying = true;
        this.phrase = generateRandomWord();
        this.phraseLength = this.phrase.split(' ').length;
        this.broadcastToRoom(socket, 'start', this.phrase, true);
    }

    update(socket, player) {
        let current = this.players[player.id];
        current.progress++;

        if (current.progress >= this.phraseLength) {
            current.rank = this.currentRank;
            this.currentRank++;
        }

        // only reply to sender when finished (reduce delay)
        this.broadcastToRoom(socket, 'update', {
            id: current.id,
            rank: current.rank
        }, current.rank > 0);
    }

    voteReset(socket, playerId) {
        if (this.playersCount < 2) this.isPlaying = false;
        if (this.players[playerId]) this.resetVoter++;

        const allPlayerVote = this.resetVoter === this.playersCount;
        const halfPlayerVote = this.playersCount > 2 && this.resetVoter >= Math.ceil(this.playersCount / 2);
        if (allPlayerVote || halfPlayerVote) {
            this.reset(socket);
        } else {
            this.broadcastToRoom(socket, 'voted', playerId, true)
        }
    }

    reset(socket) {
        for (let player of this.waitingList) {
            this.players[player.id] = player;
            this.playersCount++;
        }

        Object.values(this.players).forEach(player => {
            player.reset();
        });

        this.resetVoter = 0;
        this.currentRank = 1;
        this.waitingList = [];
        this.start(socket);
    }

    removePlayer(socket, player) {
        delete this.players[player.id];
        if (this.waitingList.includes(player)) {
            this.waitingList.splice(this.waitingList.indexOf(player), 1);
        }

        this.playersCount--;
        this.broadcastToRoom(socket, 'left', player.id);

        if (this.playersCount < 2 && !this.waitingList.length) {
            this.isPlaying = false;
        }
    }

    broadcastToRoom(socket, destination, content, replyToSender = false) {
        socket.broadcast.to(this.id).emit(destination, content);
        if (replyToSender) {
            this.emitToRoom(socket, destination, content);
        }
    }

    emitToRoom(socket, destination, content) {
        socket.emit(destination, content);
    }
}