const SOUND_KEY = "damon_sound_enabled";

function isMusicEnabled() {
  const saved = localStorage.getItem(SOUND_KEY);
  return saved === null ? true : saved === "true";
}

function safePlay(audio) {
  if (!isMusicEnabled()) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

const correctSfx = new Audio("./audio/correct.wav");
const wrongSfx = new Audio("./audio/wrong.wav");
const timerSfx = new Audio("./audio/timer.wav");
const victorySfx = new Audio("./audio/victory.wav");

correctSfx.volume = 0.5;
wrongSfx.volume = 0.5;
timerSfx.volume = 0.45;
victorySfx.volume = 0.65;

/* Keep old methods safe/no-op */
function playMenuMusic() {}
function playBattleMusic() {}
function returnMenuMusic() {}
function stopAllMusic() {}

function toggleMusic() {
  const enabled = isMusicEnabled();
  localStorage.setItem(SOUND_KEY, String(!enabled));
  return !enabled;
}

window.DamonAudio = {
  isMusicEnabled,
  toggleMusic,
  playMenuMusic,
  playBattleMusic,
  returnMenuMusic,
  stopAllMusic,
  playCorrect() {
    safePlay(correctSfx);
  },
  playWrong() {
    safePlay(wrongSfx);
  },
  playTimeout() {
    safePlay(timerSfx);
  },
  playVictory() {
    safePlay(victorySfx);
  }
};