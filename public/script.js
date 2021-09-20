let socket = io.connect(window.location.origin);

let dialogJoin = document.getElementById('dialog_join_container');
let dialogJoinUsername = document.getElementById('dialog_view__username');
let dialogJoinRoomId = document.getElementById('dialog_view__room_id');
let dialogJoinButton = document.getElementById('dialog_view__button');

let dialogTimer = document.getElementById('dialog_timer_container');
let dialogTimerText = document.getElementById('dialog_view__timer');

let racerView = document.getElementById('racer_view');
let textView = document.getElementById('game_view__text');
let inputView = document.getElementById('game_view__input');

let buttonViewResetGame = document.getElementById('button_view__reset');
let buttonViewChangeRoom = document.getElementById('button_view__change_room');
let buttonViewRoomId = document.getElementById('button_view__room_id');

let wordList = [];
let racers = {};
let curRacer;

socket.on('join', player => {
    racers[player.id] = player;
    generateRacerCar(player);
});

socket.on('leave', player => {
    const racerDiv = document.getElementById(getRacerId(player.id));
    racerDiv.parentNode.removeChild(racerDiv);
    delete racers[player.id];
});

socket.on('players', data => {
    racers = data.players;
    curRacer.roomId = data.roomId;
    buttonViewRoomId.innerText = `Room Id: ${data.roomId}`;
    Object.keys(racers).forEach(key => {
        const current = racers[key];
        generateRacerCar(current);
    });
})

socket.on('start', word => {
    curRacer.wordIndex = 0;
    clearText();
    resetRacer();
    toggleButton(false);
    toggleInput(true);
    generateText(word);
    startTimer();
});

socket.on('update', player => {
    if (player.id !== curRacer.id) {
        updateRacer(player);
    } else if(player.rank > 0) {
        toggleButton(true);
    }
});

socket.on('game-over', () => {
    buttonViewResetGame.className += ' visible';
});

function startTimer() {
    dialogTimer.classList.remove('invisible');
    let i = 1;
    const interval = setInterval(function () {
        dialogTimerText.innerText = `${3 - i++}`;
        if (i > 3) {
            clearInterval(interval);
            dialogTimer.className += ' invisible';
            inputView.focus();
        }
    }, 1000)
}

dialogJoinButton.addEventListener('click', () => {
    let name = dialogJoinUsername.value;
    let roomId = dialogJoinRoomId.value;
    generatePlayer(roomId, name);
    socket.emit('join-game', curRacer);
    dialogJoin.className += ' invisible';
});

buttonViewResetGame.addEventListener('click', () => {
    socket.emit('restart', curRacer);
});

buttonViewChangeRoom.addEventListener('click', () => {
    resetUI();
    curRacer.roomId = undefined;
    socket.emit('join-game', curRacer);
});

inputView.addEventListener('input', event => {
    inputView.value = inputView.value.replace(/\s/g, '');
    let currentWord = wordList[curRacer.wordIndex];
    let currentInput = inputView.value;
    updateChars(currentInput, currentWord);

    if (event.data === ' ') {
        if (currentInput === currentWord) {
            inputView.value = '';
            updateActiveWord();
            updateRacer(curRacer);
            socket.emit('update', curRacer);
        }
    }
});

function resetRacer() {
    Object.keys(racers).forEach(key => {
        const racer = racers[key];
        racer.wordIndex = 0;
        racer.rank = -1;
        updateRacer(racer);
    });
}

function removeRacer(racer) {
    const racerDiv = document.getElementById(getRacerId(racer.id));
    racerDiv.parentNode.removeChild(racerDiv);
}

function clearText() {
    for (let wIndex = 0; wIndex < wordList.length; wIndex++) {
        const currentWord = wordList[wIndex];
        const wordDiv = document.getElementById(getWordId(wIndex));
        for (let cIndex = 0; cIndex < currentWord.length; cIndex++) {
            const charSpan = document.getElementById(getCharId(wIndex, cIndex));
            charSpan.parentNode.removeChild(charSpan);
        }
        wordDiv.parentNode.removeChild(wordDiv);
    }
}

function updateRacer(racer) {
    const racerCar = document.getElementById(getRacerCarId(racer.id));
    const racerName = document.getElementById(getRacerNameId(racer.id));

    let rank = racer.rank > 0 ? `- Rank: ${racer.rank}` : '';
    let wpm = racer.wpm ? `- ${racer.wpm} wpm` : '';

    racerName.innerText = `${racer.name} ${wpm} ${rank}`;
    racerCar.style.marginLeft = `${(racer.wordIndex) / wordList.length * 96}%`;
}

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
    const charSpan = document.getElementById(getCharId(curRacer.wordIndex, index));
    if (correction === 'correct' || correction === 'incorrect') {
        charSpan.className += ` ${correction}`;
    } else {
        charSpan.classList.remove('correct', 'incorrect');
    }
}

function updateActiveWord() {
    for (let i = 0; i < wordList[curRacer.wordIndex].length; i++) {
        const charSpan = document.getElementById(getCharId(curRacer.wordIndex, i));
        charSpan.classList.remove('active', 'correct', 'incorrect');
    }

    if (++curRacer.wordIndex >= wordList.length) {
        toggleInput(false);
        return;
    }

    for (let i = 0; i < wordList[curRacer.wordIndex].length; i++) {
        const charSpan = document.getElementById(getCharId(curRacer.wordIndex, i));
        charSpan.className += ' active';
    }
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

function generatePlayer(roomId, name) {
    let id = Math.floor(Math.random() * 100000);
    curRacer = {
        id: id,
        roomId: roomId,
        rank: -1,
        name: name,
        wordIndex: 0,
        wpm: undefined,
    }
}

function toggleButton(isShown) {
    if (isShown) {
        buttonViewChangeRoom.className += ' visible';
    } else {
        buttonViewResetGame.classList.remove('visible');
        buttonViewChangeRoom.classList.remove('visible');
    }
}

function toggleInput(isEnabled) {
    inputView.disabled = !isEnabled;
}

function resetUI() {
    Object.keys(racers).forEach(key => {
        let current = racers[key];
        removeRacer(current);
    });

    racers = {};
    clearText();
    toggleButton(false);
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