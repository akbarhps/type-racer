class RacerView extends HTMLElement {

    racerName;
    isMe = false;

    racerLabel;
    racerCar;

    constructor(racerName, isMe) {
        super();

        this.racerName = racerName;
        this.isMe = isMe;
    }

    connectedCallback() {
        this.racerLabel = new RacerLabelView();
        this.racerCar = new RacerCarView();

        this.appendChild(this.racerLabel);
        this.appendChild(this.racerCar);
        this.racerLabel.username = `${this.racerName}${this.isMe ? ' - You' : ''}`;
    }

    get state() {
        return this.getAttribute('state');
    }

    set state(val) {
        if (val) {
            this.setAttribute('state', val);
            this.racerLabel.state = val;
        } else {
            this.removeAttribute('state');
        }
    }

    get progress() {
        return this.getAttribute('progress');
    }

    set progress(val) {
        if (!isNaN(Number(val))) {
            this.setAttribute('progress', val);
            this.racerCar.progress = val;
        } else {
            this.removeAttribute('progress');
        }
    }

    get rank() {
        return this.getAttribute('rank');
    }

    set rank(val) {
        if (val) {
            this.setAttribute('rank', val);
            this.racerLabel.rank = val;
        } else {
            this.removeAttribute('rank');
        }
    }

    update(rank = 0) {
        let progress = Number(this.progress);
        this.progress = progress + 1;
        this.rank = rank;
    }

    reset() {
        this.rank = 0;
        this.state = '';
        this.progress = 0;
        this.racerLabel.reset();
    }
}

customElements.define('racer-view', RacerView);