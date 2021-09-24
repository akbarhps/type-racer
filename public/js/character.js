class Character {

    char;
    wordIndex;
    charIndex;
    html;

    constructor(wordIndex, charIndex, char) {
        this.wordIndex = wordIndex;
        this.charIndex = charIndex;
        this.char = char;

        let className = ' chars';
        if (wordIndex === 0) className += ' active';

        this.html = document.createElement('span');
        this.html.innerText = char;
        this.html.className += className;
        this.html.id = `word-${wordIndex} char-${charIndex}`;
    }

    toggleCorrection(state) {
        if (state === 'correct' || state === 'incorrect') {
            this.html.className += ` ${state}`;
        } else {
            this.html.classList.remove('correct', 'incorrect');
        }
    }

    setActive() {
        this.html.className += ' active';
    }

    reset() {
        this.html.classList.remove('correct', 'incorrect', 'active');
    }
}