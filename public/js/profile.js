const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const xpState = state.getXpIntoCurrentLevel(currentUser.xp);

document.getElementById("profileAvatar").textContent = currentUser.avatar;
document.getElementById("profileUsername").textContent = currentUser.username;
document.getElementById("profilePoints").textContent = currentUser.totalPoints;
document.getElementById("profileWins").textContent = currentUser.totalWins;
document.getElementById("profileLosses").textContent = currentUser.totalLosses;
document.getElementById("profileMatches").textContent = currentUser.matchesPlayed;
document.getElementById("profileXp").textContent = currentUser.xp;
document.getElementById("profileLevel").textContent = currentUser.level;
document.getElementById("profileRankTitle").textContent = currentUser.rankTitle;
document.getElementById("profileLeaderboardTier").textContent = currentUser.leaderboardTier;
document.getElementById("profileWinStreak").textContent = currentUser.winStreak;
document.getElementById("profileBestWinStreak").textContent = currentUser.bestWinStreak;
document.getElementById("profileCoinsText").textContent = `${currentUser.coins} Coins`;

document.getElementById("profileXpProgressText").textContent = `${xpState.xpIntoLevel} / ${xpState.xpNeededForNextLevel}`;

const xpBar = document.getElementById("profileXpBar");
requestAnimationFrame(() => {
  xpBar.style.width = `${(xpState.xpIntoLevel / xpState.xpNeededForNextLevel) * 100}%`;
});

const badgeRow = document.getElementById("profileBadgeRow");
badgeRow.innerHTML = `
  <span class="rank-badge">${state.getTierEmoji(currentUser.leaderboardTier)} ${currentUser.leaderboardTier}</span>
  <span class="title-badge">⭐ ${currentUser.rankTitle}</span>
  <span class="level-badge">LV ${currentUser.level}</span>
`;

const inventoryGrid = document.getElementById("profileInventoryGrid");
inventoryGrid.innerHTML = `
  <div class="inventory-item">🎯 50/50 <strong>${currentUser.powerupInventory.fiftyFifty}</strong></div>
  <div class="inventory-item">⏭ Skip <strong>${currentUser.powerupInventory.skip}</strong></div>
  <div class="inventory-item">⏱ +5 Time <strong>${currentUser.powerupInventory.extraTime}</strong></div>
  <div class="inventory-item">💥 Double Points <strong>${currentUser.powerupInventory.doublePoints}</strong></div>
`;

const ownedAvatarGrid = document.getElementById("profileAvatarCollection");
ownedAvatarGrid.innerHTML = currentUser.ownedAvatars
  .map((avatar) => {
    const equipped = currentUser.avatar === avatar;
    return `
      <div class="owned-avatar-card ${equipped ? "owned-avatar-equipped" : ""}">
        <div class="owned-avatar-icon">${avatar}</div>
        <p>${equipped ? "Equipped" : "Unlocked"}</p>
      </div>
    `;
  })
  .join("");
