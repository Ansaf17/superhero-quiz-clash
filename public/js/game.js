const state = window.DamonState;
const config = state.getBattleConfig();

if (!config) {
  window.location.href = "home.html";
}

const settings = state.getSettings() || state.getDefaultSettings();

const messageBox = document.getElementById("messageBox");
const p1Avatar = document.getElementById("p1Avatar");
const p2Avatar = document.getElementById("p2Avatar");
const p1Name = document.getElementById("p1Name");
const p2Name = document.getElementById("p2Name");
const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const p1StreakDisplay = document.getElementById("p1StreakDisplay");
const p2StreakDisplay = document.getElementById("p2StreakDisplay");
const turnIndicator = document.getElementById("turnIndicator");
const timerText = document.getElementById("timerText");
const roundNumber = document.getElementById("roundNumber");
const questionText = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answer-btn");
const resultCard = document.getElementById("resultCard");
const resultBadge = document.getElementById("resultBadge");
const winnerText = document.getElementById("winnerText");
const finalScoreText = document.getElementById("finalScoreText");
const resultMetaText = document.getElementById("resultMetaText");
const progressSummary = document.getElementById("progressSummary");
const streakBanner = document.getElementById("streakBanner");

const totalRounds = 5;
const turnTimeLimit = Number(settings.turnTimer || 10);

let player1Score = 0;
let player2Score = 0;
let currentTurn = "player1";
let currentRound = 1;
let correctIndex = 0;
let turnLocked = false;
let timerInterval = null;
let timeLeft = turnTimeLimit;
let botThinkingTimeout = null;

let player1Streak = 0;
let player2Streak = 0;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function showStreakBanner(text) {
  streakBanner.textContent = text;
  streakBanner.classList.remove("hidden");
  streakBanner.classList.add("streak-banner-show");

  setTimeout(() => {
    streakBanner.classList.remove("streak-banner-show");
    streakBanner.classList.add("hidden");
  }, 1400);
}

function updateHeader() {
  p1Avatar.textContent = config.player1.avatar;
  p2Avatar.textContent = config.player2.avatar;
  p1Name.textContent = config.player1.username;
  p2Name.textContent = config.player2.username;
  p1ScoreEl.textContent = player1Score;
  p2ScoreEl.textContent = player2Score;
  p1StreakDisplay.textContent = player1Streak;
  p2StreakDisplay.textContent = player2Streak;
  roundNumber.textContent = currentRound;
  turnIndicator.textContent = `Turn: ${currentTurn === "player1" ? config.player1.username : config.player2.username}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function stopBotThinking() {
  if (botThinkingTimeout) {
    clearTimeout(botThinkingTimeout);
    botThinkingTimeout = null;
  }
}

function startTimer() {
  stopTimer();
  timeLeft = turnTimeLimit;
  timerText.textContent = `Time Left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timerText.textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      stopTimer();
      handleTimeUp();
    }
  }, 1000);
}

function resetAnswers() {
  answerButtons.forEach((btn) => {
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
    btn.textContent = "Loading...";
  });
}

function setOptions(options, correctValue) {
  const shuffled = state.shuffle(options);
  correctIndex = shuffled.indexOf(correctValue);

  answerButtons.forEach((btn, idx) => {
    btn.textContent = shuffled[idx];
    btn.disabled = false;
    btn.classList.remove("correct", "wrong");
  });
}

function applyStreakBonus(playerKey) {
  let bonus = 0;
  let streak = 0;
  let username = "";

  if (playerKey === "player1") {
    streak = player1Streak;
    username = config.player1.username;
  } else {
    streak = player2Streak;
    username = config.player2.username;
  }

  if (streak > 0 && streak % 5 === 0) {
    bonus = 10;
  } else if (streak > 0 && streak % 3 === 0) {
    bonus = 5;
  }

  if (bonus > 0) {
    if (playerKey === "player1") {
      player1Score += bonus;
    } else {
      player2Score += bonus;
    }

    showStreakBanner(`🔥 ${username} earned a +${bonus} streak bonus!`);
  }
}

async function generateMathQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let correct = 0;
  if (op === "+") correct = a + b;
  if (op === "-") correct = a - b;
  if (op === "*") correct = a * b;

  questionText.textContent = `Question: ${a} ${op === "*" ? "×" : op} ${b}`;

  const set = new Set([correct]);
  while (set.size < 4) {
    set.add(correct + (Math.floor(Math.random() * 7) - 3));
  }

  setOptions(Array.from(set), correct);
}

async function generateBananaQuestion() {
  const response = await fetch("https://marcconrad.com/uob/banana/api.php");
  const data = await response.json();
  const solution = Number(data.solution);

  questionText.innerHTML = `
    <div>
      <p>Solve the Banana Puzzle</p>
      <img src="${data.question}" alt="Banana puzzle">
    </div>
  `;

  const set = new Set([solution]);
  while (set.size < 4) {
    set.add(solution + (Math.floor(Math.random() * 7) - 3));
  }

  setOptions(Array.from(set), solution);
}

async function generateGeneralQuestion() {
  const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
  const data = await response.json();

  if (!data.results || !data.results.length) {
    throw new Error("No general question returned");
  }

  const q = data.results[0];
  const question = state.decodeHtml(q.question);
  const correct = state.decodeHtml(q.correct_answer);
  const incorrect = q.incorrect_answers.map((a) => state.decodeHtml(a));

  questionText.textContent = `Question: ${question}`;
  setOptions([correct, ...incorrect], correct);
}

async function generateProgrammingQuestion() {
  const response = await fetch("https://opentdb.com/api.php?amount=1&category=18&type=multiple");
  const data = await response.json();

  if (!data.results || !data.results.length) {
    throw new Error("No programming question returned");
  }

  const q = data.results[0];
  const question = state.decodeHtml(q.question);
  const correct = state.decodeHtml(q.correct_answer);
  const incorrect = q.incorrect_answers.map((a) => state.decodeHtml(a));

  questionText.textContent = `Question: ${question}`;
  setOptions([correct, ...incorrect], correct);
}

async function generateQuestion() {
  resetAnswers();

  try {
    if (config.category === "math") {
      await generateMathQuestion();
    } else if (config.category === "banana") {
      await generateBananaQuestion();
    } else if (config.category === "general") {
      await generateGeneralQuestion();
    } else if (config.category === "programming") {
      await generateProgrammingQuestion();
    } else {
      await generateMathQuestion();
    }

    startTimer();
  } catch (err) {
    console.error(err);
    showMessage("Question API failed. Falling back to maths.", "error");
    await generateMathQuestion();
    startTimer();
  }
}

function getBotProfile() {
  const difficulty = config.botDifficulty || "easy";

  if (difficulty === "easy") {
    return { accuracy: 0.45, minDelay: 2800, maxDelay: 5200 };
  }

  if (difficulty === "medium") {
    return { accuracy: 0.68, minDelay: 1800, maxDelay: 3600 };
  }

  return { accuracy: 0.85, minDelay: 1200, maxDelay: 2500 };
}

function getBotChoiceIndex() {
  const profile = getBotProfile();
  const shouldBeCorrect = Math.random() < profile.accuracy;

  if (shouldBeCorrect) {
    return correctIndex;
  }

  const wrongIndexes = [0, 1, 2, 3].filter((index) => index !== correctIndex);
  return wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
}

function triggerBotTurn() {
  if (!(config.mode === "pc" && config.player2.isBot && currentTurn === "player2")) {
    return;
  }

  const profile = getBotProfile();
  const delay = profile.minDelay + Math.floor(Math.random() * (profile.maxDelay - profile.minDelay + 1));

  botThinkingTimeout = setTimeout(() => {
    const botPick = getBotChoiceIndex();
    handleAnswerClick(botPick);
  }, delay);
}

function getResultBadge(winner) {
  if (winner === "draw") return "🤝";

  if (winner === config.player1.username) {
    if (player1Score >= 40) return "🏆";
    if (player1Score >= 30) return "🥇";
    if (player1Score >= 20) return "🥈";
    return "🥉";
  }

  return "💥";
}

function renderProgressCard(title, progress) {
  return `
    <div class="progress-card">
      <h3>${title}</h3>
      <p><strong>XP:</strong> +${progress.xpGain} (${progress.oldXp} → ${progress.newXp})</p>
      <p><strong>Level:</strong> ${progress.oldLevel} → ${progress.newLevel}${progress.leveledUp ? " 🎉" : ""}</p>
      <p><strong>Rank Title:</strong> ${progress.oldRankTitle} → ${progress.newRankTitle}${progress.rankChanged ? " ✨" : ""}</p>
      <p><strong>Tier:</strong> ${progress.oldTier} → ${progress.newTier}${progress.tierChanged ? " 🏅" : ""}</p>
    </div>
  `;
}

function finishMatch() {
  stopTimer();
  stopBotThinking();

  let winner = "draw";
  let resultText = "🤝 The battle ended in a draw!";

  if (player1Score > player2Score) {
    winner = config.player1.username;
    resultText = `🏆 ${config.player1.username} wins the battle!`;
  } else if (player2Score > player1Score) {
    winner = config.player2.username;
    resultText = `🏆 ${config.player2.username} wins the battle!`;
  }

  resultBadge.textContent = getResultBadge(winner);
  winnerText.textContent = resultText;
  finalScoreText.textContent = `Final Score: ${config.player1.username} ${player1Score} - ${player2Score} ${config.player2.username}`;

  let progressSummaryText = `Category: ${config.category} | Mode: ${config.mode} | Timer: ${turnTimeLimit}s`;
  progressSummary.innerHTML = "";

  if (!config.player2.isBot) {
    const result = state.saveUserStats(
      config.player1.username,
      config.player2.username,
      player1Score,
      player2Score,
      winner,
      config.category,
      config.mode
    );

    if (result) {
      progressSummary.innerHTML = `
        <div class="progress-grid">
          ${renderProgressCard(config.player1.username, result.player1Progress)}
          ${renderProgressCard(config.player2.username, result.player2Progress)}
        </div>
      `;
    }
  } else {
    const users = state.getUsers();
    const p1 = users.find((u) => u.username === config.player1.username);

    if (p1) {
      p1.totalPoints += player1Score;
      p1.matchesPlayed += 1;

      if (winner === p1.username) {
        p1.totalWins += 1;
      } else if (winner !== "draw") {
        p1.totalLosses += 1;
      }

      p1.leaderboardTier = state.getLeaderboardTier(p1.totalWins);

      const xpGain = state.calculateXpGain(player1Score, winner, p1.username);
      const progress = state.applyProgress(p1, xpGain);

      state.saveUsers(users);
      state.setCurrentUser(p1);

      const matches = state.getMatches();
      matches.push({
        player1: config.player1.username,
        player2: config.player2.username,
        player1Score,
        player2Score,
        winner,
        category: config.category,
        mode: config.mode,
        difficulty: config.botDifficulty || "easy",
        timer: turnTimeLimit,
        player1XpGain: xpGain,
        player2XpGain: 0,
        date: new Date().toLocaleString()
      });
      state.saveMatches(matches);

      progressSummary.innerHTML = `
        <div class="progress-grid">
          ${renderProgressCard(config.player1.username, progress)}
        </div>
      `;
    }
  }

  resultMetaText.innerHTML = progressSummaryText;

  resultCard.classList.remove("hidden");
  showMessage("Match completed successfully.", "success");

  if (window.DamonFX && winner !== "draw") {
    window.DamonFX.playWin();
  }
}

async function nextTurn() {
  resetAnswers();
  turnLocked = false;
  stopBotThinking();

  if (currentTurn === "player1") {
    currentTurn = "player2";
    updateHeader();
    await generateQuestion();

    if (config.mode === "pc" && config.player2.isBot) {
      triggerBotTurn();
    }

    return;
  }

  if (currentRound === totalRounds) {
    finishMatch();
    return;
  }

  currentTurn = "player1";
  currentRound += 1;
  updateHeader();
  await generateQuestion();
}

function resetCurrentPlayerStreak() {
  if (currentTurn === "player1") {
    player1Streak = 0;
  } else {
    player2Streak = 0;
  }
}

function handleTimeUp() {
  if (turnLocked) return;

  turnLocked = true;
  stopBotThinking();
  resetCurrentPlayerStreak();

  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });

  answerButtons[correctIndex].classList.add("correct");
  showMessage("Time is up! Turn skipped.", "error");

  if (window.DamonFX) {
    window.DamonFX.playTimeout();
  }

  updateHeader();
  setTimeout(() => nextTurn(), 1200);
}

function handleAnswerClick(index) {
  if (turnLocked) return;

  turnLocked = true;
  stopTimer();
  stopBotThinking();

  const correctBtn = answerButtons[correctIndex];
  correctBtn.classList.add("correct");

  if (index === correctIndex) {
    if (currentTurn === "player1") {
      player1Score += 10;
      player1Streak += 1;
      applyStreakBonus("player1");
      player2Streak = 0;
    } else {
      player2Score += 10;
      player2Streak += 1;
      applyStreakBonus("player2");
      player1Streak = 0;
    }

    showMessage("Correct answer!", "success");

    if (window.DamonFX) {
      window.DamonFX.playCorrect();
    }
  } else {
    answerButtons[index].classList.add("wrong");
    resetCurrentPlayerStreak();

    showMessage("Wrong answer!", "error");

    if (window.DamonFX) {
      window.DamonFX.playWrong();
    }
  }

  updateHeader();
  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });

  setTimeout(() => nextTurn(), 1200);
}

answerButtons.forEach((btn, idx) => {
  btn.onclick = () => handleAnswerClick(idx);
});

document.getElementById("sameCategoryRematchBtn").onclick = () => {
  if (window.DamonFX) {
    window.DamonFX.navigate("game.html");
  } else {
    window.location.href = "game.html";
  }
};

document.getElementById("newCategoryBtn").onclick = () => {
  if (window.DamonFX) {
    window.DamonFX.navigate("category.html");
  } else {
    window.location.href = "category.html";
  }
};

document.getElementById("historyBtn").onclick = () => {
  if (window.DamonFX) {
    window.DamonFX.navigate("leaderboard.html");
  } else {
    window.location.href = "leaderboard.html";
  }
};

resultCard.classList.add("hidden");
updateHeader();
generateQuestion();