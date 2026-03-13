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
const p2StreakRow = document.getElementById("p2StreakRow");
const turnIndicator = document.getElementById("turnIndicator");
const timerText = document.getElementById("timerText");
const roundNumber = document.getElementById("roundNumber");
const roundTotal = document.getElementById("roundTotal");
const questionText = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answer-btn");

const resultCard = document.getElementById("resultCard");
const resultBadge = document.getElementById("resultBadge");
const winnerText = document.getElementById("winnerText");
const finalScoreText = document.getElementById("finalScoreText");
const resultMetaText = document.getElementById("resultMetaText");
const progressSummary = document.getElementById("progressSummary");
const unlockedAchievements = document.getElementById("unlockedAchievements");
const dailyChallengeStatus = document.getElementById("dailyChallengeStatus");
const powerupRewardsBox = document.getElementById("powerupRewardsBox");

const streakBanner = document.getElementById("streakBanner");
const botPersonalityText = document.getElementById("botPersonalityText");
const achievementPopupStack = document.getElementById("achievementPopupStack");
const confettiContainer = document.getElementById("confettiContainer");
const bossBanner = document.getElementById("bossBanner");
const bossHpRow = document.getElementById("bossHpRow");
const bossHpText = document.getElementById("bossHpText");

const powerup5050Btn = document.getElementById("powerup5050Btn");
const powerupSkipBtn = document.getElementById("powerupSkipBtn");
const powerupTimeBtn = document.getElementById("powerupTimeBtn");
const powerupDoubleBtn = document.getElementById("powerupDoubleBtn");

const powerup5050Count = document.getElementById("powerup5050Count");
const powerupSkipCount = document.getElementById("powerupSkipCount");
const powerupTimeCount = document.getElementById("powerupTimeCount");
const powerupDoubleCount = document.getElementById("powerupDoubleCount");

const totalRounds = config.mode === "boss" ? 7 : 5;
const turnTimeLimit = Number(settings.turnTimer || 10);

let player1Score = 0;
let player2Score = 0;
let currentTurn = "player1";
let currentRound = 1;
let correctIndex = -1;
let questionReady = false;
let turnLocked = true;
let timerInterval = null;
let timeLeft = turnTimeLimit;
let botThinkingTimeout = null;

let player1Streak = 0;
let player2Streak = 0;
let player1CorrectAnswers = 0;
let player2CorrectAnswers = 0;
let removedIndexes = [];
let bossHp = config.mode === "boss" ? Number(config.bossProfile?.hp || 50) : 0;

const freshUsers = state.getUsers();
const freshPlayer1 = freshUsers.find((u) => u.username === config.player1.username);

let player1Powerups = {
  fiftyFifty: Number(freshPlayer1?.powerupInventory?.fiftyFifty || 1),
  skip: Number(freshPlayer1?.powerupInventory?.skip || 1),
  extraTime: Number(freshPlayer1?.powerupInventory?.extraTime || 1),
  doublePoints: Number(freshPlayer1?.powerupInventory?.doublePoints || 1),
  doublePointsActive: false
};

let player2Powerups =
  config.mode === "pc" || config.mode === "boss"
    ? { fiftyFifty: 1, skip: 1, extraTime: 1, doublePoints: 1, doublePointsActive: false }
    : { fiftyFifty: 1, skip: 1, extraTime: 1, doublePoints: 1, doublePointsActive: false };

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

function showAchievementPopup(title, description) {
  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerHTML = `
    <div class="achievement-popup-icon">🏆</div>
    <div>
      <strong>${title}</strong>
      <p>${description}</p>
    </div>
  `;
  achievementPopupStack.appendChild(popup);

  requestAnimationFrame(() => {
    popup.classList.add("achievement-popup-show");
  });

  setTimeout(() => {
    popup.classList.remove("achievement-popup-show");
    popup.classList.add("achievement-popup-hide");
    setTimeout(() => popup.remove(), 300);
  }, 2600);
}

function launchConfetti() {
  confettiContainer.innerHTML = "";

  for (let i = 0; i < 36; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.background = ["#facc15", "#38bdf8", "#a855f7", "#22c55e", "#fb7185"][Math.floor(Math.random() * 5)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 3000);
}

function disableAllAnswers(label = "Loading...") {
  answerButtons.forEach((btn) => {
    btn.disabled = true;
    btn.hidden = false;
    btn.textContent = label;
    btn.classList.remove("correct", "wrong", "faded");
  });
}

function getCurrentPowerupSet() {
  return currentTurn === "player1" ? player1Powerups : player2Powerups;
}

function getCurrentPlayerName() {
  return currentTurn === "player1" ? config.player1.username : config.player2.username;
}

function updateBossUI() {
  if (config.mode === "boss") {
    bossBanner.classList.remove("hidden");
    bossHpRow.classList.remove("hidden");
    p2StreakRow.classList.add("hidden");
    bossBanner.textContent = `👹 Boss Battle: ${config.bossProfile.name}`;
    bossHpText.textContent = bossHp;
  } else {
    bossBanner.classList.add("hidden");
    bossHpRow.classList.add("hidden");
    p2StreakRow.classList.remove("hidden");
  }
}

function updatePowerupUI() {
  const powerups = getCurrentPowerupSet();

  powerup5050Count.textContent = powerups.fiftyFifty;
  powerupSkipCount.textContent = powerups.skip;
  powerupTimeCount.textContent = powerups.extraTime;
  powerupDoubleCount.textContent = powerups.doublePoints;

  powerup5050Btn.disabled = turnLocked || !questionReady || powerups.fiftyFifty <= 0;
  powerupSkipBtn.disabled = turnLocked || !questionReady || powerups.skip <= 0;
  powerupTimeBtn.disabled = turnLocked || !questionReady || powerups.extraTime <= 0;
  powerupDoubleBtn.disabled = turnLocked || !questionReady || powerups.doublePoints <= 0 || powerups.doublePointsActive;

  if (powerups.doublePointsActive) powerupDoubleBtn.classList.add("active");
  else powerupDoubleBtn.classList.remove("active");

  if ((config.mode === "pc" && currentTurn === "player2") || (config.mode === "boss" && currentTurn === "player2")) {
    powerup5050Btn.disabled = true;
    powerupSkipBtn.disabled = true;
    powerupTimeBtn.disabled = true;
    powerupDoubleBtn.disabled = true;
  }
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
  roundTotal.textContent = totalRounds;
  turnIndicator.textContent = `Turn: ${currentTurn === "player1" ? config.player1.username : config.player2.username}`;
  updatePowerupUI();
  updateBossUI();
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
  removedIndexes = [];
  questionReady = false;
  correctIndex = -1;
  disableAllAnswers("Loading...");
}

function setOptions(options, correctValue) {
  const shuffled = state.shuffle(options);
  correctIndex = shuffled.indexOf(correctValue);

  answerButtons.forEach((btn, idx) => {
    btn.textContent = String(shuffled[idx]);
    btn.disabled = false;
    btn.hidden = false;
    btn.classList.remove("correct", "wrong", "faded");
  });

  questionReady = true;
  turnLocked = false;
  updatePowerupUI();
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

  if (streak > 0 && streak % 5 === 0) bonus = 10;
  else if (streak > 0 && streak % 3 === 0) bonus = 5;

  if (bonus > 0) {
    if (playerKey === "player1") player1Score += bonus;
    else player2Score += bonus;

    showStreakBanner(`🔥 ${username} earned a +${bonus} streak bonus!`);
  }
}

async function generateMathQuestion() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let correct = 0;
  if (op === "+") correct = a + b;
  if (op === "-") correct = a - b;
  if (op === "*") correct = a * b;

  questionText.textContent = `Question: ${a} ${op === "*" ? "×" : op} ${b}`;

  const set = new Set([correct]);
  while (set.size < 4) {
    set.add(correct + (Math.floor(Math.random() * 9) - 4));
  }

  setOptions(Array.from(set), correct);
}

async function generateBananaQuestion() {
  const response = await fetch("https://marcconrad.com/uob/banana/api.php", { cache: "no-store" });
  const data = await response.json();
  const solution = Number(data.solution);

  if (!data.question || Number.isNaN(solution)) {
    throw new Error("Invalid banana question");
  }

  questionText.innerHTML = `
    <div>
      <p>Solve the Banana Puzzle</p>
      <img src="${data.question}" alt="Banana puzzle">
    </div>
  `;

  const set = new Set([solution]);
  while (set.size < 4) {
    set.add(solution + (Math.floor(Math.random() * 9) - 4));
  }

  setOptions(Array.from(set), solution);
}

async function generateGeneralQuestion() {
  const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple", { cache: "no-store" });
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
  const response = await fetch("https://opentdb.com/api.php?amount=1&category=18&type=multiple", { cache: "no-store" });
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
  updateHeader();

  try {
    const category = config.category || "math";

    if (category === "math") await generateMathQuestion();
    else if (category === "banana") await generateBananaQuestion();
    else if (category === "general") await generateGeneralQuestion();
    else if (category === "programming") await generateProgrammingQuestion();
    else await generateMathQuestion();

    startTimer();
  } catch (err) {
    console.error("Question generation failed:", err);
    showMessage("Question API failed. Falling back to maths.", "error");
    await generateMathQuestion();
    startTimer();
  }
}

function getBotProfile() {
  if (config.mode === "boss") {
    if (config.bossProfile.id === "ironTitan") return { accuracy: 0.7, minDelay: 2200, maxDelay: 3500 };
    if (config.bossProfile.id === "shadowBrain") return { accuracy: 0.85, minDelay: 1200, maxDelay: 2200 };
    return { accuracy: 0.78, minDelay: 1500, maxDelay: 2800 };
  }

  const personality = config.botPersonality || "slowThinker";
  const difficulty = config.botDifficulty || "easy";

  let base = { accuracy: 0.45, minDelay: 2800, maxDelay: 5200 };

  if (difficulty === "medium") {
    base = { accuracy: 0.68, minDelay: 1800, maxDelay: 3600 };
  } else if (difficulty === "hard") {
    base = { accuracy: 0.85, minDelay: 1200, maxDelay: 2500 };
  }

  if (personality === "slowThinker") {
    return {
      accuracy: Math.min(base.accuracy + 0.05, 0.95),
      minDelay: base.minDelay + 1200,
      maxDelay: base.maxDelay + 1800
    };
  }

  if (personality === "speedDemon") {
    return {
      accuracy: Math.max(base.accuracy - 0.12, 0.2),
      minDelay: Math.max(base.minDelay - 900, 500),
      maxDelay: Math.max(base.maxDelay - 1200, 1200)
    };
  }

  if (personality === "trollBot") {
    const trollAccuracy = Math.random() > 0.5 ? Math.min(base.accuracy + 0.12, 0.95) : Math.max(base.accuracy - 0.28, 0.15);
    return {
      accuracy: trollAccuracy,
      minDelay: Math.max(base.minDelay - 400, 700),
      maxDelay: base.maxDelay + 300
    };
  }

  return {
    accuracy: Math.min(base.accuracy + 0.08, 0.98),
    minDelay: Math.max(base.minDelay - 500, 700),
    maxDelay: Math.max(base.maxDelay - 700, 1400)
  };
}

function updateSpecialLabel() {
  if (config.mode === "pc" && config.player2.isBot) {
    const labels = {
      slowThinker: "🐢 Bot Personality: Slow Thinker",
      speedDemon: "⚡ Bot Personality: Speed Demon",
      trollBot: "😈 Bot Personality: Troll Bot",
      geniusBot: "🧠 Bot Personality: Genius Bot"
    };

    botPersonalityText.classList.remove("hidden");
    botPersonalityText.textContent = labels[config.botPersonality || "slowThinker"];
  } else if (config.mode === "boss") {
    botPersonalityText.classList.remove("hidden");
    botPersonalityText.textContent = `👹 Boss Profile: ${config.bossProfile.name}`;
  } else {
    botPersonalityText.classList.add("hidden");
  }
}

function getBotChoiceIndex() {
  const profile = getBotProfile();
  const shouldBeCorrect = Math.random() < profile.accuracy;

  if (shouldBeCorrect) return correctIndex;

  const availableIndexes = [0, 1, 2, 3].filter((index) => !removedIndexes.includes(index));
  const wrongIndexes = availableIndexes.filter((index) => index !== correctIndex);

  return wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
}

function maybeUseEnemyPowerup() {
  const powerups = player2Powerups;
  const roll = Math.random();

  if (powerups.doublePoints > 0 && !powerups.doublePointsActive && roll < 0.12) {
    powerups.doublePoints -= 1;
    powerups.doublePointsActive = true;
    showStreakBanner(`${config.player2.username} activated Double Points!`);
    return;
  }

  if (powerups.extraTime > 0 && timeLeft <= 4 && roll < 0.2) {
    powerups.extraTime -= 1;
    timeLeft += 5;
    timerText.textContent = `Time Left: ${timeLeft}s`;
    showStreakBanner(`${config.player2.username} used +5 Time!`);
    return;
  }

  if (powerups.fiftyFifty > 0 && roll < 0.15) {
    powerups.fiftyFifty -= 1;

    const wrongIndexes = [0, 1, 2, 3].filter((index) => index !== correctIndex && !removedIndexes.includes(index));
    const toRemove = state.shuffle(wrongIndexes).slice(0, 2);

    toRemove.forEach((idx) => {
      answerButtons[idx].disabled = true;
      answerButtons[idx].classList.add("faded");
      removedIndexes.push(idx);
    });

    showStreakBanner(`${config.player2.username} used 50/50!`);
  }
}

function triggerEnemyTurn() {
  if (!((config.mode === "pc" && currentTurn === "player2") || (config.mode === "boss" && currentTurn === "player2"))) {
    return;
  }

  if (!questionReady) return;

  maybeUseEnemyPowerup();
  updatePowerupUI();

  const profile = getBotProfile();
  const delay = profile.minDelay + Math.floor(Math.random() * (profile.maxDelay - profile.minDelay + 1));

  botThinkingTimeout = setTimeout(() => {
    if (!questionReady || turnLocked) return;
    const pick = getBotChoiceIndex();
    handleAnswerClick(pick);
  }, delay);
}

function getResultBadge(winner) {
  if (winner === "draw") return "🤝";
  if (winner === config.player1.username) return config.mode === "boss" ? "👑" : "🏆";
  return config.mode === "boss" ? "💀" : "💥";
}

function renderProgressCard(title, progress) {
  return `
    <div class="progress-card">
      <h3>${title}</h3>
      <p><strong>XP:</strong> +${progress.xpGain} (${progress.oldXp} → ${progress.newXp})</p>
      <p><strong>Level:</strong> ${progress.oldLevel} → ${progress.newLevel}${progress.leveledUp ? " 🎉" : ""}</p>
      <p><strong>Rank Title:</strong> ${progress.oldRankTitle} → ${progress.newRankTitle}${progress.rankChanged ? " ✨" : ""}</p>
      <p><strong>Tier:</strong> ${progress.oldTier} → ${progress.newTier}${progress.tierChanged ? " 🏅" : ""}</p>
      <div class="xp-bar-card">
        <div class="xp-bar-header">
          <span>XP Progress</span>
          <span>${progress.xpIntoLevel}/${progress.xpNeededForNextLevel}</span>
        </div>
        <div class="xp-bar-track">
          <div class="xp-bar-fill" style="width:0%;" data-target-width="${progress.xpPercent.toFixed(2)}%"></div>
        </div>
      </div>
    </div>
  `;
}

function renderAchievements(items) {
  if (!items || items.length === 0) {
    return `<div class="mini-info-card">No new achievements unlocked this match.</div>`;
  }

  return items.map((item) => `
    <div class="mini-achievement-card">
      <div class="mini-achievement-icon">🏆</div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.description}</p>
      </div>
    </div>
  `).join("");
}

function renderDailyStatus(title, items) {
  return `
    <div class="daily-player-card">
      <h4>${title}</h4>
      ${items.map((item) => `
        <div class="daily-result-item ${item.completed ? "daily-ok" : "daily-pending"}">
          <span>${item.completed ? "✅" : "🎯"}</span>
          <div>
            <strong>${item.title}</strong>
            <p>${item.description}</p>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderRewards(title, rewards, coinReward, extraText = "") {
  return `
    <div class="reward-player-card">
      <h4>${title}</h4>
      <div class="reward-chip">🪙 ${coinReward} Coins</div>
      ${extraText ? `<div class="reward-chip">✨ ${extraText}</div>` : ""}
      ${
        rewards && rewards.length
          ? rewards.map((reward) => `<div class="reward-chip">🎁 ${reward}</div>`).join("")
          : `<div class="mini-info-card">No extra powerup rewards earned.</div>`
      }
    </div>
  `;
}

function animateXpBars() {
  const fills = document.querySelectorAll(".xp-bar-fill");
  fills.forEach((fill, index) => {
    const target = fill.dataset.targetWidth || "0%";
    setTimeout(() => {
      fill.style.width = target;
    }, 250 + index * 180);
  });
}

function spendPersistentPowerupInventory() {
  const users = state.getUsers();
  const player = users.find((u) => u.username === config.player1.username);
  if (!player || !freshPlayer1) return;

  player.powerupInventory.fiftyFifty = Math.max(
    0,
    player.powerupInventory.fiftyFifty - (freshPlayer1.powerupInventory.fiftyFifty - player1Powerups.fiftyFifty)
  );
  player.powerupInventory.skip = Math.max(
    0,
    player.powerupInventory.skip - (freshPlayer1.powerupInventory.skip - player1Powerups.skip)
  );
  player.powerupInventory.extraTime = Math.max(
    0,
    player.powerupInventory.extraTime - (freshPlayer1.powerupInventory.extraTime - player1Powerups.extraTime)
  );
  player.powerupInventory.doublePoints = Math.max(
    0,
    player.powerupInventory.doublePoints - (freshPlayer1.powerupInventory.doublePoints - player1Powerups.doublePoints)
  );

  state.saveUsers(users);
  state.setCurrentUser(player);
}

function finishMatch() {
  stopTimer();
  stopBotThinking();
  spendPersistentPowerupInventory();

  let winner = "draw";
  let resultText = "🤝 The battle ended in a draw!";

  if (config.mode === "boss") {
    if (bossHp <= 0) {
      winner = config.player1.username;
      resultText = `👑 ${config.player1.username} defeated ${config.bossProfile.name}!`;
    } else {
      winner = config.player2.username;
      resultText = `💀 ${config.bossProfile.name} has won the battle!`;
    }
  } else {
    if (player1Score > player2Score) {
      winner = config.player1.username;
      resultText = `🏆 ${config.player1.username} wins the battle!`;
    } else if (player2Score > player1Score) {
      winner = config.player2.username;
      resultText = `🏆 ${config.player2.username} wins the battle!`;
    }
  }

  resultBadge.textContent = getResultBadge(winner);
  winnerText.textContent = resultText;
  finalScoreText.textContent = `Final Score: ${config.player1.username} ${player1Score} - ${player2Score} ${config.player2.username}`;

  progressSummary.innerHTML = "";
  unlockedAchievements.innerHTML = "";
  dailyChallengeStatus.innerHTML = "";
  powerupRewardsBox.innerHTML = "";

  if (config.mode === "boss") {
    const won = winner === config.player1.username;
    const bossResult = state.saveBossBattleStats(
      config.player1.username,
      config.bossProfile,
      player1Score,
      player2Score,
      won,
      config.category || "math",
      player1CorrectAnswers
    );

    if (bossResult) {
      progressSummary.innerHTML = `
        <div class="progress-grid">
          ${renderProgressCard(config.player1.username, bossResult.progress)}
        </div>
      `;

      unlockedAchievements.innerHTML = renderAchievements(bossResult.achievements);

      dailyChallengeStatus.innerHTML = `
        <div class="daily-result-grid">
          ${renderDailyStatus(config.player1.username, bossResult.daily)}
        </div>
      `;

      powerupRewardsBox.innerHTML = `
        <div class="daily-result-grid">
          ${renderRewards(
            config.player1.username,
            bossResult.rewards,
            bossResult.coinReward,
            won ? `${bossResult.bossBonusXp} Boss XP Bonus` : `${bossResult.bossBonusXp} Consolation Boss XP`
          )}
        </div>
      `;

      bossResult.achievements.forEach((item) => showAchievementPopup(item.title, item.description));
    }

    resultMetaText.textContent = `Category: ${config.category || "math"} | Mode: boss | Boss: ${config.bossProfile.name}`;
  } else {
    resultMetaText.textContent = `Category: ${config.category || "math"} | Mode: ${config.mode} | Timer: ${turnTimeLimit}s`;
  }

  resultCard.classList.remove("hidden");
  animateXpBars();
  launchConfetti();

  if (window.DamonAudio) {
    window.DamonAudio.playVictory();
  }
}

async function nextTurn() {
  resetAnswers();
  stopBotThinking();

  if (config.mode === "boss") {
    if (bossHp <= 0) {
      finishMatch();
      return;
    }

    if (currentTurn === "player1") {
      currentTurn = "player2";
      updateHeader();
      await generateQuestion();
      triggerEnemyTurn();
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
    return;
  }

  if (currentTurn === "player1") {
    currentTurn = "player2";
    updateHeader();
    await generateQuestion();

    if (config.mode === "pc") {
      triggerEnemyTurn();
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
  if (currentTurn === "player1") player1Streak = 0;
  else player2Streak = 0;
}

function handleTimeUp() {
  if (turnLocked || !questionReady) return;

  turnLocked = true;
  questionReady = false;
  stopBotThinking();
  resetCurrentPlayerStreak();

  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });

  if (correctIndex >= 0 && answerButtons[correctIndex]) {
    answerButtons[correctIndex].classList.add("correct");
  }

  showMessage("Time is up! Turn skipped.", "error");

  if (window.DamonAudio) {
    window.DamonAudio.playTimeout();
  }

  updateHeader();
  setTimeout(() => nextTurn(), 1200);
}

function handleAnswerClick(index) {
  if (turnLocked || !questionReady || correctIndex < 0) return;

  if (answerButtons[index].hidden || (answerButtons[index].disabled && !answerButtons[index].classList.contains("correct"))) {
    return;
  }

  turnLocked = true;
  questionReady = false;
  stopTimer();
  stopBotThinking();

  const correctBtn = answerButtons[correctIndex];
  correctBtn.classList.add("correct");

  if (index === correctIndex) {
    const powerups = getCurrentPowerupSet();
    const awardedPoints = powerups.doublePointsActive ? 20 : 10;

    if (currentTurn === "player1") {
      player1Score += awardedPoints;
      player1Streak += 1;
      player1CorrectAnswers += 1;
      applyStreakBonus("player1");
      player2Streak = 0;
      player1Powerups.doublePointsActive = false;

      if (config.mode === "boss") {
        const damage = awardedPoints === 20 ? 20 : 10;
        bossHp = Math.max(0, bossHp - damage);
        showStreakBanner(`⚔️ ${config.player1.username} dealt ${damage} damage to ${config.bossProfile.name}!`);
      }
    } else {
      player2Score += awardedPoints;
      player2Streak += 1;
      player2CorrectAnswers += 1;
      applyStreakBonus("player2");
      player1Streak = 0;
      player2Powerups.doublePointsActive = false;
    }

    showMessage(`Correct answer! +${awardedPoints} points`, "success");

    if (window.DamonAudio) {
      window.DamonAudio.playCorrect();
    }
  } else {
    answerButtons[index].classList.add("wrong");
    resetCurrentPlayerStreak();

    if (currentTurn === "player1") player1Powerups.doublePointsActive = false;
    else player2Powerups.doublePointsActive = false;

    showMessage("Wrong answer!", "error");

    if (window.DamonAudio) {
      window.DamonAudio.playWrong();
    }
  }

  updateHeader();
  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });

  if (config.mode === "boss" && bossHp <= 0) {
    setTimeout(() => finishMatch(), 1200);
    return;
  }

  setTimeout(() => nextTurn(), 1200);
}

powerup5050Btn.onclick = () => {
  if (turnLocked || !questionReady) return;

  const powerups = getCurrentPowerupSet();
  if (powerups.fiftyFifty <= 0) return;

  const wrongIndexes = [0, 1, 2, 3].filter((index) => index !== correctIndex && !removedIndexes.includes(index));
  const toRemove = state.shuffle(wrongIndexes).slice(0, 2);

  toRemove.forEach((idx) => {
    answerButtons[idx].disabled = true;
    answerButtons[idx].classList.add("faded");
    removedIndexes.push(idx);
  });

  powerups.fiftyFifty -= 1;
  updatePowerupUI();
  showMessage(`${getCurrentPlayerName()} used 50/50.`, "success");
};

powerupSkipBtn.onclick = () => {
  if (turnLocked || !questionReady) return;

  const powerups = getCurrentPowerupSet();
  if (powerups.skip <= 0) return;

  powerups.skip -= 1;
  resetCurrentPlayerStreak();
  updatePowerupUI();
  showMessage(`${getCurrentPlayerName()} skipped the question.`, "success");

  stopTimer();
  turnLocked = true;
  questionReady = false;
  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });

  setTimeout(() => nextTurn(), 900);
};

powerupTimeBtn.onclick = () => {
  if (turnLocked || !questionReady) return;

  const powerups = getCurrentPowerupSet();
  if (powerups.extraTime <= 0) return;

  powerups.extraTime -= 1;
  timeLeft += 5;
  timerText.textContent = `Time Left: ${timeLeft}s`;
  updatePowerupUI();
  showMessage(`${getCurrentPlayerName()} added +5 seconds.`, "success");
};

powerupDoubleBtn.onclick = () => {
  if (turnLocked || !questionReady) return;

  const powerups = getCurrentPowerupSet();
  if (powerups.doublePoints <= 0 || powerups.doublePointsActive) return;

  powerups.doublePoints -= 1;
  powerups.doublePointsActive = true;
  updatePowerupUI();
  showMessage(`${getCurrentPlayerName()} activated Double Points!`, "success");
};

answerButtons.forEach((btn, idx) => {
  btn.onclick = () => handleAnswerClick(idx);
});

document.getElementById("sameCategoryRematchBtn").onclick = () => {
  if (config.mode === "boss") {
    window.location.href = "boss.html";
    return;
  }
  window.location.href = "game.html";
};

document.getElementById("newCategoryBtn").onclick = () => {
  if (config.mode === "boss") {
    window.location.href = "boss.html";
    return;
  }
  window.location.href = "category.html";
};

document.getElementById("historyBtn").onclick = () => {
  window.location.href = "leaderboard.html";
};

async function initGame() {
  resultCard.classList.add("hidden");
  disableAllAnswers("Loading...");
  updateSpecialLabel();
  updateHeader();
  await generateQuestion();
}

initGame().catch((error) => {
  console.error("Game init failed:", error);
  showMessage("Game failed to initialize. Returning to home.", "error");
  setTimeout(() => {
    window.location.href = "home.html";
  }, 1500);
});