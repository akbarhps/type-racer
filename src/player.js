module.exports = class Player {
    id;
    username;
    rank = 0;
    isWaiting = false;
    progress = 0;

    constructor(id, username) {
        // this.id = Math.floor(Math.random() * 1000000);
        this.id = id;
        this.username = username;
    }

    reset() {
        this.rank = 0;
        this.progress = 0;
    }
}