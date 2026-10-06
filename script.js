const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('score');
const timeBoard = document.getElementById('time');
const finalScore = document.getElementById('final-score');
const countdownOverlay = document.getElementById('countdown-overlay');

const startBtn = document.getElementById('start-btn');
const titleBtn = document.getElementById('title-btn');
const rankText = document.getElementById('rank-text');

let score = 0;
let timeLeft = 30;
let lastHole;
let isPlaying = false;
let moleTimer;
let countdownTimer;

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(holes);
  }
  lastHole = hole;
  return hole;
}

function popMole() {
  const time = Math.floor(Math.random() * 600) + 400;
  const hole = randomHole(holes);
  hole.classList.add('up');

  moleTimer = setTimeout(() => {
    hole.classList.remove('up');
    if (isPlaying) popMole();
  }, time);
}

// ゲーム開始
function startGame() {
  score = 0;
  timeLeft = 30;
  isPlaying = false;

  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  scoreBoard.textContent = 0;
  timeBoard.textContent = timeLeft;

  let count = 3;
  countdownOverlay.textContent = count;
  countdownOverlay.classList.remove('hidden');

  const startCountdown = setInterval(() => {
    count--;
    if (count > 0) {
      countdownOverlay.textContent = count;
      // アニメーションを再再生させるための工夫
      countdownOverlay.style.animation = 'none';
      countdownOverlay.offsetHeight; /* reflow */
      countdownOverlay.style.animation = 'popText 0.5s ease';
    } else if (count === 0) {
      countdownOverlay.textContent = 'START!';
      countdownOverlay.style.animation = 'none';
      countdownOverlay.offsetHeight;
      countdownOverlay.style.animation = 'popText 0.5s ease';
    } else {
      // カウントダウン終了後、実際のゲームプレイを開始
      clearInterval(startCountdown);
      countdownOverlay.classList.add('hidden');
      runGame();
    }
  }, 1000);
}
function runGame() {
  isPlaying = true;
  popMole();

  countdownTimer = setInterval(() => {
    timeLeft--;
    timeBoard.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ゲーム終了（結果画面を表示）
function endGame() {
  clearInterval(countdownTimer);
  clearTimeout(moleTimer);
  isPlaying = false;
  holes.forEach(hole => hole.classList.remove('up'));

  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  finalScore.textContent = score;
  // ランクの取得と適用
  const rankInfo = getRank(score);
  rankText.textContent = rankInfo.text;

  // ランクSの場合のみ rainbow クラスを付与
  if (rankInfo.isS) {
    rankText.classList.add('rainbow');
  } else {
    rankText.classList.remove('rainbow');
  }

}

// タイトル画面を表示する処理
function showStartScreen() {
  resultScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
}

function whack(e) {
  if (!e.isTrusted) return;
  if (!this.classList.contains('up')) return;

  score++;
  this.classList.remove('up');
  scoreBoard.textContent = score;
}
function getRank(score) {
  if (score >= 30) {
    return { text: 'ランク: S【伝説のモグラハンター】', isS: true };
  } else if (score >= 25) {
    return { text: 'ランク: A【ベテランハンター】', isS: false };
  } else if (score >= 20) {
    return { text: 'ランク: B【一人前のハンター】', isS: false };
  } else if (score >= 15){
    return { text: 'ランク: C【見習いハンター】', isS: false };
  } else {
    return{ text: 'ランク: D【もぐらとなかよし】', isS: false};
  }
}
function whack(e) {
  if (!e.isTrusted) return;
  if (!isPlaying) return;

  // クリックされた hole と mole を取得
  const hole = this;
  const mole = hole.querySelector('.mole');

  // モグラが出ていない、または既に叩かれている場合は処理しない
  if (!hole.classList.contains('up') || mole.classList.contains('hit')) return;

  score++;
  scoreBoard.textContent = score;

  // 1. たたかれた見た目（.hit）に変更
  mole.classList.add('hit');

  // 2. 💥 エフェクトを表示
  const effect = document.createElement('div');
  effect.classList.add('hit-effect');
  effect.textContent = '💥';
  hole.appendChild(effect);

  // 0.25秒後に引っ込めて元に戻す
  setTimeout(() => {
    hole.classList.remove('up');
    mole.classList.remove('hit');
    effect.remove();
  }, 250);
}
// イベントリスナー
holes.forEach(hole => hole.addEventListener('click', whack));
startBtn.addEventListener('click', startGame);
titleBtn.addEventListener('click', showStartScreen);