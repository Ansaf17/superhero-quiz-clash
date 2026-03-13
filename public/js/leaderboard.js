const state = window.DamonState;

const leaderboardList = document.getElementById("leaderboardList");
const historyList = document.getElementById("historyList");
const h2hList = document.getElementById("h2hList");
const podiumWrap = document.getElementById("podiumWrap");

const leaderboardSort = document.getElementById("leaderboardSort");
const historyCategoryFilter = document.getElementById("historyCategoryFilter");
const historyModeFilter = document.getElementById("historyModeFilter");

const currentUser = state.getCurrentUser();

function getMedalByRank(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "🏅";
}

function getSortedUsers() {
  const users = [...state.getUsers()];
  const sortMode = leaderboardSort.value;

  users.sort((a, b) => {
    if (sortMode === "points") return b.totalPoints - a.totalPoints;
    if (sortMode === "xp") return b.xp - a.xp;
    if (sortMode === "level") return b.level - a.level;
    if (sortMode === "matches") return b.matchesPlayed - a.matchesPlayed;

    if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
    return b.totalPoints - a.totalPoints;
  });

  return users;
}

function renderXpBar(user) {
  const xpState = state.getXpIntoCurrentLevel(user.xp);
  const percent = (xpState.xpIntoLevel / xpState.xpNeededForNextLevel) * 100;

  return `
    <div class="xp-bar-card compact-xp-bar">
      <div class="xp-bar-header">
        <span>XP</span>
        <span>${xpState.xpIntoLevel}/${xpState.xpNeededForNextLevel}</span>
      </div>
      <div class="xp-bar-track">
        <div class="xp-bar-fill" style="width:${percent}%;"></div>
      </div>
    </div>
  `;
}

function renderPodium(users) {
  podiumWrap.innerHTML = "";

  if (users.length === 0) {
    podiumWrap.innerHTML = `<div class="leaderboard-item">No users yet.</div>`;
    return;
  }

  const topThree = users.slice(0, 3);

  const order = [
    topThree[1] || null,
    topThree[0] || null,
    topThree[2] || null
  ];

  order.forEach((user, index) => {
    if (!user) return;

    const visualRank = index === 1 ? 1 : index === 0 ? 2 : 3;
    const podium = document.createElement("div");
    podium.className = `podium-player podium-rank-${visualRank}`;

    podium.innerHTML = `
      <div class="podium-medal">${getMedalByRank(visualRank)}</div>
      <div class="podium-avatar">${user.avatar}</div>
      <h3>${user.username}</h3>
      <div class="leaderboard-badges">
        <span class="rank-badge">${state.getTierEmoji(user.leaderboardTier)} ${user.leaderboardTier}</span>
        <span class="title-badge">⭐ ${user.rankTitle}</span>
      </div>
      <p>Wins: ${user.totalWins}</p>
      <p>XP: ${user.xp}</p>
      ${renderXpBar(user)}
      <div class="podium-block podium-block-${visualRank}">#${visualRank}</div>
    `;

    podiumWrap.appendChild(podium);
  });
}

function renderLeaderboard() {
  const users = getSortedUsers();

  leaderboardList.innerHTML = "";
  renderPodium(users);

  if (users.length === 0) {
    leaderboardList.innerHTML = `<div class="leaderboard-item">No users yet.</div>`;
    return;
  }

  users.forEach((user, index) => {
    const medal = getMedalByRank(index + 1);

    const item = document.createElement("div");
    item.className = "leaderboard-item";
    item.innerHTML = `
      <div class="row-between">
        <div>
          <strong>${medal} #${index + 1} ${user.username}</strong>
        </div>
        <div style="font-size:1.5rem;">${user.avatar}</div>
      </div>

      <div class="leaderboard-badges" style="margin-top:10px;">
        <span class="rank-badge">${state.getTierEmoji(user.leaderboardTier)} ${user.leaderboardTier}</span>
        <span class="title-badge">⭐ ${user.rankTitle}</span>
        <span class="level-badge">LV ${user.level}</span>
      </div>

      <p><strong>Wins:</strong> ${user.totalWins}</p>
      <p><strong>Points:</strong> ${user.totalPoints}</p>
      <p><strong>Matches Played:</strong> ${user.matchesPlayed}</p>
      <p><strong>XP:</strong> ${user.xp}</p>
      ${renderXpBar(user)}
    `;
    leaderboardList.appendChild(item);
  });
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!currentUser) {
    historyList.innerHTML = `<div class="history-item">Log in to see your history.</div>`;
    return;
  }

  const matches = state.getMatches();
  const selectedCategory = historyCategoryFilter.value;
  const selectedMode = historyModeFilter.value;

  let userMatches = matches.filter(
    (match) => match.player1 === currentUser.username || match.player2 === currentUser.username
  );

  if (selectedCategory !== "all") {
    userMatches = userMatches.filter((match) => match.category === selectedCategory);
  }

  if (selectedMode !== "all") {
    userMatches = userMatches.filter((match) => match.mode === selectedMode);
  }

  userMatches.reverse();

  if (userMatches.length === 0) {
    historyList.innerHTML = `<div class="history-item">No match history found for these filters.</div>`;
    return;
  }

  userMatches.forEach((match) => {
    let resultIcon = "🏅";

    if (match.winner === "draw") {
      resultIcon = "🤝";
    } else if (match.winner === currentUser.username) {
      resultIcon = "🏆";
    } else {
      resultIcon = "💥";
    }

    const currentUserXpGain =
      match.player1 === currentUser.username ? (match.player1XpGain || 0) : (match.player2XpGain || 0);

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <p><strong>${resultIcon} ${match.player1}</strong> vs <strong>${match.player2}</strong></p>
      <p>Score: ${match.player1Score} - ${match.player2Score}</p>
      <p>Winner: ${match.winner}</p>
      <p>Category: ${match.category}</p>
      <p>Mode: ${match.mode}</p>
      <p>XP Gained: ${currentUserXpGain}</p>
      <p>Date: ${match.date}</p>
    `;
    historyList.appendChild(item);
  });
}

function renderH2H() {
  h2hList.innerHTML = "";

  const h2h = state.getH2H();

  if (!currentUser) {
    h2hList.innerHTML = `<div class="h2h-item">Log in to see your head-to-head stats.</div>`;
    return;
  }

  const relevantKeys = Object.keys(h2h).filter((key) => key.includes(currentUser.username));

  if (relevantKeys.length === 0) {
    h2hList.innerHTML = `<div class="h2h-item">No head-to-head records yet.</div>`;
    return;
  }

  relevantKeys.forEach((key) => {
    const record = h2h[key];
    const [nameA, nameB] = key.split("__");

    const item = document.createElement("div");
    item.className = "h2h-item";
    item.innerHTML = `
      <p><strong>⚔️ ${nameA}</strong> vs <strong>${nameB}</strong></p>
      <p>Total Matches: ${record.matches}</p>
      <p>${nameA} Wins: ${record[nameA] || 0}</p>
      <p>${nameB} Wins: ${record[nameB] || 0}</p>
      <p>${nameA} Total Points: ${record[`${nameA}Points`] || 0}</p>
      <p>${nameB} Total Points: ${record[`${nameB}Points`] || 0}</p>
    `;

    h2hList.appendChild(item);
  });
}

leaderboardSort.addEventListener("change", renderLeaderboard);
historyCategoryFilter.addEventListener("change", renderHistory);
historyModeFilter.addEventListener("change", renderHistory);

renderLeaderboard();
renderHistory();
renderH2H();
