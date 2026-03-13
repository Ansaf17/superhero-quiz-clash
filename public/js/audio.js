const SOUND_KEY = "damon_sound_enabled";

const menuMusic = new Audio("./audio/menu.mp3");
const battleMusic = new Audio("./audio/battle.mp3");

menuMusic.loop = true;
battleMusic.loop = true;

menuMusic.volume = 0.35;
battleMusic.volume = 0.55;

let musicStarted = false;

/* Check if music enabled */

function isMusicEnabled() {
  const saved = localStorage.getItem(SOUND_KEY);
  return saved === null ? true : saved === "true";
}

/* Stop all music */

function stopAllMusic() {
  menuMusic.pause();
  battleMusic.pause();
}

/* Menu music */

function playMenuMusic() {

  if (!isMusicEnabled()) return;

  battleMusic.pause();

  menuMusic.play().catch(()=>{});

}

/* Battle music */

function playBattleMusic() {

  if (!isMusicEnabled()) return;

  menuMusic.pause();

  battleMusic.currentTime = 0;

  battleMusic.play().catch(()=>{});

}

/* Return to menu */

function returnMenuMusic() {

  if (!isMusicEnabled()) return;

  battleMusic.pause();

  playMenuMusic();

}

/* Toggle */

function toggleMusic() {

  const enabled = isMusicEnabled();

  if (enabled) {

    localStorage.setItem(SOUND_KEY,"false");
    stopAllMusic();

  } else {

    localStorage.setItem(SOUND_KEY,"true");
    playMenuMusic();

  }

}

/* First interaction fix */

function enableMusicOnFirstInteraction() {

  if (musicStarted) return;

  musicStarted = true;

  if (isMusicEnabled()) {
    playMenuMusic();
  }

}

/* Wait for user interaction */

document.addEventListener("click", enableMusicOnFirstInteraction, {once:true});
document.addEventListener("keydown", enableMusicOnFirstInteraction, {once:true});
document.addEventListener("touchstart", enableMusicOnFirstInteraction, {once:true});

window.DamonAudio = {
  playMenuMusic,
  playBattleMusic,
  returnMenuMusic,
  stopAllMusic,
  toggleMusic,
  isMusicEnabled
};