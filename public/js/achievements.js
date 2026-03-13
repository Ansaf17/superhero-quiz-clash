const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const achievementAvatar = document.getElementById("achievementAvatar");
const achievementUsername = document.getElementById("achievementUsername");
const achievementSummaryText = document.getElementById("achievementSummaryText");
const achievementGrid = document.getElementById("achievementGrid");
const dailyChallengeGrid = document.getElementById("dailyChallengeGrid");

achievementAvatar.textContent = currentUser.avatar;
achievementUsername.textContent = currentUser.username;
achievementSummaryText.textContent = `${currentUser.achievements.length} unlocked achievements • Level ${currentUser.level} • ${currentUser.rankTitle}`;

const defs = state.getAchievementDefinitions();
const unlockedSet = new Set(currentUser.achievements);

achievementGrid.innerHTML = "";
defs.forEach((item) => {
  const card = document.createElement("div");
  const unlocked = unlockedSet.has(item.id);

  card.className = `card achievement-card ${unlocked ? "achievement-unlocked" : "achievement-locked"}`;
  card.innerHTML = `
    <div class="achievement-icon">${unlocked ? "🏆" : "🔒"}</div>
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="achievement-status">${unlocked ? "Unlocked" : "Locked"}</div>
  `;

  achievementGrid.appendChild(card);
});

const dailyStatuses = state.getDailyChallengeStatuses(currentUser);

dailyChallengeGrid.innerHTML = "";
dailyStatuses.forEach((item) => {
  const card = document.createElement("div");
  card.className = `card daily-challenge-card ${item.completed ? "daily-complete" : "daily-incomplete"}`;
  card.innerHTML = `
    <div class="daily-challenge-icon">${item.completed ? "✅" : "🎯"}</div>
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="daily-challenge-status">${item.completed ? "Completed" : "In Progress"}</div>
  `;
  dailyChallengeGrid.appendChild(card);
});