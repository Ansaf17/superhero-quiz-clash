const state = window.DamonState;

if (window.DamonAudio) {
  window.DamonAudio.playMenuMusic();
}

const config = state.getBattleConfig();
const messageBox = document.getElementById("messageBox");
const categoryTiles = document.querySelectorAll(".category-tile");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const personalityBtns = document.querySelectorAll(".personality-btn");
const enterArenaBtn = document.getElementById("enterArenaBtn");
const pcBotSettingsCard = document.getElementById("pcBotSettingsCard");

if (!config) {
  window.location.href = "home.html";
}

let selectedCategory = "math";
let selectedDifficulty = (config.botDifficulty || "easy");
let selectedPersonality = (config.botPersonality || "slowThinker");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function refreshBotPanel() {
  if (config.mode === "pc") {
    pcBotSettingsCard.classList.remove("hidden");
  } else {
    pcBotSettingsCard.classList.add("hidden");
  }
}

categoryTiles.forEach((tile) => {
  tile.onclick = () => {
    categoryTiles.forEach((item) => item.classList.remove("active"));
    tile.classList.add("active");
    selectedCategory = tile.dataset.category;
  };
});

difficultyBtns.forEach((btn) => {
  if (btn.dataset.difficulty === selectedDifficulty) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }

  btn.onclick = () => {
    difficultyBtns.forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.dataset.difficulty;
  };
});

personalityBtns.forEach((btn) => {
  if (btn.dataset.personality === selectedPersonality) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }

  btn.onclick = () => {
    personalityBtns.forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    selectedPersonality = btn.dataset.personality;
  };
});

enterArenaBtn.onclick = () => {
  if (!config) {
    showMessage("Battle configuration missing.", "error");
    return;
  }

  const updatedConfig = {
    ...config,
    category: selectedCategory
  };

  if (updatedConfig.mode === "pc") {
    updatedConfig.botDifficulty = selectedDifficulty;
    updatedConfig.botPersonality = selectedPersonality;
  }

  state.setBattleConfig(updatedConfig);

  if (window.DamonFX) {
    window.DamonFX.navigate("game.html");
  } else {
    window.location.href = "game.html";
  }
};

refreshBotPanel();