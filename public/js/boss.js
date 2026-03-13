const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const messageBox = document.getElementById("messageBox");
const bossGrid = document.getElementById("bossGrid");
const startBossBattleBtn = document.getElementById("startBossBattleBtn");
const categoryTiles = document.querySelectorAll(".category-tile");

const bosses = state.getBossProfiles();

let selectedBossId = bosses[0].id;
let selectedCategory = "math";

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function renderBosses() {
  bossGrid.innerHTML = "";

  bosses.forEach((boss, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `card boss-card ${index === 0 ? "boss-card-active" : ""}`;
    card.dataset.bossId = boss.id;
    card.innerHTML = `
      <div class="boss-card-avatar">${boss.avatar}</div>
      <h3>${boss.name}</h3>
      <p>${boss.description}</p>
      <p><strong>HP:</strong> ${boss.hp}</p>
      <p><strong>Reward:</strong> ${boss.rewardCoins} coins + ${boss.rewardXp} XP</p>
    `;

    card.onclick = () => {
      document.querySelectorAll(".boss-card").forEach((item) => item.classList.remove("boss-card-active"));
      card.classList.add("boss-card-active");
      selectedBossId = boss.id;
    };

    bossGrid.appendChild(card);
  });
}

categoryTiles.forEach((tile) => {
  tile.onclick = () => {
    categoryTiles.forEach((item) => item.classList.remove("active"));
    tile.classList.add("active");
    selectedCategory = tile.dataset.category;
  };
});

startBossBattleBtn.onclick = () => {
  const boss = bosses.find((item) => item.id === selectedBossId);

  if (!boss) {
    showMessage("Select a boss first.", "error");
    return;
  }

  state.setBattleConfig({
    mode: "boss",
    category: selectedCategory,
    player1: currentUser,
    bossProfile: boss,
    player2: {
      username: boss.name,
      avatar: boss.avatar,
      isBoss: true
    }
  });

  window.location.href = "game.html";
};

renderBosses();