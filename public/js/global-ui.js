(function () {
  const TRANSITION_DELAY = 260;
  let soundEnabled = JSON.parse(localStorage.getItem("damonSoundEnabled") || "true");

  function ensureOverlay() {
    let overlay = document.querySelector(".page-transition-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "page-transition-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function resetPageState() {
    const overlay = ensureOverlay();
    overlay.classList.remove("active");
    document.body.classList.remove("page-exit");
    document.body.classList.add("page-ready");
  }

  function goWithTransition(url) {
    const overlay = ensureOverlay();
    overlay.classList.add("active");
    document.body.classList.remove("page-ready");
    document.body.classList.add("page-exit");

    setTimeout(() => {
      window.location.href = url;
    }, TRANSITION_DELAY);
  }

  function createSoundButton() {
    const topBar = document.querySelector(".top-bar");
    if (!topBar) return;
    if (document.getElementById("soundToggleBtn")) return;

    const btn = document.createElement("button");
    btn.id = "soundToggleBtn";
    btn.className = "sound-toggle-btn";
    btn.type = "button";
    btn.textContent = soundEnabled ? "🔊 Sound On" : "🔇 Sound Off";

    btn.onclick = function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem("damonSoundEnabled", JSON.stringify(soundEnabled));
      btn.textContent = soundEnabled ? "🔊 Sound On" : "🔇 Sound Off";
    };

    topBar.appendChild(btn);
  }

  function playTone(frequency, duration, type = "sine", volume = 0.04) {
    if (!soundEnabled) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  }

  window.DamonFX = {
    playCorrect() {
      playTone(720, 0.18, "sine", 0.05);
      setTimeout(() => playTone(920, 0.16, "sine", 0.04), 90);
    },
    playWrong() {
      playTone(220, 0.22, "sawtooth", 0.05);
      setTimeout(() => playTone(180, 0.18, "sawtooth", 0.04), 100);
    },
    playTimeout() {
      playTone(300, 0.18, "triangle", 0.05);
      setTimeout(() => playTone(240, 0.18, "triangle", 0.04), 100);
    },
    playWin() {
      playTone(523, 0.18, "sine", 0.05);
      setTimeout(() => playTone(659, 0.18, "sine", 0.05), 120);
      setTimeout(() => playTone(784, 0.28, "sine", 0.05), 240);
    },
    navigate(url) {
      goWithTransition(url);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureOverlay();
    createSoundButton();
    resetPageState();
  });

  window.addEventListener("pageshow", function () {
    resetPageState();
  });
})();