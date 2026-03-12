const state = window.DamonState;
const config = state.getBattleConfig();
const messageBox = document.getElementById("messageBox");
const tiles = document.querySelectorAll(".category-tile");
const difficultyCard = document.getElementById("difficultyCard");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

let selectedCategory = "math";
let selectedDifficulty = "easy";

if (!config) {
  window.location.href = "home.html";
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

tiles.forEach(tile => {
  tile.onclick = () => {
    tiles.forEach(t => t.classList.remove("active"));
    tile.classList.add("active");
    selectedCategory = tile.dataset.category;
  };
});

difficultyButtons.forEach(btn => {
  btn.onclick = () => {
    difficultyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.dataset.difficulty;
  };
});

if (config.mode !== "pc") {
  difficultyCard.classList.add("hidden");
}

document.getElementById("startGameBtn").onclick = () => {
  config.category = selectedCategory;

  if (config.mode === "pc") {
    config.botDifficulty = selectedDifficulty;
  } else {
    config.botDifficulty = null;
  }

  state.setBattleConfig(config);
  showMessage(`Category selected: ${selectedCategory}`, "success");

  setTimeout(() => {
    window.location.href = "game.html";
  }, 350);
};