class CharacterView extends HTMLElement {

    elementText;

    constructor(elementText) {
        super(); 
        this.elementText = elementText;
    }

    connectedCallback() {
        this.innerText = this.elementText;
        this.className = 'chars';
    }

    get state() {
        return this.getAttribute('state');
    }

    set state(val) {
        switch (val) {
            case true:
                this.setAttribute('state', 'true');
                this.style.color = '#00ff00';
                break;
            case false:
                this.setAttribute('state', 'false');
                this.style.color = 'red';
                break;
            default:
                this.removeAttribute('state');
                this.style.color = 'white';
        }
    }
}

customElements.define('char-view', CharacterView);