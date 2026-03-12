const state = window.DamonState;
const messageBox = document.getElementById("messageBox");

const soundEnabled = document.getElementById("soundEnabled");
const defaultDifficulty = document.getElementById("defaultDifficulty");
const defaultCategory = document.getElementById("defaultCategory");
const turnTimer = document.getElementById("turnTimer");

const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");
const clearBattleConfigBtn = document.getElementById("clearBattleConfigBtn");
const clearMatchHistoryBtn = document.getElementById("clearMatchHistoryBtn");
const clearAllDataBtn = document.getElementById("clearAllDataBtn");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function getSettings() {
  return state.getSettings() || state.getDefaultSettings();
}

function saveSettings(settings) {
  state.saveSettings(settings);
}

function loadSettingsToUI() {
  const settings = getSettings();

  soundEnabled.value = String(settings.soundEnabled);
  defaultDifficulty.value = settings.defaultDifficulty;
  defaultCategory.value = settings.defaultCategory;
  turnTimer.value = String(settings.turnTimer);

  localStorage.setItem("damonSoundEnabled", JSON.stringify(settings.soundEnabled));
}

saveSettingsBtn.onclick = () => {
  const settings = {
    soundEnabled: soundEnabled.value === "true",
    defaultDifficulty: defaultDifficulty.value,
    defaultCategory: defaultCategory.value,
    turnTimer: Number(turnTimer.value)
  };

  saveSettings(settings);
  localStorage.setItem("damonSoundEnabled", JSON.stringify(settings.soundEnabled));
  showMessage("Settings saved successfully.", "success");
  if (window.DamonToast) window.DamonToast.show("Settings saved.", "success");
};

resetSettingsBtn.onclick = () => {
  const defaults = state.getDefaultSettings();
  saveSettings(defaults);
  localStorage.setItem("damonSoundEnabled", JSON.stringify(defaults.soundEnabled));
  loadSettingsToUI();
  showMessage("Settings reset to defaults.", "success");
  if (window.DamonToast) window.DamonToast.show("Settings reset to defaults.", "info");
};

clearBattleConfigBtn.onclick = () => {
  state.clearBattleConfig();
  state.clearPvpDraft();
  showMessage("Current battle data cleared.", "success");
  if (window.DamonToast) window.DamonToast.show("Current battle cleared.", "warning");
};

clearMatchHistoryBtn.onclick = () => {
  localStorage.removeItem("matches");
  localStorage.removeItem("h2h");
  showMessage("Match history and head-to-head records cleared.", "success");
  if (window.DamonToast) window.DamonToast.show("Match history cleared.", "warning");
};

clearAllDataBtn.onclick = () => {
  localStorage.removeItem("users");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("matches");
  localStorage.removeItem("h2h");
  localStorage.removeItem("battleConfig");
  localStorage.removeItem("pvpDraft");
  localStorage.removeItem("damonSettings");
  localStorage.removeItem("damonSoundEnabled");

  showMessage("All DAMON data has been reset.", "success");
  if (window.DamonToast) window.DamonToast.show("All local data reset.", "error");

  setTimeout(() => {
    window.location.href = "home.html";
  }, 900);
};

loadSettingsToUI();