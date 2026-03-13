const SOUND_KEY = "damon_sound_enabled";

function isSoundEnabled() {
  const saved = localStorage.getItem(SOUND_KEY);
  return saved === null ? true : saved === "true";
}

class DamonAudioManager {
  constructor() {
    this.menuAudio = new Audio("./audio/menu.mp3");
    this.battleAudio = new Audio("./audio/battle.mp3");
    this.correctSfx = new Audio("./audio/correct.wav");
    this.wrongSfx = new Audio("./audio/wrong.wav");
    this.timerSfx = new Audio("./audio/timer.wav");
    this.victorySfx = new Audio("./audio/victory.wav");

    this.menuAudio.loop = true;
    this.battleAudio.loop = true;

    this.menuAudio.volume = 0.35;
    this.battleAudio.volume = 0.35;

    this.correctSfx.volume = 0.5;
    this.wrongSfx.volume = 0.5;
    this.timerSfx.volume = 0.5;
    this.victorySfx.volume = 0.6;

    this.currentMode = null;
    this.started = false;

    this.bindStartListeners();
  }

  getPageMode() {
    return document.body?.dataset?.page === "game" ? "battle" : "menu";
  }

  pauseAllMusic() {
    this.menuAudio.pause();
    this.battleAudio.pause();
  }

  playMenuMusic() {
    if (!isSoundEnabled()) return;
    if (this.currentMode === "menu") return;

    this.pauseAllMusic();
    this.menuAudio.currentTime = 0;
    this.menuAudio.play().catch(() => {});
    this.currentMode = "menu";
  }

  playBattleMusic() {
    if (!isSoundEnabled()) return;
    if (this.currentMode === "battle") return;

    this.pauseAllMusic();
    this.battleAudio.currentTime = 0;
    this.battleAudio.play().catch(() => {});
    this.currentMode = "battle";
  }

  startForCurrentPage() {
    if (!isSoundEnabled()) return;

    if (this.getPageMode() === "battle") {
      this.playBattleMusic();
    } else {
      this.playMenuMusic();
    }
  }

  bindStartListeners() {
    const tryStart = () => {
      if (!isSoundEnabled()) return;
      this.startForCurrentPage();
      this.started = true;
    };

    const handler = () => {
      tryStart();
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("touchstart", handler);
    };

    document.addEventListener("click", handler);
    document.addEventListener("keydown", handler);
    document.addEventListener("touchstart", handler);

    window.addEventListener("pageshow", () => {
      if (!isSoundEnabled()) return;
      this.currentMode = null;
      this.started = false;
    });
  }

  setEnabled(enabled) {
    localStorage.setItem(SOUND_KEY, String(enabled));

    if (!enabled) {
      this.pauseAllMusic();
      this.currentMode = null;
      return;
    }

    this.startForCurrentPage();
  }

  toggleMusic() {
    const enabled = !isSoundEnabled();
    this.setEnabled(enabled);
    return enabled;
  }

  safePlay(audio) {
    if (!isSoundEnabled()) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  playCorrect() {
    this.safePlay(this.correctSfx);
  }

  playWrong() {
    this.safePlay(this.wrongSfx);
  }

  playTimeout() {
    this.safePlay(this.timerSfx);
  }

  playVictory() {
    this.safePlay(this.victorySfx);
  }
}

window.DamonAudio = new DamonAudioManager();