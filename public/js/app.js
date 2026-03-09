console.log("JS loaded");

window.onload = function () {
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const openBattleLobbyBtn = document.getElementById("openBattleLobbyBtn");
  const confirmPlayer2Btn = document.getElementById("confirmPlayer2Btn");
  const startBattleBtn = document.getElementById("startBattleBtn");
  const submitAnswerBtn = document.getElementById("submitAnswerBtn");

  const registerUsername = document.getElementById("registerUsername");
  const registerPassword = document.getElementById("registerPassword");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");

  const player2Username = document.getElementById("player2Username");
  const player2Password = document.getElementById("player2Password");

  const avatarOptions = document.querySelectorAll(".avatar-option");
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
  const questionText = document.getElementById("questionText");
  const answerInput = document.getElementById("answerInput");
  const roundNumber = document.getElementById("roundNumber");

  let selectedAvatar = "";
  let selectedPlayer2 = null;

  let player1Score = 0;
  let player2Score = 0;
  let currentTurn = "player1";
  let currentRound = 1;
  const totalRounds = 3;
  let currentCorrectAnswer = 0;

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

  function generateQuestion() {
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

    currentCorrectAnswer = answer;
    questionText.textContent = `Question: ${question}`;
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

  function startMatch() {
    const currentUser = getCurrentUser();

    player1Score = 0;
    player2Score = 0;
    currentTurn = "player1";
    currentRound = 1;

    arenaPlayer1Name.textContent = currentUser.username;
    arenaPlayer2Name.textContent = selectedPlayer2.username;
    arenaPlayer1Avatar.textContent = currentUser.avatar;
    arenaPlayer2Avatar.textContent = selectedPlayer2.avatar;

    matchArena.classList.remove("hidden");
    updateTurnUI();
    generateQuestion();
  }

  function finishMatch() {
    const currentUser = getCurrentUser();

    if (player1Score > player2Score) {
      showMessage(`${currentUser.username} wins the battle!`, "success");
    } else if (player2Score > player1Score) {
      showMessage(`${selectedPlayer2.username} wins the battle!`, "success");
    } else {
      showMessage("The battle ended in a draw!", "success");
    }
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
    localStorage.removeItem("currentUser");
    hideProfile();
    battleLobbyCard.classList.add("hidden");
    matchArena.classList.add("hidden");
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
      player2: selectedPlayer2
    };

    localStorage.setItem("battlePlayers", JSON.stringify(battlePlayers));
    showMessage(`Battle started: ${currentUser.username} vs ${selectedPlayer2.username}`, "success");

    startMatch();
  };

  submitAnswerBtn.onclick = function () {
    const userAnswer = Number(answerInput.value.trim());

    if (answerInput.value.trim() === "") {
      showMessage("Please enter an answer.", "error");
      return;
    }

    if (userAnswer === currentCorrectAnswer) {
      if (currentTurn === "player1") {
        player1Score += 10;
      } else {
        player2Score += 10;
      }
      showMessage("Correct answer!", "success");
    } else {
      showMessage(`Wrong answer. Correct answer was ${currentCorrectAnswer}.`, "error");
    }

    answerInput.value = "";

    if (currentTurn === "player1") {
      currentTurn = "player2";
    } else {
      currentTurn = "player1";
      currentRound++;
    }

    if (currentRound > totalRounds) {
      updateTurnUI();
      finishMatch();
      return;
    }

    updateTurnUI();
    generateQuestion();
  };

  const currentUser = getCurrentUser();
  if (currentUser) {
    showProfile(currentUser);
  }
};