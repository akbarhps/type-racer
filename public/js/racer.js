class Racer {

    id;
    username;
    progress = 0;
    isWaiting = false;
    isCurrentPlayer;

    htmlContainer;
    htmlName;
    htmlTrack;
    htmlCar;

    constructor(id, name, isWaiting, isCurrentPlayer = false) {
        this.id = id;
        this.username = name;
        this.isWaiting = isWaiting;
        this.isCurrentPlayer = isCurrentPlayer;

        this.htmlContainer = document.createElement('div');
        this.htmlContainer.id = `racers-${this.id}`;
        this.htmlContainer.className += `racers`;

        this.htmlName = document.createElement('p');
        this.htmlName.id = `racers-${this.id}-name`;
        this.htmlName.innerText = `${this.username} ${isCurrentPlayer ? ' (You)' : ''} ${this.isWaiting ? ' - Waiting' : ''}`;

        this.htmlTrack = document.createElement('div');
        this.htmlTrack.className += 'racer-track';

        this.htmlCar = document.createElement('div');
        this.htmlCar.id = `racers-${this.id}-car`;
        this.htmlCar.className += `racer-car`;
        this.htmlCar.innerText = '🚗';
        this.htmlCar.marginLeft = '25px';

        this.htmlTrack.appendChild(this.htmlCar);
        this.htmlContainer.appendChild(this.htmlName);
        this.htmlContainer.appendChild(this.htmlTrack);
    }

    reset() {
        this.progress = 0;
        this.htmlCar.style.marginLeft = '25px';
        this.htmlName.innerText = `${this.username} ${this.isCurrentPlayer ? ' (You)' : ''}`;
    }

    update(rank = 0) {
        this.htmlCar.style.marginLeft = `${++this.progress / wordLength * 99}%`;
        if (rank > 0) this.htmlName.innerText += ` - Rank ${rank}`;
    }

    setToWaitingState() {
        this.htmlName.innerText += ' - Want to Replay'
    }

    remove() {
        this.htmlContainer.parentNode.removeChild(this.htmlContainer);
    }
}