const PORT = process.env.PORT || 3000;
const express = require("express");
const socket = require("socket.io");
const app = express();
app.use(express.static("public"));

const server = app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
const io = socket(server);

let words = [
    'Yang terpenting, bukanlah seberapa besar mimpi kalian, melainkan seberapa besar upaya kalian mewujudkan mimpi itu',
    'Aku rasa hidupku seperti musik. Itu mungkin bukan musik yang bagus tapi tetap mempunyai bentuk dan irama.',
    'Bagi saya, hidup terlalu singkat untuk dilewatkan dengan biasa-biasa saja',
    'Bermimpilah dalam hidup, jangan hidup dalam mimpi.',
    'Dan Tuhan memelihara ketidakpastian itu pada seluruh umat manusia agar manusia terus belajar, terus bermimpi dan ujung-ujungnya kita akan kembali padanya.',
    'Di saat kunikmati, hidup ini indah. Dan langsung pusing ketika mulai kupikirkan',
    'Kita tak tahu dan tak pernah pasti tahu hingga semuanya berlalu. Benar atau salah, dituruti atau tidak dituruti, pada akhirnya yang bisa membuktikan cuma waktu.',
    'Orang-orang itu telah melupakan bahwa belajar tidaklah melulu untuk mengejar dan membuktikan sesuatu, namun belajar itu sendiri, adalah perayaan dan penghargaan pada diri sendiri.',
]

const randomString = (n) => {
    return [...Array(n)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
}

function randomizeWord() {
    return words[Math.floor(Math.random() * words.length)];
}

class Player {
    id;
    name;
    wordIndex = 0;
    rank = -1;

    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Game {
    id;
    word;
    wordLength;
    minPlayer = 2;
    players = {};
    playerRank = [];
    isPlaying = false;

    constructor(id) {
        this.id = id || randomString(5);
    }

    joinGame(player) {
        this.players[player.id] = new Player(player.id, player.name);
    }

    countPlayer() {
        return Object.keys(this.players).length;
    }

    isJoinAble() {
        return this.countPlayer() <= this.minPlayer && !this.isPlaying;
    }

    startGame() {
        this.word = randomizeWord();
        this.wordLength = this.word.split(' ').length;
        this.isPlaying = true;
    }

    isGameOver() {
        return this.playerRank.length === this.countPlayer();
    }

    resetGame() {
        if (!this.isGameOver()) return false;
        this.word = randomizeWord();
        this.wordLength = this.word.split(' ').length;
        this.playerRank = [];
        return true;
    }

    updatePlayerProgress(id) {
        this.players[id].wordIndex++;
    }

    deletePlayer(id) {
        delete this.players[id];
    }

    checkIfWinner(player) {
        let current = this.players[player.id];
        if (current.wordIndex === this.wordLength) {
            current.rank = this.playerRank.length + 1;
            this.playerRank.push(current);
        }
        return current;
    }
}

let games = {};

io.sockets.on("connection", socket => {
    let currentGame;
    let currentPlayer;

    socket.on('join-game', player => {
        currentGame = undefined;
        currentPlayer = player;

        if (player.roomId) {
            currentGame = games[player.roomId];
        } else {
            let keys = Object.keys(games);
            for (let key of keys) {
                const game = games[key];
                if (game.isJoinAble()) {
                    currentGame = game;
                    break;
                }
            }
        }

        if (!currentGame) {
            currentGame = new Game(player.roomId);
            games[currentGame.id] = currentGame;
        }

        currentGame.joinGame(currentPlayer);
        socket.join(currentGame.id);
        socket.emit('players', {roomId: currentGame.id, players: currentGame.players});
        socket.broadcast.to(currentGame.id).emit('join', currentPlayer);

        if (currentGame.countPlayer() >= currentGame.minPlayer) {
            currentGame.startGame();
            socket.emit('start', currentGame.word);
            socket.broadcast.to(currentGame.id).emit('start', currentGame.word);
        }
    });

    socket.on('restart', () => {
        if (!currentGame) return;
        if (currentGame.resetGame()) {
            socket.emit('start', currentGame.word);
            socket.broadcast.to(currentGame.id).emit('start', currentGame.word);
        }
    });

    socket.on('update', player => {
        currentGame.updatePlayerProgress(player.id);
        let current = currentGame.checkIfWinner(player);
        socket.emit('update', current);
        socket.broadcast.to(currentGame.id).emit('update', current);
        if (currentGame.isGameOver()) {
            socket.emit('game-over');
            socket.broadcast.to(currentGame.id).emit('game-over');
        }
    });

    socket.on("disconnect", () => {
        if (!currentGame) return;
        socket.broadcast.to(currentGame.id).emit('leave', currentPlayer);
        currentGame.deletePlayer(currentPlayer.id);
        currentPlayer = null;
    });
});