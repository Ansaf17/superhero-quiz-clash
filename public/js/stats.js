const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const allMatches = state.getMatches();
const userMatches = allMatches.filter(
  match => match.player1 === currentUser.username || match.player2 === currentUser.username
);

const statsAvatar = document.getElementById("statsAvatar");
const statsUsername = document.getElementById("statsUsername");
const statsSummaryText = document.getElementById("statsSummaryText");
const statsPoints = document.getElementById("statsPoints");
const statsWins = document.getElementById("statsWins");
const statsLosses = document.getElementById("statsLosses");
const statsMatches = document.getElementById("statsMatches");
const statsWinRate = document.getElementById("statsWinRate");
const statsBestCategory = document.getElementById("statsBestCategory");

const categoryChart = document.getElementById("categoryChart");
const modeChart = document.getElementById("modeChart");
const insightsList = document.getElementById("insightsList");
const recentMatchesSnapshot = document.getElementById("recentMatchesSnapshot");
const categoryTableBody = document.getElementById("categoryTableBody");

statsAvatar.textContent = currentUser.avatar;
statsUsername.textContent = currentUser.username;
statsPoints.textContent = currentUser.totalPoints;
statsWins.textContent = currentUser.totalWins;
statsLosses.textContent = currentUser.totalLosses;
statsMatches.textContent = currentUser.matchesPlayed;

const winRate = currentUser.matchesPlayed > 0
  ? Math.round((currentUser.totalWins / currentUser.matchesPlayed) * 100)
  : 0;

statsWinRate.textContent = `${winRate}%`;
statsSummaryText.textContent = `${currentUser.totalWins} wins • ${currentUser.totalPoints} points • ${currentUser.matchesPlayed} matches`;

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

let bestCategory = "-";
let bestCount = 0;

Object.entries(categoryStats).forEach(([category, count]) => {
  if (count > bestCount) {
    bestCount = count;
    bestCategory = category;
  }
});

statsBestCategory.textContent = bestCount > 0 ? bestCategory : "-";

function createBarChart(container, dataObject, labelsMap) {
  container.innerHTML = "";

  const maxValue = Math.max(...Object.values(dataObject), 1);

  Object.entries(dataObject).forEach(([key, value]) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const percent = (value / maxValue) * 100;

    row.innerHTML = `
      <div class="chart-row-top">
        <span>${labelsMap[key] || key}</span>
        <strong>${value}</strong>
      </div>
      <div class="chart-track">
        <div class="chart-fill" style="width:${percent}%;"></div>
      </div>
    `;

    container.appendChild(row);
  });
}

createBarChart(categoryChart, categoryStats, {
  math: "Maths",
  banana: "Banana API",
  general: "General Knowledge",
  programming: "Programming"
});

createBarChart(modeChart, modeStats, {
  pvp: "PVP",
  pc: "Player vs PC"
});

function buildInsights() {
  const insights = [];

  if (currentUser.matchesPlayed === 0) {
    insights.push("You have not played any matches yet. Start with Maths or PVP to build your stats.");
  } else {
    if (winRate >= 70) {
      insights.push("Your win rate is excellent. You are performing at a very competitive level.");
    } else if (winRate >= 50) {
      insights.push("Your win rate is solid. A few more wins can push you into a stronger tier.");
    } else {
      insights.push("Your win rate is below 50%. Practicing more in your best category can help.");
    }

    if (bestCategory !== "-") {
      insights.push(`Your strongest activity area appears to be ${bestCategory}.`);
    }

    if (modeStats.pc > modeStats.pvp) {
      insights.push("You play more Player vs PC matches than PVP matches.");
    } else if (modeStats.pvp > modeStats.pc) {
      insights.push("You play more PVP matches than Player vs PC matches.");
    }

    if (currentUser.totalPoints >= 100) {
      insights.push("You have crossed 100 total points, which is a strong milestone.");
    }

    if (currentUser.totalWins >= 10) {
      insights.push("You have reached double-digit wins. That is a strong competitive indicator.");
    }
  }

  insightsList.innerHTML = "";
  insights.forEach(text => {
    const item = document.createElement("div");
    item.className = "insight-item";
    item.textContent = text;
    insightsList.appendChild(item);
  });
}

buildInsights();

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

const totalCategoryMatches = Object.values(categoryStats).reduce((sum, value) => sum + value, 0);

categoryTableBody.innerHTML = "";
Object.entries(categoryStats).forEach(([category, count]) => {
  const row = document.createElement("tr");
  const share = totalCategoryMatches > 0 ? Math.round((count / totalCategoryMatches) * 100) : 0;

  row.innerHTML = `
    <td>${category}</td>
    <td>${count}</td>
    <td>${share}%</td>
  `;

  categoryTableBody.appendChild(row);
});

if (window.DamonToast && userMatches.length > 0) {
  window.DamonToast.show("Analytics dashboard loaded successfully.", "success", 1800);
}