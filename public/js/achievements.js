const state = window.DamonState;
const currentUser = state.getCurrentUser();
const summaryBox = document.getElementById("achievementSummary");
const achievementGrid = document.getElementById("achievementGrid");

if (!currentUser) {
  window.location.href = "home.html";
}

const matches = state.getMatches();
const userMatches = matches.filter(
  match => match.player1 === currentUser.username || match.player2 === currentUser.username
);

const pvpMatches = userMatches.filter(match => match.mode === "pvp");
const pcMatches = userMatches.filter(match => match.mode === "pc");
const bananaMatches = userMatches.filter(match => match.category === "banana");
const mathMatches = userMatches.filter(match => match.category === "math");
const generalMatches = userMatches.filter(match => match.category === "general");
const programmingMatches = userMatches.filter(match => match.category === "programming");

function getUnlockedAchievements() {
  return [
    {
      icon: "🎯",
      title: "First Steps",
      description: "Play your first DAMON match",
      unlocked: currentUser.matchesPlayed >= 1
    },
    {
      icon: "🥉",
      title: "First Victory",
      description: "Win your first match",
      unlocked: currentUser.totalWins >= 1
    },
    {
      icon: "🥈",
      title: "Winning Streak",
      description: "Reach 5 total wins",
      unlocked: currentUser.totalWins >= 5
    },
    {
      icon: "🥇",
      title: "Elite Player",
      description: "Reach 10 total wins",
      unlocked: currentUser.totalWins >= 10
    },
    {
      icon: "🏆",
      title: "Champion",
      description: "Reach 15 total wins",
      unlocked: currentUser.totalWins >= 15
    },
    {
      icon: "⚔️",
      title: "PVP Fighter",
      description: "Play 3 PVP matches",
      unlocked: pvpMatches.length >= 3
    },
    {
      icon: "🤖",
      title: "Bot Hunter",
      description: "Play 3 Player vs PC matches",
      unlocked: pcMatches.length >= 3
    },
    {
      icon: "🍌",
      title: "Banana Solver",
      description: "Play 3 Banana API matches",
      unlocked: bananaMatches.length >= 3
    },
    {
      icon: "➗",
      title: "Math Master",
      description: "Play 3 Maths matches",
      unlocked: mathMatches.length >= 3
    },
    {
      icon: "🌍",
      title: "Knowledge Seeker",
      description: "Play 3 General Knowledge matches",
      unlocked: generalMatches.length >= 3
    },
    {
      icon: "💻",
      title: "Code Warrior",
      description: "Play 3 Programming matches",
      unlocked: programmingMatches.length >= 3
    },
    {
      icon: "💯",
      title: "Point Collector",
      description: "Reach 100 total points",
      unlocked: currentUser.totalPoints >= 100
    }
  ];
}

const achievements = getUnlockedAchievements();
const unlockedCount = achievements.filter(item => item.unlocked).length;

summaryBox.innerHTML = `
  <div class="achievement-summary-layout">
    <div class="achievement-summary-avatar">${currentUser.avatar}</div>
    <div>
      <h2 style="margin:0;">${currentUser.username}</h2>
      <p style="margin:8px 0 0; color:#cbd5e1;">
        Unlocked ${unlockedCount} / ${achievements.length} achievements
      </p>
    </div>
  </div>
`;

achievementGrid.innerHTML = "";

achievements.forEach(item => {
  const card = document.createElement("section");
  card.className = `card achievement-card ${item.unlocked ? "achievement-unlocked" : "achievement-locked"}`;

  card.innerHTML = `
    <div class="achievement-icon">${item.icon}</div>
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="achievement-status">${item.unlocked ? "Unlocked" : "Locked"}</div>
  `;

  achievementGrid.appendChild(card);
});