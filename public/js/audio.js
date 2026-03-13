const SOUND_KEY = "damon_sound_enabled";
const MENU_TIME_KEY = "damon_menu_time";

const menuMusic = new Audio("./audio/menu.mp3");
const battleMusic = new Audio("./audio/battle.mp3");

menuMusic.loop = true;
battleMusic.loop = true;

menuMusic.volume = 0.35;
battleMusic.volume = 0.5;

function isMusicEnabled() {
  const saved = localStorage.getItem(SOUND_KEY);
  return saved === null ? true : saved === "true";
}

function saveMusicState(enabled) {
  localStorage.setItem(SOUND_KEY, String(enabled));
}

function stopAllMusic() {
  menuMusic.pause();
  battleMusic.pause();
}

function playMenuMusic() {
  if (!isMusicEnabled()) return;

  try {
    const savedTime = Number(localStorage.getItem(MENU_TIME_KEY) || 0);
    if (!Number.isNaN(savedTime) && savedTime >= 0) {
      menuMusic.currentTime = savedTime;
    }
  } catch (e) {}

  battleMusic.pause();
  menuMusic.play().catch(() => {});
}

function playBattleMusic() {
  if (!isMusicEnabled()) return;

  try {
    localStorage.setItem(MENU_TIME_KEY, String(menuMusic.currentTime || 0));
  } catch (e) {}

  menuMusic.pause();
  battleMusic.currentTime = 0;
  battleMusic.play().catch(() => {});
}

function returnToMenuMusic() {
  if (!isMusicEnabled()) return;
  battleMusic.pause();
  playMenuMusic();
}

function toggleMusic() {
  const enabled = isMusicEnabled();

  if (enabled) {
    saveMusicState(false);
    stopAllMusic();
  } else {
    saveMusicState(true);
    playMenuMusic();
  }

  return !enabled;
}

function autoStartMenuMusic() {
  if (!isMusicEnabled()) return;

  const start = () => {
    if (menuMusic.paused) {
      playMenuMusic();
    }
  };

  window.addEventListener("click", start, { once: true });
  window.addEventListener("keydown", start, { once: true });
}

document.addEventListener("DOMContentLoaded", () => {
  autoStartMenuMusic();
});

window.DamonAudio = {
  isMusicEnabled,
  saveMusicState,
  playMenuMusic,
  playBattleMusic,
  returnToMenuMusic,
  stopAllMusic,
  toggleMusic
};