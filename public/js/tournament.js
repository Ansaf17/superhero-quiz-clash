const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const messageBox = document.getElementById("messageBox");
const tournamentCategory = document.getElementById("tournamentCategory");
const tournamentDifficulty = document.getElementById("tournamentDifficulty");
const startTournamentBtn = document.getElementById("startTournamentBtn");
const continueTournamentBtn = document.getElementById("continueTournamentBtn");
const resetTournamentBtn = document.getElementById("resetTournamentBtn");
const tournamentBracket = document.getElementById("tournamentBracket");

const BOT_POOL = [
  { username: "Slow Thinker", avatar: "🐢", personality: "slowThinker" },
  { username: "Speed Demon", avatar: "⚡", personality: "speedDemon" },
  { username: "Troll Bot", avatar: "😈", personality: "trollBot" },
  { username: "Genius Bot", avatar: "🧠", personality: "geniusBot" }
];

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function getTournamentState() {
  return JSON.parse(localStorage.getItem("damonTournament") || "null");
}

function saveTournamentState(data) {
  localStorage.setItem("damonTournament", JSON.stringify(data));
}

function clearTournamentState() {
  localStorage.removeItem("damonTournament");
}

function pickTournamentBots() {
  const shuffled = state.shuffle(BOT_POOL);
  return shuffled.slice(0, 3);
}

function getBotStrength(personality, difficulty) {
  const diffMap = {
    easy: 0.45,
    medium: 0.65,
    hard: 0.82
  };

  let score = diffMap[difficulty] || 0.45;

  if (personality === "slowThinker") score += 0.03;
  if (personality === "speedDemon") score -= 0.02;
  if (personality === "trollBot") score += Math.random() > 0.5 ? 0.12 : -0.12;
  if (personality === "geniusBot") score += 0.08;

  return score;
}

function simulateBotMatch(botA, botB, difficulty) {
  const aStrength = getBotStrength(botA.personality, difficulty);
  const bStrength = getBotStrength(botB.personality, difficulty);

  let aScore = 0;
  let bScore = 0;

  for (let i = 0; i < 5; i += 1) {
    if (Math.random() < aStrength) aScore += 10;
    if (Math.random() < bStrength) bScore += 10;
  }

  if (aScore === bScore) {
    if (Math.random() > 0.5) aScore += 10;
    else bScore += 10;
  }

  return {
    winner: aScore > bScore ? botA : botB,
    scoreA: aScore,
    scoreB: bScore
  };
}

function buildTournamentState(category, difficulty) {
  const bots = pickTournamentBots();

  const semi2 = simulateBotMatch(bots[1], bots[2], difficulty);

  return {
    active: true,
    completed: false,
    champion: false,
    category,
    difficulty,
    player: {
      username: currentUser.username,
      avatar: currentUser.avatar
    },
    semifinalOpponent: bots[0],
    finalOpponent: semi2.winner,
    bracket: {
      semifinal1: {
        player1: currentUser.username,
        player2: bots[0].username,
        winner: null
      },
      semifinal2: {
        player1: bots[1].username,
        player2: bots[2].username,
        winner: semi2.winner.username,
        scoreText: `${bots[1].username} ${semi2.scoreA} - ${semi2.scoreB} ${bots[2].username}`
      },
      final: {
        player1: null,
        player2: semi2.winner.username,
        winner: null
      }
    },
    currentStage: "semifinal"
  };
}

function renderBracket() {
  const tournament = getTournamentState();

  if (!tournament) {
    tournamentBracket.innerHTML = `
      <div class="mini-info-card">No active tournament yet. Start one to build the bracket.</div>
    `;
    return;
  }

  tournamentBracket.innerHTML = `
    <div class="tournament-stage-grid">
      <div class="card tournament-match-card">
        <h3>Semi-final 1</h3>
        <p>${tournament.bracket.semifinal1.player1} vs ${tournament.bracket.semifinal1.player2}</p>
        <p><strong>Winner:</strong> ${tournament.bracket.semifinal1.winner || "Pending"}</p>
      </div>

      <div class="card tournament-match-card">
        <h3>Semi-final 2</h3>
        <p>${tournament.bracket.semifinal2.player1} vs ${tournament.bracket.semifinal2.player2}</p>
        <p>${tournament.bracket.semifinal2.scoreText || ""}</p>
        <p><strong>Winner:</strong> ${tournament.bracket.semifinal2.winner || "Pending"}</p>
      </div>

      <div class="card tournament-match-card">
        <h3>Final</h3>
        <p>${tournament.bracket.final.player1 || "TBD"} vs ${tournament.bracket.final.player2 || "TBD"}</p>
        <p><strong>Winner:</strong> ${tournament.bracket.final.winner || "Pending"}</p>
      </div>
    </div>

    <div class="card tournament-status-card">
      <h3>Status</h3>
      <p><strong>Category:</strong> ${tournament.category}</p>
      <p><strong>Difficulty:</strong> ${tournament.difficulty}</p>
      <p><strong>Current Stage:</strong> ${tournament.currentStage}</p>
      <p><strong>Champion:</strong> ${tournament.champion ? "Yes" : "No"}</p>
      <p><strong>Completed:</strong> ${tournament.completed ? "Yes" : "No"}</p>
    </div>
  `;
}

function launchTournamentBattle() {
  const tournament = getTournamentState();

  if (!tournament) {
    showMessage("No active tournament found.", "error");
    return;
  }

  let opponent = null;
  let stage = tournament.currentStage;

  if (stage === "semifinal") {
    opponent = tournament.semifinalOpponent;
  } else if (stage === "final") {
    opponent = tournament.finalOpponent;
  } else {
    showMessage("Tournament is already completed.", "error");
    return;
  }

  state.setBattleConfig({
    mode: "tournament",
    stage,
    category: tournament.category,
    botDifficulty: tournament.difficulty,
    botPersonality: opponent.personality,
    player1: {
      username: currentUser.username,
      avatar: currentUser.avatar
    },
    player2: {
      username: opponent.username,
      avatar: opponent.avatar,
      isBot: true
    }
  });

  window.location.href = "game.html";
}

startTournamentBtn.onclick = () => {
  const category = tournamentCategory.value;
  const difficulty = tournamentDifficulty.value;

  const tournament = buildTournamentState(category, difficulty);
  saveTournamentState(tournament);
  renderBracket();
  showMessage("Tournament created successfully.", "success");
  launchTournamentBattle();
};

continueTournamentBtn.onclick = () => {
  const tournament = getTournamentState();

  if (!tournament) {
    showMessage("No active tournament to continue.", "error");
    return;
  }

  if (tournament.completed) {
    showMessage("Tournament is already completed.", "error");
    return;
  }

  launchTournamentBattle();
};

resetTournamentBtn.onclick = () => {
  clearTournamentState();
  renderBracket();
  showMessage("Tournament reset.", "success");
};

renderBracket();