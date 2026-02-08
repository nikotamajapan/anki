// フランス語の数字 11-99（word=数字の表示、meaning=フランス語）
const FRENCH_NUMBERS = [
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
  'vingt', 'vingt et un', 'vingt-deux', 'vingt-trois', 'vingt-quatre', 'vingt-cinq', 'vingt-six', 'vingt-sept', 'vingt-huit', 'vingt-neuf',
  'trente', 'trente et un', 'trente-deux', 'trente-trois', 'trente-quatre', 'trente-cinq', 'trente-six', 'trente-sept', 'trente-huit', 'trente-neuf',
  'quarante', 'quarante et un', 'quarante-deux', 'quarante-trois', 'quarante-quatre', 'quarante-cinq', 'quarante-six', 'quarante-sept', 'quarante-huit', 'quarante-neuf',
  'cinquante', 'cinquante et un', 'cinquante-deux', 'cinquante-trois', 'cinquante-quatre', 'cinquante-cinq', 'cinquante-six', 'cinquante-sept', 'cinquante-huit', 'cinquante-neuf',
  'soixante', 'soixante et un', 'soixante-deux', 'soixante-trois', 'soixante-quatre', 'soixante-cinq', 'soixante-six', 'soixante-sept', 'soixante-huit', 'soixante-neuf',
  'soixante-dix', 'soixante et onze', 'soixante-douze', 'soixante-treize', 'soixante-quatorze', 'soixante-quinze', 'soixante-seize', 'soixante-dix-sept', 'soixante-dix-huit', 'soixante-dix-neuf',
  'quatre-vingts', 'quatre-vingt-un', 'quatre-vingt-deux', 'quatre-vingt-trois', 'quatre-vingt-quatre', 'quatre-vingt-cinq', 'quatre-vingt-six', 'quatre-vingt-sept', 'quatre-vingt-huit', 'quatre-vingt-neuf',
  'quatre-vingt-dix', 'quatre-vingt-onze', 'quatre-vingt-douze', 'quatre-vingt-treize', 'quatre-vingt-quatorze', 'quatre-vingt-quinze', 'quatre-vingt-seize', 'quatre-vingt-dix-sept', 'quatre-vingt-dix-huit', 'quatre-vingt-dix-neuf'
];

const VOCAB = FRENCH_NUMBERS.map((meaning, i) => ({
  word: String(i + 11),
  meaning
}));

const QUIZ_LIMIT = 10; // 1回のゲームで出す問題数

// 音声
let soundEnabled = true;
const quizPhase = document.getElementById('quizPhase');
const quizWord = document.getElementById('quizWord');
const choicesContainer = document.getElementById('choices');
const choiceBtns = document.querySelectorAll('.choice-btn');
const resultOverlay = document.getElementById('resultOverlay');
const resultMessage = document.getElementById('resultMessage');
const nextBtn = document.getElementById('nextBtn');
const gameoverOverlay = document.getElementById('gameoverOverlay');
const correctCountEl = document.getElementById('correctCount');
const totalCountEl = document.getElementById('totalCount');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const questionNumEl = document.getElementById('questionNum');
const soundBtn = document.getElementById('soundBtn');
const replayBtn = document.getElementById('replayBtn');

let score = 0;

// --- 音声 ---
function speak(text, lang = 'ja-JP') {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function speakFrench(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function replayFrench(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function playTone(freq, duration, type = 'sine') {
  if (!soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playCorrectSound() {
  playTone(523, 0.15);
  setTimeout(() => playTone(659, 0.15), 100);
  setTimeout(() => playTone(784, 0.2), 200);
}

function playWrongSound() {
  playTone(200, 0.25, 'sawtooth');
  setTimeout(() => playTone(150, 0.2, 'sawtooth'), 150);
}

function updateSoundBtn() {
  soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
  soundBtn.setAttribute('title', soundEnabled ? '音声オフ' : '音声オン');
}
let questionIndex = 0;
let quizPool = [];
let currentItem = null;

function getRandomItem() {
  return VOCAB[Math.floor(Math.random() * VOCAB.length)];
}

function getWrongMeanings(correctMeaning, count = 3) {
  const pool = VOCAB
    .map((v) => v.meaning)
    .filter((m) => m !== correctMeaning);
  const unique = [...new Set(pool)];
  const shuffled = [...unique].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function showQuestion() {
  currentItem = quizPool[questionIndex];
  if (!currentItem) {
    showGameOver();
    return;
  }

  const wrongs = getWrongMeanings(currentItem.meaning);
  const options = [currentItem.meaning, ...wrongs].sort(() => Math.random() - 0.5);

  quizWord.textContent = currentItem.word;
  quizWord.classList.add('show');

  choiceBtns.forEach((btn, i) => {
    btn.textContent = options[i];
    btn.dataset.value = options[i];
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
  });

  questionNumEl.textContent = questionIndex + 1;

  // 数字のフランス語を読み上げ（少し遅延）
  setTimeout(() => speakFrench(currentItem.meaning), 400);
}

function onChoice(e) {
  if (!e.target.classList.contains('choice-btn') || e.target.disabled) return;

  const selected = e.target.dataset.value;
  const isCorrect = selected === currentItem.meaning;

  choiceBtns.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.value === currentItem.meaning) btn.classList.add('correct');
    if (btn === e.target && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) {
    score++;
    scoreEl.textContent = score;
    resultMessage.textContent = `正解！「${currentItem.word}」= ${currentItem.meaning}`;
    resultMessage.classList.remove('wrong-msg');
    resultMessage.classList.add('correct-msg');
    playCorrectSound();
    speak('正解');
  } else {
    resultMessage.textContent = `不正解。正解は「${currentItem.meaning}」`;
    resultMessage.classList.remove('correct-msg');
    resultMessage.classList.add('wrong-msg');
    playWrongSound();
    speak('不正解');
    setTimeout(() => speakFrench(currentItem.meaning), 600);
  }

  resultOverlay.classList.remove('hidden');
}

function nextRound() {
  window.speechSynthesis.cancel();
  resultOverlay.classList.add('hidden');
  questionIndex++;
  if (questionIndex >= quizPool.length) {
    showGameOver();
    return;
  }
  showQuestion();
}

function showGameOver() {
  gameoverOverlay.classList.remove('hidden');
  correctCountEl.textContent = score;
  totalCountEl.textContent = quizPool.length;
}

function startGame() {
  score = 0;
  questionIndex = 0;
  quizPool = [];
  for (let i = 0; i < QUIZ_LIMIT; i++) {
    quizPool.push(getRandomItem());
  }

  scoreEl.textContent = score;
  questionNumEl.textContent = '0';
  startBtn.disabled = true;
  gameoverOverlay.classList.add('hidden');
  resultOverlay.classList.add('hidden');
  showQuestion();
}

function restartGame() {
  gameoverOverlay.classList.add('hidden');
  startGame();
}

soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  updateSoundBtn();
});

replayBtn.addEventListener('click', () => {
  if (currentItem) replayFrench(currentItem.meaning);
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
nextBtn.addEventListener('click', nextRound);
choicesContainer.addEventListener('click', onChoice);
