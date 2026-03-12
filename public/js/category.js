const state = window.DamonState;
const config = state.getBattleConfig();
const messageBox = document.getElementById("messageBox");
const tiles = document.querySelectorAll(".category-tile");
const difficultyCard = document.getElementById("difficultyCard");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

if (!config) {
  window.location.href = "home.html";
}

const settings = state.getSettings() || state.getDefaultSettings();

let selectedCategory = settings.defaultCategory || "math";
let selectedDifficulty = settings.defaultDifficulty || "easy";

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function applyInitialSelections() {
  tiles.forEach(tile => {
    if (tile.dataset.category === selectedCategory) {
      tile.classList.add("active");
    } else {
      tile.classList.remove("active");
    }
  });

  difficultyButtons.forEach(btn => {
    if (btn.dataset.difficulty === selectedDifficulty) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

tiles.forEach(tile => {
  tile.addEventListener("click", () => {
    tiles.forEach(t => t.classList.remove("active"));
    tile.classList.add("active");
    selectedCategory = tile.dataset.category;
  });
});

difficultyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    difficultyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.dataset.difficulty;
  });
});

if (config.mode !== "pc") {
  difficultyCard.classList.add("hidden");
}

document.getElementById("startGameBtn").onclick = () => {
  config.category = selectedCategory;
  config.botDifficulty = config.mode === "pc" ? selectedDifficulty : null;

  state.setBattleConfig(config);
  showMessage(`Category selected: ${selectedCategory}`, "success");

  setTimeout(() => {
    if (window.DamonFX) {
      window.DamonFX.navigate("game.html");
    } else {
      window.location.href = "game.html";
    }
  }, 250);
};

applyInitialSelections();