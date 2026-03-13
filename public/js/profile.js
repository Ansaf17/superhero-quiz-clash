const state = window.DamonState;

if (window.DamonAudio) {
  window.DamonAudio.playMenuMusic();
}

const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

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