const state = window.DamonState;
const messageBox = document.getElementById("messageBox");

const soundEnabled = document.getElementById("soundEnabled");
const defaultDifficulty = document.getElementById("defaultDifficulty");
const defaultCategory = document.getElementById("defaultCategory");
const turnTimer = document.getElementById("turnTimer");
const themeSelect = document.getElementById("themeSelect");

const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");
const clearBattleConfigBtn = document.getElementById("clearBattleConfigBtn");
const clearMatchHistoryBtn = document.getElementById("clearMatchHistoryBtn");
const clearAllDataBtn = document.getElementById("clearAllDataBtn");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function loadSettings() {
  const settings = state.getSettings() || state.getDefaultSettings();
  const savedTheme = localStorage.getItem("damon_theme") || "dark";
  const musicEnabled = localStorage.getItem("damon_sound_enabled");

  soundEnabled.value = String(musicEnabled === null ? true : musicEnabled === "true");
  defaultDifficulty.value = settings.defaultDifficulty;
  defaultCategory.value = settings.defaultCategory;
  turnTimer.value = String(settings.turnTimer);
  themeSelect.value = savedTheme;
}

saveSettingsBtn.onclick = () => {
  const settings = {
    soundEnabled: soundEnabled.value === "true",
    defaultDifficulty: defaultDifficulty.value,
    defaultCategory: defaultCategory.value,
    turnTimer: Number(turnTimer.value)
  };

  state.saveSettings(settings);
  localStorage.setItem("damon_sound_enabled", String(settings.soundEnabled));

  if (window.DamonTheme) {
    window.DamonTheme.setTheme(themeSelect.value);
  }

  if (window.DamonAudio) {
    if (settings.soundEnabled) {
      window.DamonAudio.playMenuMusic();
    } else {
      window.DamonAudio.stopAllMusic();
    }
  }

  showMessage("Settings saved successfully.", "success");
  if (window.DamonToast) {
    window.DamonToast.show("Settings saved.", "success");
  }
};

resetSettingsBtn.onclick = () => {
  const defaults = state.getDefaultSettings();
  state.saveSettings(defaults);

  localStorage.setItem("damon_sound_enabled", "true");
  localStorage.setItem("damon_theme", "dark");

  if (window.DamonTheme) {
    window.DamonTheme.setTheme("dark");
  }

  if (window.DamonAudio) {
    window.DamonAudio.playMenuMusic();
  }

  loadSettings();
  showMessage("Settings reset to defaults.", "success");
  if (window.DamonToast) {
    window.DamonToast.show("Settings reset.", "info");
  }
};

clearBattleConfigBtn.onclick = () => {
  state.clearBattleConfig();
  state.clearPvpDraft();
  showMessage("Current battle data cleared.", "success");
};

clearMatchHistoryBtn.onclick = () => {
  localStorage.removeItem("matches");
  localStorage.removeItem("h2h");
  showMessage("Match history cleared.", "success");
};

clearAllDataBtn.onclick = () => {
  localStorage.removeItem("users");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("matches");
  localStorage.removeItem("h2h");
  localStorage.removeItem("battleConfig");
  localStorage.removeItem("pvpDraft");
  localStorage.removeItem("damonSettings");
  localStorage.removeItem("damon_theme");
  localStorage.removeItem("damon_sound_enabled");
  localStorage.removeItem("damon_menu_time");

  if (window.DamonAudio) {
    window.DamonAudio.stopAllMusic();
  }

  showMessage("All DAMON data has been reset.", "success");

  setTimeout(() => {
    window.location.href = "./home.html";
  }, 800);
};

loadSettings();