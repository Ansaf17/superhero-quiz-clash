window.DamonState = {
getUsers() {
return JSON.parse(localStorage.getItem("users") || "[]");
},
saveUsers(users) {
localStorage.setItem("users", JSON.stringify(users));
},
getCurrentUser() {
return JSON.parse(localStorage.getItem("currentUser") || "null");
},
setCurrentUser(user) {
localStorage.setItem("currentUser", JSON.stringify(user));
},
clearCurrentUser() {
localStorage.removeItem("currentUser");
},
getMatches() {
return JSON.parse(localStorage.getItem("matches") || "[]");
},
saveMatches(matches) {
localStorage.setItem("matches", JSON.stringify(matches));
},
getH2H() {
return JSON.parse(localStorage.getItem("h2h") || "{}");
},
saveH2H(h2h) {
localStorage.setItem("h2h", JSON.stringify(h2h));
},
getPvpDraft() {
return JSON.parse(localStorage.getItem("pvpDraft") || "null");
},
setPvpDraft(data) {
localStorage.setItem("pvpDraft", JSON.stringify(data));
},
clearPvpDraft() {
localStorage.removeItem("pvpDraft");
},
getBattleConfig() {
return JSON.parse(localStorage.getItem("battleConfig") || "null");
},
setBattleConfig(config) {
localStorage.setItem("battleConfig", JSON.stringify(config));
},
clearBattleConfig() {
localStorage.removeItem("battleConfig");
},
decodeHtml(text) {
const parser = new DOMParser();
return parser.parseFromString(text, "text/html").body.textContent;
},
shuffle(arr) {
const copy = [...arr];
for (let i = copy.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[copy[i], copy[j]] = [copy[j], copy[i]];
}
return copy;
},
requireLogin() {
const user = this.getCurrentUser();
if (!user) {
window.location.href = "home.html";
return null;
}
return user;
},
saveUserStats(player1Name, player2Name, player1Score, player2Score,
winnerUsername, category, mode) {
const users = this.getUsers();
const p1 = users.find(u => u.username === player1Name);
const p2 = users.find(u => u.username === player2Name);
if (!p1 || !p2) return;
p1.totalPoints += player1Score;
p2.totalPoints += player2Score;
p1.matchesPlayed += 1;
p2.matchesPlayed += 1;
if (winnerUsername === p1.username) {
p1.totalWins += 1;
p2.totalLosses += 1;
} else if (winnerUsername === p2.username) {
p2.totalWins += 1;
p1.totalLosses += 1;
}
this.saveUsers(users);
const currentUser = this.getCurrentUser();
if (currentUser) {
const updatedCurrent = users.find(u => u.username ===
currentUser.username);
if (updatedCurrent) this.setCurrentUser(updatedCurrent);
}
const matches = this.getMatches();
matches.push({
player1: player1Name,
player2: player2Name,
player1Score,
player2Score,
winner: winnerUsername,
category,
mode,
date: new Date().toLocaleString()
});
this.saveMatches(matches);
const h2h = this.getH2H();
const names = [player1Name, player2Name].sort();
const key = `${names[0]}__${names[1]}`;
if (!h2h[key]) {
h2h[key] = {
matches: 0,
[player1Name]: 0,
[player2Name]: 0,
[`${player1Name}Points`]: 0,
[`${player2Name}Points`]: 0
};
}
h2h[key].matches += 1;
h2h[key][`${player1Name}Points`] += player1Score;
h2h[key][`${player2Name}Points`] += player2Score;
if (winnerUsername === player1Name) h2h[key][player1Name] += 1;
if (winnerUsername === player2Name) h2h[key][player2Name] += 1;
this.saveH2H(h2h);
}
};
