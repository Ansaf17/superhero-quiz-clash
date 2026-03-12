const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const allMatches = state.getMatches();
const userMatches = allMatches.filter(
  match => match.player1 === currentUser.username || match.player2 === currentUser.username
);

document.getElementById("statsAvatar").textContent = currentUser.avatar;
document.getElementById("statsUsername").textContent = currentUser.username;
document.getElementById("statsPoints").textContent = currentUser.totalPoints;
document.getElementById("statsWins").textContent = currentUser.totalWins;
document.getElementById("statsLosses").textContent = currentUser.totalLosses;
document.getElementById("statsMatches").textContent = currentUser.matchesPlayed;

const winRate = currentUser.matchesPlayed > 0
  ? Math.round((currentUser.totalWins / currentUser.matchesPlayed) * 100)
  : 0;

document.getElementById("statsWinRate").textContent = `${winRate}%`;
document.getElementById("statsSummaryText").textContent =
  `${currentUser.totalWins} wins • ${currentUser.totalPoints} points • ${currentUser.matchesPlayed} matches`;

function countByMode(matches) {
  const result = { pvp: 0, pc: 0 };
  matches.forEach(match => {
    if (match.mode === "pvp") result.pvp += 1;
    if (match.mode === "pc") result.pc += 1;
  });
  return result;
}

function countByCategory(matches) {
  const result = {
    math: 0,
    banana: 0,
    general: 0,
    programming: 0
  };

  matches.forEach(match => {
    if (result.hasOwnProperty(match.category)) {
      result[match.category] += 1;
    }
  });

  return result;
}

const modeStats = countByMode(userMatches);
const categoryStats = countByCategory(userMatches);

const modeBreakdown = document.getElementById("modeBreakdown");
modeBreakdown.innerHTML = `
  <div class="stats-breakdown-item"><strong>PVP Matches</strong><span>${modeStats.pvp}</span></div>
  <div class="stats-breakdown-item"><strong>Player vs PC Matches</strong><span>${modeStats.pc}</span></div>
`;

const categoryBreakdown = document.getElementById("categoryBreakdown");
categoryBreakdown.innerHTML = `
  <div class="stats-breakdown-item"><strong>Maths</strong><span>${categoryStats.math}</span></div>
  <div class="stats-breakdown-item"><strong>Banana API</strong><span>${categoryStats.banana}</span></div>
  <div class="stats-breakdown-item"><strong>General Knowledge</strong><span>${categoryStats.general}</span></div>
  <div class="stats-breakdown-item"><strong>Programming</strong><span>${categoryStats.programming}</span></div>
`;

let bestCategory = "-";
let bestCount = 0;

Object.entries(categoryStats).forEach(([category, count]) => {
  if (count > bestCount) {
    bestCount = count;
    bestCategory = category;
  }
});

document.getElementById("statsBestCategory").textContent = bestCount > 0 ? bestCategory : "-";

const recentMatchesSnapshot = document.getElementById("recentMatchesSnapshot");
const recent = [...userMatches].reverse().slice(0, 5);

if (recent.length === 0) {
  recentMatchesSnapshot.innerHTML = `<div class="stats-breakdown-item"><strong>No recent matches</strong><span>-</span></div>`;
} else {
  recentMatchesSnapshot.innerHTML = "";
  recent.forEach(match => {
    const item = document.createElement("div");
    item.className = "stats-breakdown-item";
    item.innerHTML = `
      <strong>${match.player1} vs ${match.player2}</strong>
      <span>${match.category} | ${match.mode}</span>
    `;
    recentMatchesSnapshot.appendChild(item);
  });
}