class RacerLabelView extends HTMLElement {

    labelUsername;
    labelRank;
    labelState;

    constructor() {
        super();
    }

    connectedCallback() {
        let container = document.createElement('div');
        this.labelUsername = document.createElement('span');
        this.labelRank = document.createElement('span');
        container.appendChild(this.labelUsername);
        container.appendChild(this.labelRank);
        this.appendChild(container);

        this.labelState = document.createElement('span');
        this.appendChild(this.labelState);
        this.reset();
    }

    set username(username) {
        if (username) {
            this.labelUsername.innerText = username;
            this.labelUsername.style.visibility = 'visible';
        } else {
            this.labelUsername.style.visibility = 'hidden';
        }
    }

    set state(state) {
        switch (state) {
            case 'waiting':
                state = 'Waiting';
                break;
            case 'rematch':
                state = 'Want To Rematch';
                break;
            default:
                this.labelState.style.visibility = 'hidden';
                return;
        }
        this.labelState.innerText = state;
        this.labelState.style.visibility = 'visible';
    }

    set rank(rank) {
        if (Number(rank) > 0) {
            this.labelRank.innerText = `Rank ${rank}`;
            this.labelRank.style.visibility = 'visible';
        } else {
            this.labelRank.style.visibility = 'hidden';
        }
    }

    reset() {
        this.state = '';
        this.rank = '';
    }
}

customElements.define('label-view', RacerLabelView);