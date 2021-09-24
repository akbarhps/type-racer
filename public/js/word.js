class Word {

    word;
    index;
    html;
    characters = [];

    constructor(word, index) {
        this.word = word;
        this.index = index;

        this.html = document.createElement('div');
        this.html.className += ' words';
        this.html.id = `word-${index}`;

        for (let charIndex = 0; charIndex < word.length; charIndex++) {
            const char = new Character(index, charIndex, word[charIndex]);
            this.characters.push(char);
            this.html.appendChild(char.html);
        }
    }

    update(input) {
        for (let i = 0; i < this.word.length; i++) {
            let c = this.word[i];
            let correction = i < input.length ? input[i] === c ? 'correct' : 'incorrect' : '';
            this.characters[i].toggleCorrection(correction);
        }
    }

    toggleActivation(isActive) {
        for (let char of this.characters) {
            if (isActive) char.setActive();
            else char.reset();
        }
    }

    setCharCorrection(index, correction) {
        this.characters[index].toggleCorrection(correction);
    }

    remove() {
        if (this.html) this.html.parentNode.removeChild(this.html);
    }
}