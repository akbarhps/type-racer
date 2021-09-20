let racerView = document.getElementById('racer_view');
let textView = document.getElementById('game_view__text');
let inputView = document.getElementById('game_view__input');

let words = 'Lorem ipsum dolor sit amet';
let wordList = [];
let wordIndex = 0;

let racers = [];

generateText(words);
for(let i = 0 ; i < 10; i ++) {
    generateRacerCar({id: i, name: 'stipen'});
}

inputView.addEventListener('input', event => {
    inputView.value = inputView.value.replace(/\s/g, '');
    let currentWord = wordList[wordIndex];
    let currentInput = inputView.value;

    updateChars(currentInput, currentWord);

    if (event.data === ' ') {
        if (currentInput === currentWord) {
            inputView.value = '';
            updateActiveWord();
            updateRacer({id: 0, name: 'stipen'});
        }
    }
});

function updateChars(input, currentWord) {
    for (let i = 0; i < currentWord.length; i++) {
        if (i >= input.length) {
            setCharCorrection(i);
        } else {
            const setTo = input[i] === currentWord[i] ? 'correct' : 'incorrect';
            setCharCorrection(i, setTo);
        }
    }
}

function setCharCorrection(index, correction) {
    const charSpan = document.getElementById(getCharId(wordIndex, index));
    if (correction === 'correct' || correction === 'incorrect') {
        charSpan.className += ` ${correction}`;
    } else {
        charSpan.classList.remove('correct', 'incorrect');
    }
}

function updateActiveWord() {
    for (let i = 0; i < wordList[wordIndex].length; i++) {
        const charSpan = document.getElementById(getCharId(wordIndex, i));
        charSpan.classList.remove('active', 'correct', 'incorrect');
    }

    if (++wordIndex >= wordList.length) {
        toggleInput(false);
        return;
    }

    for (let i = 0; i < wordList[wordIndex].length; i++) {
        const charSpan = document.getElementById(getCharId(wordIndex, i));
        charSpan.className += ' active';
    }
}

function updateRacer(racer) {
    const racerCar = document.getElementById(getRacerCarId(racer.id));
    const racerName = document.getElementById(getRacerNameId(racer.id));

    racerName.innerText = `${racer.name} - ${Math.floor(Math.random() * 100)} wpm`;
    racerCar.style.marginLeft = `${(wordIndex) / wordList.length * 96}%`;
}

function toggleInput(isEnabled) {
    inputView.disabled = isEnabled;
}

function generateRacerCar(racer) {
    const racerDiv = document.createElement('div');
    racerDiv.id = getRacerId(racer.id);
    racerDiv.className += `racers`;

    const racerName = document.createElement('p');
    racerName.id = getRacerNameId(racer.id);
    racerName.innerText = racer.name;

    const racerTrack = document.createElement('div');
    racerTrack.className += 'racer_track';

    const racerCar = document.createElement('div');
    racerCar.id = getRacerCarId(racer.id);
    racerCar.className += `racer_car`;

    racerTrack.appendChild(racerCar);
    racerDiv.appendChild(racerName);
    racerDiv.appendChild(racerTrack);
    racerView.appendChild(racerDiv);
}

function generateText(text) {
    wordList = text.split(' ');
    for (let wIndex = 0; wIndex < wordList.length; wIndex++) {
        const currentWord = wordList[wIndex];

        const wordSpan = document.createElement('div');
        wordSpan.className += 'words';
        wordSpan.id = getWordId(wIndex);

        for (let cIndex = 0; cIndex < currentWord.length; cIndex++) {
            const charSpan = document.createElement('span');

            charSpan.className += 'chars';
            charSpan.innerText = currentWord[cIndex];
            charSpan.id = getCharId(wIndex, cIndex);

            if (wIndex === 0) charSpan.classList += ' active';
            wordSpan.appendChild(charSpan);
        }

        textView.appendChild(wordSpan);
    }
}

function getRacerId(racerId) {
    return `racer_${racerId}`;
}

function getRacerNameId(racerId) {
    return `${getRacerId(racerId)}_name`;
}

function getRacerCarId(racerId) {
    return `${getRacerId(racerId)}_car`;
}

function getWordId(wIndex) {
    return `word-${wIndex}`;
}

function getCharId(wIndex, cIndex) {
    return `${getWordId(wIndex)} char-${cIndex}`;
}