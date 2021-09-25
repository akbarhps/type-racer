class WordView extends HTMLElement {

    elementIndex;
    elementText;
    elementChars = [];

    constructor(elementIndex, elementText) {
        super();
        this.elementText = elementText;
        this.elementIndex = elementIndex;
    }

    connectedCallback() {
        this.className = 'words';
        for (let i = 0; i < this.elementText.length; i++) {
            let char = this.elementText[i];
            let charElement = new CharacterView(char);

            this.appendChild(charElement);
            this.elementChars.push(charElement);
        }
        if (this.elementIndex === 0) this.active = true;
    }

    get active() {
        return this.hasAttribute('active');
    }

    set active(val) {
        if (val === true) {
            this.setAttribute('active', '');
            this.style.borderBottom = 'white solid thin';
        } else {
            this.removeAttribute('active');
            this.style.border = 'none';
        }
    }

    updateCorrection(comparer) {
        for (let i = 0; i < this.elementText.length; i++) {
            let char = this.elementText[i];
            let charElement = this.elementChars[i];
            charElement.state = i < comparer.length ? comparer[i] === char : undefined;
        }
    }

    clear() {
        this.remove();
    }
}

customElements.define('word-view', WordView);