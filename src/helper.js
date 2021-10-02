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
    'Kalau hidup sekadar hidup, babi di hutan juga hidup. Kalau kerja sekadar bekerja, kera juga bekerja.',
    'Jika Anda melakukan sesuatu yang baik, setelah beberapa lama, tanpa anda pernah merasakannya, anda akan mulai untuk pamer. Setelah itu, anda tidak akan pernah dipandang baik lagi.',
    'Mengerti bahwa memaafkan itu proses yang menyakitkan. Mengerti, walau menyakitkan itu harus dilalui agar langkah kita menjadi jauh lebih ringan. Ketahuilah, memaafkan orang lain sebenarnya jauh lebih mudah dibandingkan memaafkan diri sendiri.',
]

const generateRandomId = (size) => {
    return [...Array(size)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
}

const generateRandomPhrase = () => {
    return phrase[Math.floor(Math.random() * phrase.length)].trim();
}

module.exports = {generateRandomId, generateRandomWord: generateRandomPhrase};