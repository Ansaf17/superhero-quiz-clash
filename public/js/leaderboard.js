const state = window.DamonState;

const leaderboardList = document.getElementById("leaderboardList");
const historyList = document.getElementById("historyList");
const h2hList = document.getElementById("h2hList");

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

function getPlayerTier(user) {
  if (user.totalWins >= 15) return { icon: "🏆", label: "Champion" };
  if (user.totalWins >= 8) return { icon: "🥇", label: "Elite" };
  if (user.totalWins >= 4) return { icon: "🥈", label: "Pro" };
  if (user.totalWins >= 1) return { icon: "🥉", label: "Rookie Winner" };
  return { icon: "🎯", label: "Beginner" };
}

function renderLeaderboard() {
  const users = [...state.getUsers()];

  const sortMode = leaderboardSort.value;

  users.sort((a, b) => {
    if (sortMode === "points") {
      return b.totalPoints - a.totalPoints;
    }

    if (sortMode === "matches") {
      return b.matchesPlayed - a.matchesPlayed;
    }

    if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
    return b.totalPoints - a.totalPoints;
  });

  leaderboardList.innerHTML = "";

  if (users.length === 0) {
    leaderboardList.innerHTML = `<div class="leaderboard-item">No users yet.</div>`;
    return;
  }

  users.forEach((user, index) => {
    const rank = index + 1;
    const medal = getMedalByRank(rank);
    const tier = getPlayerTier(user);

    const item = document.createElement("div");
    item.className = "leaderboard-item";
    item.innerHTML = `
      <div class="row-between">
        <div>
          <strong>${medal} #${rank} ${user.username}</strong>
        </div>
        <div style="font-size:1.4rem;">${user.avatar}</div>
      </div>

      <p><strong>Tier:</strong> ${tier.icon} ${tier.label}</p>
      <p>Wins: ${user.totalWins}</p>
      <p>Points: ${user.totalPoints}</p>
      <p>Matches Played: ${user.matchesPlayed}</p>
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
    match => match.player1 === currentUser.username || match.player2 === currentUser.username
  );

  if (selectedCategory !== "all") {
    userMatches = userMatches.filter(match => match.category === selectedCategory);
  }

  if (selectedMode !== "all") {
    userMatches = userMatches.filter(match => match.mode === selectedMode);
  }

  userMatches.reverse();

  if (userMatches.length === 0) {
    historyList.innerHTML = `<div class="history-item">No match history found for these filters.</div>`;
    return;
  }

  userMatches.forEach(match => {
    let medal = "🏅";

    if (match.winner === "draw") {
      medal = "🤝";
    } else if (match.winner === currentUser.username) {
      medal = "🏆";
    } else {
      medal = "💥";
    }

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <p><strong>${medal} ${match.player1}</strong> vs <strong>${match.player2}</strong></p>
      <p>Score: ${match.player1Score} - ${match.player2Score}</p>
      <p>Winner: ${match.winner}</p>
      <p>Category: ${match.category}</p>
      <p>Mode: ${match.mode}</p>
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

  const relevantKeys = Object.keys(h2h).filter(key => key.includes(currentUser.username));

  if (relevantKeys.length === 0) {
    h2hList.innerHTML = `<div class="h2h-item">No head-to-head records yet.</div>`;
    return;
  }

  relevantKeys.forEach(key => {
    const record = h2h[key];
    const [nameA, nameB] = key.split("__");

    let rivalryMedal = "⚔️";
    if ((record[nameA] || 0) >= 5 || (record[nameB] || 0) >= 5) {
      rivalryMedal = "🔥";
    }

    const item = document.createElement("div");
    item.className = "h2h-item";
    item.innerHTML = `
      <p><strong>${rivalryMedal} ${nameA}</strong> vs <strong>${nameB}</strong></p>
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

leaderboardSort.addEventListener("change", renderLeaderboard);
historyCategoryFilter.addEventListener("change", renderHistory);
historyModeFilter.addEventListener("change", renderHistory);

renderLeaderboard();
renderHistory();
renderH2H();