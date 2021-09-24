let socket = io.connect(window.location.origin);

// base containers
const formView = document.getElementById('form_view');
const timerView = document.getElementById('timer_view');
const gameViewRacers = document.getElementById('game_view__racers');
// form
const formRoomId = document.getElementById('form_view__roomId');
const formUsername = document.getElementById('form_view__username');
const formSinglePlayerButton = document.getElementById('form_view__singlePlayer');
const formMultiPlayerButton = document.getElementById('form_view__multiPlayer');
// timer
const timerCountdown = document.getElementById('timer_view__countdown');
// content
const contentTexts = document.getElementById('content__text');
const contentInput = document.getElementById('content__input');
// dashboard
const dashboardRoomId = document.getElementById('dashboard__roomId');
const dashboardReplayButton = document.getElementById('dashboard__replay');
const dashboardBack = document.getElementById('dashboard__back');

let wordList = [];
let wordLength = 0;
let wordIndex = 0;

let racers = {};
let currentRacer;
let isSinglePlayer = false;

socket.on('roomInfo', data => {
    clearState();
    dashboardRoomId.innerText = `Room Id: ${data.roomId}`;
    if (data.phrase) wordLength = data.phrase.split(' ').length;

    Object.keys(data.players).forEach(key => {
        let current = data.players[key];
        generateRacer(current, current.id === data.playerId);
    });

    Object.keys(data.waitingList).forEach(key => {
        let current = data.waitingList[key];
        generateRacer(current, current.id === data.playerId);
    });
});

socket.on('join', data => {
    if (racers[data.id]) return;
    let racer = new Racer(data.id, data.username, data.isWaiting);
    racers[racer.id] = racer;
    gameViewRacers.appendChild(racer.htmlContainer);
});

socket.on('left', id => {
    if (racers[id]) {
        racers[id].remove();
        delete racers[id];
    }
});

socket.on('start', phrase => {
    resetState();
    generateGameContent(phrase);
    startTimer();
});

socket.on('update', data => {
    let current = racers[data.id];
    current.update(data.rank);
    if (data.id === currentRacer.id) {
        dashboardReplayButton.className += ' visible';
    }
});

socket.on('voted', playerId => {
    let current = racers[playerId];
    if (current) current.setToWaitingState();
});

formSinglePlayerButton.addEventListener('click', () => {
    resetState();
    const phrase = generateRandomPhrase();
    const username = formUsername.value || '';
    generateGameContent(phrase);
    if (!racers[0]) generateRacer({id: 0, username: username}, true);
    startTimer();
    isSinglePlayer = true;
    formView.className += ' invisible';
    dashboardRoomId.innerText = `Single Player Mode`;
});

formMultiPlayerButton.addEventListener('click', () => {
    socket.connect();
    const roomId = formRoomId.value;
    const username = formUsername.value;
    socket.emit('join', {roomId: roomId, username: username});
    isSinglePlayer = false;
    formView.className += ' invisible';
});

dashboardReplayButton.addEventListener('click', () => {
    if (isSinglePlayer) {
        const phrase = generateRandomPhrase();
        resetState();
        generateGameContent(phrase);
        startTimer();
    } else {
        socket.emit('vote');
    }
    dashboardReplayButton.classList.remove('visible');
});

dashboardBack.addEventListener('click', () => {
    socket.disconnect();
    formView.classList.remove('invisible');
});

contentInput.addEventListener('input', e => {
    contentInput.value = contentInput.value.trim();
    let word = wordList[wordIndex];
    word.update(contentInput.value);

    if (e.data === ' ' && word.word === contentInput.value) {
        contentInput.value = '';
        word.toggleActivation(false);
        if (++wordIndex < wordList.length) {
            wordList[wordIndex].toggleActivation(true);
            currentRacer.update();
        } else if (isSinglePlayer) {
            dashboardReplayButton.className += ' visible';
            currentRacer.update();
        }
        if (!isSinglePlayer) socket.emit('update');
    }
});

function clearState() {
    Object.keys(racers).forEach(key => {
        let current = racers[key];
        current.remove();
    });

    racers = {};
    resetState();
}

function resetState() {
    Object.keys(racers).forEach(key => {
        let current = racers[key];
        current.isWaiting = false;
        current.reset();
    });

    for (let word of wordList) {
        word.remove();
    }

    wordList = [];
    wordLength = 0;
    wordIndex = 0;
}

function generateGameContent(phrase) {
    let split = phrase.split(' ');
    wordLength = split.length;
    for (let i = 0; i < split.length; i++) {
        const currentWord = split[i];
        const word = new Word(currentWord, i);
        contentTexts.appendChild(word.html);
        wordList.push(word);
    }
}

function generateRacer(data, isCurrentPlayer) {
    let racer = new Racer(data.id, data.username, data.isWaiting || false, isCurrentPlayer);
    racers[racer.id] = racer;
    gameViewRacers.appendChild(racer.htmlContainer);
    if (isCurrentPlayer) currentRacer = racer;
}

function startTimer() {
    timerView.classList.remove('invisible');
    timerCountdown.innerText = '3';

    let i = 2;
    const interval = setInterval(function () {
        timerCountdown.innerText = `${i}`;

        if (--i < 0) {
            clearInterval(interval);
            timerView.className += ' invisible';
            contentInput.focus();
        }
    }, 1000)
}