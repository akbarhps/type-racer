class RacerCarView extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerText = '🚗';
    }

    set progress(progress) {
        let progressInPercent = progress === 0 ? 0 : progress / wordLength * 94.5;
        this.style.marginLeft = `${progressInPercent}%`;
    }
}

customElements.define('car-view', RacerCarView);