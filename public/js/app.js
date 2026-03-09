console.log("JS loaded");

window.onload = function () {
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const registerUsername = document.getElementById("registerUsername");
  const registerPassword = document.getElementById("registerPassword");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");

  const avatarOptions = document.querySelectorAll(".avatar-option");
  const messageBox = document.getElementById("messageBox");

  const profileCard = document.getElementById("profileCard");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileUsername = document.getElementById("profileUsername");
  const profilePoints = document.getElementById("profilePoints");
  const profileWins = document.getElementById("profileWins");
  const profileMatches = document.getElementById("profileMatches");

  let selectedAvatar = "";

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

  function showProfile(user) {
    profileAvatar.textContent = user.avatar;
    profileUsername.textContent = user.username;
    profilePoints.textContent = user.totalPoints;
    profileWins.textContent = user.totalWins;
    profileMatches.textContent = user.matchesPlayed;
    profileCard.classList.remove("hidden");
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
    profileCard.classList.add("hidden");
    showMessage("Logged out.", "success");
  };

  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    showProfile(JSON.parse(currentUser));
  }
};