const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

if (window.DamonAudio) {
  window.DamonAudio.playMenuMusic();
}

document.getElementById("profileAvatar").textContent = currentUser.avatar;
document.getElementById("profileUsername").textContent = currentUser.username;
document.getElementById("profilePoints").textContent = currentUser.totalPoints;
document.getElementById("profileWins").textContent = currentUser.totalWins;
document.getElementById("profileLosses").textContent = currentUser.totalLosses;
document.getElementById("profileMatches").textContent = currentUser.matchesPlayed;