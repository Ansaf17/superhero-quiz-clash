const state = window.DamonState;

const users = [...state.getUsers()].sort((a, b) => {
  if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
  return b.totalPoints - a.totalPoints;
});

const leaderboardList = document.getElementById("leaderboardList");
const historyList = document.getElementById("historyList");
const h2hList = document.getElementById("h2hList");

const currentUser = state.getCurrentUser();

if (users.length === 0) {
  leaderboardList.innerHTML = `<div class="leaderboard-item">No users yet.</div>`;
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
  historyList.innerHTML = `<div class="history-item">Log in to see your history.</div>`;
} else {
  const userMatches = matches.filter(
    match => match.player1 === currentUser.username || match.player2 === currentUser.username
  ).reverse();

  if (userMatches.length === 0) {
    historyList.innerHTML = `<div class="history-item">No match history yet.</div>`;
  } else {
    userMatches.forEach(match => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <p><strong>${match.player1}</strong> vs <strong>${match.player2}</strong></p>
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

const h2h = state.getH2H();

if (!currentUser) {
  h2hList.innerHTML = `<div class="h2h-item">Log in to see your head-to-head stats.</div>`;
} else {
  const relevantKeys = Object.keys(h2h).filter(key => key.includes(currentUser.username));

  if (relevantKeys.length === 0) {
    h2hList.innerHTML = `<div class="h2h-item">No head-to-head records yet.</div>`;
  } else {
    relevantKeys.forEach(key => {
      const record = h2h[key];
      const [nameA, nameB] = key.split("__");

      const item = document.createElement("div");
      item.className = "h2h-item";
      item.innerHTML = `
        <p><strong>${nameA}</strong> vs <strong>${nameB}</strong></p>
        <p>Total Matches: ${record.matches}</p>
        <p>${nameA} Wins: ${record[nameA] || 0}</p>
        <p>${nameB} Wins: ${record[nameB] || 0}</p>
        <p>${nameA} Total Points: ${record[`${nameA}Points`] || 0}</p>
        <p>${nameB} Total Points: ${record[`${nameB}Points`] || 0}</p>
      `;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "secondary";
      btn.style.marginTop = "10px";
      btn.textContent = "View Details";
      btn.onclick = () => {
        const target = `h2h.html?key=${encodeURIComponent(key)}`;
        if (window.DamonFX) {
          window.DamonFX.navigate(target);
        } else {
          window.location.href = target;
        }
      };

      item.appendChild(btn);
      h2hList.appendChild(item);
    });
  }
}