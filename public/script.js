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
    while (gameViewRacers.childNodes.length > 1) gameViewRacers.removeChild(gameViewRacers.firstChild);
});

formMultiPlayerButton.addEventListener('click', () => {
    let username;
    formUsername.value === '' ? username = 'Guest' : username = formUsername.value;
    socket.connect();
    const roomId = formRoomId.value;
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

function generateRandomPhrase()
{
    let phrase = [
        'Yang terpenting, bukanlah seberapa besar mimpi kalian, melainkan seberapa besar upaya kalian mewujudkan mimpi itu',
        'Aku rasa hidupku seperti musik. Itu mungkin bukan musik yang bagus tapi tetap mempunyai bentuk dan irama.',
        'Bagi saya, hidup terlalu singkat untuk dilewatkan dengan biasa-biasa saja',
        'Bermimpilah dalam hidup, jangan hidup dalam mimpi.',
        'Dan Tuhan memelihara ketidakpastian itu pada seluruh umat manusia agar manusia terus belajar, terus bermimpi dan ujung-ujungnya kita akan kembali padanya.',
        'Di saat kunikmati, hidup ini indah. Dan langsung pusing ketika mulai kupikirkan',
        'Kita tak tahu dan tak pernah pasti tahu hingga semuanya berlalu. Benar atau salah, dituruti atau tidak dituruti, pada akhirnya yang bisa membuktikan cuma waktu.',
        'Orang-orang itu telah melupakan bahwa belajar tidaklah melulu untuk mengejar dan membuktikan sesuatu, namun belajar itu sendiri, adalah perayaan dan penghargaan pada diri sendiri.',
        'Mau ganteng atau tidak, kalau hatinya tidak satu frekuensi, bagaimana?',
        'Yang terpenting, bukanlah seberapa besar mimpi kalian, melainkan seberapa besar upaya kalian mewujudkan mimpi itu',
        'Pada akhirnya nanti, semua yang pernah hilang atau diambil dari diri kita akan kembali lagi kepada kita. Walaupun dengan cara yang tidak pernah kita duga.',
        'Jika kamu tak membayangkannya, tak ada sesuatu pun yang akan terwujud.',
        'Jika kamu hanya membaca buku yang orang lain baca, kamu hanya bisa memikirkan apa yang orang lain pikir.',
        'Kenapa harus takut gelap kalau ada banyak hal indah yang hanya bisa dilihat sewaktu gelap?',
        'Tidak ada yang baru di bawah matahari. Semuanya sudah dilakukan sebelumnya.',
        'Orang-orang biasanya melihat apa yang mereka cari, dan mendengar apa yang mereka ingin dengar. ',
        'Jika kita ibaratkan, maka peradaban manusia persis seperti roda. Terus berputar. Naik-turun. Mengikuti siklusnya.',
        'Kalau hidup sekadar hidup, babi di hutan juga hidup. Kalau kerja sekadar bekerja, kera juga bekerja. ',
        'Jika Anda melakukan sesuatu yang baik, setelah beberapa lama, tanpa anda pernah merasakannya, anda akan mulai untuk pamer. Setelah itu, anda tidak akan pernah dipandang baik lagi. ',
        'Mengerti bahwa memaafkan itu proses yang menyakitkan. Mengerti, walau menyakitkan itu harus dilalui agar langkah kita menjadi jauh lebih ringan. Ketahuilah, memaafkan orang lain sebenarnya jauh lebih mudah dibandingkan memaafkan diri sendiri.',
    ]
    return phrase[Math.floor(Math.random() * phrase.length)];
}