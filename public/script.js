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
    console.log(data);

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
    generateRacer(data, false);
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
    racers[data.id].update(data.rank);
    if (racers[data.id].isMe) {
        dashboardReplayButton.className += ' visible';
    }
});

socket.on('voted', playerId => {
    let current = racers[playerId];
    if (current) current.state = 'rematch';
});

formSinglePlayerButton.addEventListener('click', () => {
    resetState();
    generateGameContent(generateRandomPhrase());
    if (!racers[0]) generateRacer({id: 0, username: formUsername.value || 'Guest'}, true);
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
    word.updateCorrection(contentInput.value);

    if (e.data === ' ' && word.elementText === contentInput.value) {
        contentInput.value = '';
        word.active = false;
        if (++wordIndex < wordList.length) {
            wordList[wordIndex].active = true;
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
        racers[key].remove();
    });
    racers = {};
    resetState();
}

function resetState() {
    wordList.forEach(word => word.remove());
    wordList = [];
    wordIndex = 0;
    wordLength = 0;
    Object.keys(racers).forEach(key => {
        racers[key].reset();
    });
}

function generateGameContent(phrase) {
    phrase = phrase.split(' ');
    wordLength = phrase.length;
    for (let i = 0; i < phrase.length; i++) {
        let word = new WordView(i, phrase[i]);
        wordList.push(word);
        contentTexts.appendChild(word);
    }
}

function generateRacer(data, isMe) {
    let racer = new RacerView(data.username, isMe);

    gameViewRacers.appendChild(racer);
    racers[data.id] = racer;

    racer.state = data.isWaiting ? 'waiting' : '';
    racer.progress = data.progress;
    racer.rank = data.rank;
    if (isMe) currentRacer = racer;
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