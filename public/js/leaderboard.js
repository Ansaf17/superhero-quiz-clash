const state = window.DamonState;
const users = [...state.getUsers()].sort((a, b) => {
if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
return b.totalPoints - a.totalPoints;
});
const leaderboardList = document.getElementById("leaderboardList");
const historyList = document.getElementById("historyList");
const currentUser = state.getCurrentUser();
if (users.length === 0) {
leaderboardList.innerHTML = `<div class="leaderboard-item">No users yet.</
div>`;
} else {
users.forEach((user, index) => {
const item = document.createElement("div");
item.className = "leaderboard-item";
item.innerHTML = `
 <div class="row-between">
 <div><strong>#${index + 1} ${user.username}</strong></div>
 <div>${user.avatar}</div>
 </div>
 <p>Wins: ${user.totalWins}</p>
 <p>Points: ${user.totalPoints}</p>
 <p>Matches Played: ${user.matchesPlayed}</p>
 `;
 leaderboardList.appendChild(item);
});
}
const matches = state.getMatches();
if (!currentUser) {
historyList.innerHTML = `<div class="history-item">Log in to see your
history.</div>`;
} else {
const userMatches = matches.filter(
match => match.player1 === currentUser.username || match.player2 ===
currentUser.username
).reverse();
if (userMatches.length === 0) {
historyList.innerHTML = `<div class="history-item">No match history yet.</
div>`;
} else {
userMatches.forEach(match => {
const item = document.createElement("div");
item.className = "history-item";
item.innerHTML = `
 <p><strong>${match.player1}</strong> vs <strong>${match.player2}</
strong></p>
 <p>Score: ${match.player1Score} - ${match.player2Score}</p>
 <p>Winner: ${match.winner}</p>
 <p>Category: ${match.category}</p>
 <p>Mode: ${match.mode}</p>
 <p>Date: ${match.date}</p>
 `;
historyList.appendChild(item);
});
}
}