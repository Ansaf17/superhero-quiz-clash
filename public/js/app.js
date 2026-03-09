console.log("JS loaded");

window.onload = function () {
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const openBattleLobbyBtn = document.getElementById("openBattleLobbyBtn");
  const confirmPlayer2Btn = document.getElementById("confirmPlayer2Btn");
  const startBattleBtn = document.getElementById("startBattleBtn");

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

  let selectedAvatar = "";
  let selectedPlayer2 = null;

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
    showMessage(`Battle ready: ${currentUser.username} vs ${selectedPlayer2.username}`, "success");
  };

  const currentUser = getCurrentUser();
  if (currentUser) {
    showProfile(currentUser);
  }
};