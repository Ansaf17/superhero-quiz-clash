console.log("JS loaded");

window.onload = function () {
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const openBattleLobbyBtn = document.getElementById("openBattleLobbyBtn");
  const confirmPlayer2Btn = document.getElementById("confirmPlayer2Btn");
  const startBattleBtn = document.getElementById("startBattleBtn");
  const backToLobbyBtn = document.getElementById("backToLobbyBtn");

  const registerUsername = document.getElementById("registerUsername");
  const registerPassword = document.getElementById("registerPassword");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");

  const player2Username = document.getElementById("player2Username");
  const player2Password = document.getElementById("player2Password");

  const avatarOptions = document.querySelectorAll(".avatar-option");
  const answerButtons = document.querySelectorAll(".answer-btn");
  const messageBox = document.getElementById("messageBox");

  const profileCard = document.getElementById("profileCard");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileUsername = document.getElementById("profileUsername");
  const profilePoints = document.getElementById("profilePoints");
  const profileWins = document.getElementById("profileWins");
  const profileMatches = document.getElementById("profileMatches");

  const battleLobbyCard = document.getElementById("battleLobbyCard");
  const battlePlayer1Avatar = document.getElementById("battlePlayer1Avatar");
  const battlePlayer1Name = document.getElementById("battlePlayer1Name");
  const battlePlayer2Avatar = document.getElementById("battlePlayer2Avatar");
  const battlePlayer2Name = document.getElementById("battlePlayer2Name");

  const matchArena = document.getElementById("matchArena");
  const arenaPlayer1Name = document.getElementById("arenaPlayer1Name");
  const arenaPlayer2Name = document.getElementById("arenaPlayer2Name");
  const arenaPlayer1Avatar = document.getElementById("arenaPlayer1Avatar");
  const arenaPlayer2Avatar = document.getElementById("arenaPlayer2Avatar");
  const arenaScore1 = document.getElementById("arenaScore1");
  const arenaScore2 = document.getElementById("arenaScore2");
  const turnIndicator = document.getElementById("turnIndicator");
  const timerText = document.getElementById("timerText");
  const questionText = document.getElementById("questionText");
  const roundNumber = document.getElementById("roundNumber");

  const resultCard = document.getElementById("resultCard");
  const winnerText = document.getElementById("winnerText");
  const finalScoreText = document.getElementById("finalScoreText");

  const categorySelect = document.getElementById("categorySelect");

  let selectedAvatar = "";
  let selectedPlayer2 = null;
  let selectedCategory = "math";

  let player1Score = 0;
  let player2Score = 0;
  let currentTurn = "player1";
  let currentRound = 1;
  const totalRounds = 5;

  let correctIndex = 0;
  let turnLocked = false;

  let timerInterval = null;
  const turnTimeLimit = 10;
  let timeLeft = turnTimeLimit;

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
  }

  function getUsers() {
    const raw = localStorage.getItem("users");
    return raw ? JSON.parse(raw) : [];
  }

  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  }

  function getMatches() {
    const raw = localStorage.getItem("matches");
    return raw ? JSON.parse(raw) : [];
  }

  function saveMatches(matches) {
    localStorage.setItem("matches", JSON.stringify(matches));
  }

  function getH2H() {
    const raw = localStorage.getItem("h2h");
    return raw ? JSON.parse(raw) : {};
  }

  function saveH2H(h2h) {
    localStorage.setItem("h2h", JSON.stringify(h2h));
  }

  function decodeHtml(text) {
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html").body.textContent;
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function resetAnswerButtons() {
    answerButtons.forEach((btn) => {
      btn.classList.remove("correct", "wrong");
      btn.disabled = false;
    });
  }

  function setAnswerOptions(options, correctValue) {
    const shuffled = shuffleArray(options);
    correctIndex = shuffled.indexOf(correctValue);

    answerButtons.forEach((btn, index) => {
      btn.textContent = shuffled[index];
      btn.disabled = false;
      btn.classList.remove("correct", "wrong");
    });
  }

  function showProfile(user) {
    profileAvatar.textContent = user.avatar;
    profileUsername.textContent = user.username;
    profilePoints.textContent = user.totalPoints;
    profileWins.textContent = user.totalWins;
    profileMatches.textContent = user.matchesPlayed;
    profileCard.classList.remove("hidden");
  }

  function hideProfile() {
    profileCard.classList.add("hidden");
  }

  function resetBattleLobby() {
    selectedPlayer2 = null;
    player2Username.value = "";
    player2Password.value = "";
    battlePlayer2Avatar.textContent = "❔";
    battlePlayer2Name.textContent = "-";
  }

  function showBattleLobby() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showMessage("Please log in first.", "error");
      return;
    }

    battlePlayer1Avatar.textContent = currentUser.avatar;
    battlePlayer1Name.textContent = currentUser.username;

    resetBattleLobby();
    battleLobbyCard.classList.remove("hidden");
  }

  function updateTurnUI() {
    const currentUser = getCurrentUser();
    if (!currentUser || !selectedPlayer2) return;

    if (currentTurn === "player1") {
      turnIndicator.textContent = `Turn: ${currentUser.username}`;
    } else {
      turnIndicator.textContent = `Turn: ${selectedPlayer2.username}`;
    }

    arenaScore1.textContent = player1Score;
    arenaScore2.textContent = player2Score;
    roundNumber.textContent = currentRound;
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
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

  function handleTimeUp() {
    if (turnLocked) return;
    turnLocked = true;

    answerButtons.forEach((btn) => {
      btn.disabled = true;
    });

    answerButtons[correctIndex].classList.add("correct");
    showMessage("Time is up! Turn skipped.", "error");

    setTimeout(() => {
      nextTurn();
    }, 1200);
  }

  async function generateQuestion() {
    resetAnswerButtons();

    try {
      if (selectedCategory === "math") {
        generateMathQuestion();
        startTimer();
        return;
      }

      if (selectedCategory === "banana") {
        await generateBananaQuestion();
        startTimer();
        return;
      }

      if (selectedCategory === "general") {
        await generateGeneralQuestion();
        startTimer();
        return;
      }

      if (selectedCategory === "programming") {
        await generateProgrammingQuestion();
        startTimer();
        return;
      }

      generateMathQuestion();
      startTimer();
    } catch (error) {
      console.error("Question generation failed:", error);
      showMessage("Question API failed. Falling back to math question.", "error");
      generateMathQuestion();
      startTimer();
    }
  }

  function generateMathQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let question = "";
    let answer = 0;

    if (operator === "+") {
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else if (operator === "-") {
      question = `${num1} - ${num2}`;
      answer = num1 - num2;
    } else {
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
    }

    questionText.textContent = `Question: ${question}`;

    const optionSet = new Set([answer]);
    while (optionSet.size < 4) {
      const offset = Math.floor(Math.random() * 6) - 3;
      optionSet.add(answer + offset);
    }

    setAnswerOptions(Array.from(optionSet), answer);
  }

  async function generateBananaQuestion() {
    const response = await fetch("https://marcconrad.com/uob/banana/api.php");
    const data = await response.json();

    const solution = Number(data.solution);

    questionText.innerHTML = `
      <div>
        <p>Solve the Banana Puzzle</p>
        <img src="${data.question}" alt="Banana Question" style="max-width:220px; border-radius:12px;">
      </div>
    `;

    const optionSet = new Set([solution]);
    while (optionSet.size < 4) {
      const offset = Math.floor(Math.random() * 6) - 3;
      optionSet.add(solution + offset);
    }

    setAnswerOptions(Array.from(optionSet), solution);
  }

  async function generateGeneralQuestion() {
    const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = await response.json();

    if (!data.results || !data.results.length) {
      throw new Error("No general question returned");
    }

    const q = data.results[0];
    const question = decodeHtml(q.question);
    const correct = decodeHtml(q.correct_answer);
    const incorrect = q.incorrect_answers.map((ans) => decodeHtml(ans));

    questionText.textContent = `Question: ${question}`;
    setAnswerOptions([correct, ...incorrect], correct);
  }

  async function generateProgrammingQuestion() {
    const response = await fetch("https://opentdb.com/api.php?amount=1&category=18&type=multiple");
    const data = await response.json();

    if (!data.results || !data.results.length) {
      throw new Error("No programming question returned");
    }

    const q = data.results[0];
    const question = decodeHtml(q.question);
    const correct = decodeHtml(q.correct_answer);
    const incorrect = q.incorrect_answers.map((ans) => decodeHtml(ans));

    questionText.textContent = `Question: ${question}`;
    setAnswerOptions([correct, ...incorrect], correct);
  }

  function startMatch() {
    const currentUser = getCurrentUser();

    player1Score = 0;
    player2Score = 0;
    currentTurn = "player1";
    currentRound = 1;
    turnLocked = false;

    arenaPlayer1Name.textContent = currentUser.username;
    arenaPlayer2Name.textContent = selectedPlayer2.username;
    arenaPlayer1Avatar.textContent = currentUser.avatar;
    arenaPlayer2Avatar.textContent = selectedPlayer2.avatar;

    resultCard.classList.add("hidden");
    matchArena.classList.remove("hidden");

    updateTurnUI();
    generateQuestion();
  }

  function updateUserStats(winnerUsername, finalPlayer1Score, finalPlayer2Score) {
    const currentUser = getCurrentUser();
    const users = getUsers();

    const player1 = users.find((u) => u.username === currentUser.username);
    const player2 = users.find((u) => u.username === selectedPlayer2.username);

    if (!player1 || !player2) return;

    player1.totalPoints += finalPlayer1Score;
    player2.totalPoints += finalPlayer2Score;

    player1.matchesPlayed += 1;
    player2.matchesPlayed += 1;

    if (winnerUsername === player1.username) {
      player1.totalWins += 1;
      player2.totalLosses += 1;
    } else if (winnerUsername === player2.username) {
      player2.totalWins += 1;
      player1.totalLosses += 1;
    }

    saveUsers(users);

    const updatedCurrentUser = users.find((u) => u.username === currentUser.username);
    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
    showProfile(updatedCurrentUser);
  }

  function saveMatchRecord(winnerUsername, finalPlayer1Score, finalPlayer2Score) {
    const currentUser = getCurrentUser();
    const matches = getMatches();

    matches.push({
      player1: currentUser.username,
      player2: selectedPlayer2.username,
      player1Score: finalPlayer1Score,
      player2Score: finalPlayer2Score,
      winner: winnerUsername,
      category: selectedCategory,
      date: new Date().toLocaleString()
    });

    saveMatches(matches);
  }

  function saveHeadToHead(winnerUsername, finalPlayer1Score, finalPlayer2Score) {
    const currentUser = getCurrentUser();
    const h2h = getH2H();

    const names = [currentUser.username, selectedPlayer2.username].sort();
    const key = `${names[0]}__${names[1]}`;

    if (!h2h[key]) {
      h2h[key] = {
        matches: 0,
        [currentUser.username]: 0,
        [selectedPlayer2.username]: 0,
        [`${currentUser.username}Points`]: 0,
        [`${selectedPlayer2.username}Points`]: 0
      };
    }

    h2h[key].matches += 1;
    h2h[key][`${currentUser.username}Points`] += finalPlayer1Score;
    h2h[key][`${selectedPlayer2.username}Points`] += finalPlayer2Score;

    if (winnerUsername === currentUser.username) {
      h2h[key][currentUser.username] += 1;
    } else if (winnerUsername === selectedPlayer2.username) {
      h2h[key][selectedPlayer2.username] += 1;
    }

    saveH2H(h2h);
  }

  function finishMatch() {
    stopTimer();

    const currentUser = getCurrentUser();

    const finalPlayer1Score = player1Score;
    const finalPlayer2Score = player2Score;

    let winnerUsername = "draw";
    let winnerMessage = "🤝 The battle ended in a draw!";

    if (finalPlayer1Score > finalPlayer2Score) {
      winnerUsername = currentUser.username;
      winnerMessage = `🏆 ${currentUser.username} wins the battle!`;
    } else if (finalPlayer2Score > finalPlayer1Score) {
      winnerUsername = selectedPlayer2.username;
      winnerMessage = `🏆 ${selectedPlayer2.username} wins the battle!`;
    }

    winnerText.textContent = winnerMessage;
    finalScoreText.textContent = `Final Score: ${currentUser.username} ${finalPlayer1Score} - ${finalPlayer2Score} ${selectedPlayer2.username}`;

    updateUserStats(winnerUsername, finalPlayer1Score, finalPlayer2Score);
    saveMatchRecord(winnerUsername, finalPlayer1Score, finalPlayer2Score);
    saveHeadToHead(winnerUsername, finalPlayer1Score, finalPlayer2Score);

    matchArena.classList.add("hidden");
    resultCard.classList.remove("hidden");

    showMessage("Match completed successfully.", "success");
  }

  async function nextTurn() {
    resetAnswerButtons();
    turnLocked = false;

    if (currentTurn === "player1") {
      currentTurn = "player2";
      updateTurnUI();
      await generateQuestion();
      return;
    }

    if (currentRound === totalRounds) {
      finishMatch();
      return;
    }

    currentTurn = "player1";
    currentRound += 1;

    updateTurnUI();
    await generateQuestion();
  }

  async function handleAnswerClick(index) {
    if (turnLocked) return;
    turnLocked = true;
    stopTimer();

    const correctBtn = answerButtons[correctIndex];
    correctBtn.classList.add("correct");

    if (index === correctIndex) {
      if (currentTurn === "player1") {
        player1Score += 10;
      } else {
        player2Score += 10;
      }
      showMessage("Correct answer!", "success");
    } else {
      answerButtons[index].classList.add("wrong");
      showMessage("Wrong answer!", "error");
    }

    updateTurnUI();

    answerButtons.forEach((btn) => {
      btn.disabled = true;
    });

    setTimeout(() => {
      nextTurn();
    }, 1200);
  }

  if (categorySelect) {
    categorySelect.onchange = function () {
      selectedCategory = categorySelect.value;
    };
  }

  avatarOptions.forEach(function (option) {
    option.onclick = function () {
      avatarOptions.forEach(function (item) {
        item.classList.remove("selected");
      });
      option.classList.add("selected");
      selectedAvatar = option.getAttribute("data-avatar");
    };
  });

  answerButtons.forEach((btn, index) => {
    btn.onclick = function () {
      handleAnswerClick(index);
    };
  });

  registerBtn.onclick = function () {
    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();

    if (username === "" || password === "" || selectedAvatar === "") {
      showMessage("Fill username, password, and choose an avatar.", "error");
      return;
    }

    const users = getUsers();

    const exists = users.find(function (user) {
      return user.username.toLowerCase() === username.toLowerCase();
    });

    if (exists) {
      showMessage("Username already exists.", "error");
      return;
    }

    const newUser = {
      username: username,
      password: password,
      avatar: selectedAvatar,
      totalPoints: 0,
      totalWins: 0,
      totalLosses: 0,
      matchesPlayed: 0
    };

    users.push(newUser);
    saveUsers(users);

    showMessage("Registered successfully. Now log in.", "success");

    registerUsername.value = "";
    registerPassword.value = "";
    selectedAvatar = "";
    avatarOptions.forEach(function (item) {
      item.classList.remove("selected");
    });
  };

  loginBtn.onclick = function () {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    const users = getUsers();

    const matchedUser = users.find(function (user) {
      return user.username === username && user.password === password;
    });

    if (!matchedUser) {
      showMessage("Invalid username or password.", "error");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(matchedUser));
    showProfile(matchedUser);
    showMessage("Login successful.", "success");
  };

  logoutBtn.onclick = function () {
    stopTimer();
    localStorage.removeItem("currentUser");
    hideProfile();
    battleLobbyCard.classList.add("hidden");
    matchArena.classList.add("hidden");
    resultCard.classList.add("hidden");
    showMessage("Logged out.", "success");
  };

  openBattleLobbyBtn.onclick = function () {
    showBattleLobby();
    showMessage("Battle lobby opened.", "success");
  };

  confirmPlayer2Btn.onclick = function () {
    const currentUser = getCurrentUser();
    const username = player2Username.value.trim();
    const password = player2Password.value.trim();

    if (!currentUser) {
      showMessage("Player 1 must log in first.", "error");
      return;
    }

    if (username === "" || password === "") {
      showMessage("Enter Player 2 username and password.", "error");
      return;
    }

    if (username === currentUser.username) {
      showMessage("Player 2 cannot be the same as Player 1.", "error");
      return;
    }

    const users = getUsers();

    const matchedUser = users.find(function (user) {
      return user.username === username && user.password === password;
    });

    if (!matchedUser) {
      showMessage("Player 2 login failed.", "error");
      return;
    }

    selectedPlayer2 = matchedUser;
    battlePlayer2Avatar.textContent = matchedUser.avatar;
    battlePlayer2Name.textContent = matchedUser.username;
    showMessage("Player 2 confirmed successfully.", "success");
  };

  startBattleBtn.onclick = function () {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showMessage("Player 1 must log in first.", "error");
      return;
    }

    if (!selectedPlayer2) {
      showMessage("Player 2 must log in first.", "error");
      return;
    }

    const battlePlayers = {
      player1: currentUser,
      player2: selectedPlayer2,
      category: selectedCategory
    };

    localStorage.setItem("battlePlayers", JSON.stringify(battlePlayers));
    showMessage(`Battle started: ${currentUser.username} vs ${selectedPlayer2.username} [${selectedCategory}]`, "success");

    startMatch();
  };

  backToLobbyBtn.onclick = function () {
    stopTimer();
    resultCard.classList.add("hidden");
    battleLobbyCard.classList.remove("hidden");
    showMessage("Returned to battle lobby.", "success");
  };

  const currentUser = getCurrentUser();
  if (currentUser) {
    showProfile(currentUser);
  }
};