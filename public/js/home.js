const state = window.DamonState;
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const pcBtn = document.getElementById("pcBtn");
const pvpBtn = document.getElementById("pvpBtn");
const avatarOptions = document.querySelectorAll(".avatar-option");
const messageBox = document.getElementById("messageBox");
const sessionText = document.getElementById("sessionText");

let selectedAvatar = "";

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function refreshSessionUI() {
  const currentUser = state.getCurrentUser();
  if (currentUser) {
    sessionText.textContent = `Logged in as ${currentUser.username} ${currentUser.avatar}`;
    logoutBtn.style.display = "inline-block";
  } else {
    sessionText.textContent = "Not logged in";
    logoutBtn.style.display = "none";
  }
}

avatarOptions.forEach(option => {
  option.onclick = () => {
    avatarOptions.forEach(i => i.classList.remove("selected"));
    option.classList.add("selected");
    selectedAvatar = option.dataset.avatar;
  };
});

registerBtn.onclick = () => {
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !password || !selectedAvatar) {
    showMessage("Fill all registration fields and choose an avatar.", "error");
    return;
  }

  const users = state.getUsers();
  const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (exists) {
    showMessage("Username already exists.", "error");
    return;
  }

  users.push({
    username,
    password,
    avatar: selectedAvatar,
    totalPoints: 0,
    totalWins: 0,
    totalLosses: 0,
    matchesPlayed: 0
  });

  state.saveUsers(users);
  showMessage("Registered successfully. You can now log in.", "success");

  document.getElementById("registerUsername").value = "";
  document.getElementById("registerPassword").value = "";
  selectedAvatar = "";
  avatarOptions.forEach(i => i.classList.remove("selected"));
};

loginBtn.onclick = () => {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const users = state.getUsers();

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    showMessage("Invalid username or password.", "error");
    return;
  }

  state.setCurrentUser(user);
  refreshSessionUI();
  showMessage("Login successful.", "success");
};

logoutBtn.onclick = () => {
  state.clearCurrentUser();
  state.clearBattleConfig();
  state.clearPvpDraft();
  refreshSessionUI();
  showMessage("Logged out successfully.", "success");
};

pcBtn.onclick = () => {
  const currentUser = state.getCurrentUser();

  if (!currentUser) {
    showMessage("Log in first to continue.", "error");
    return;
  }

  state.setBattleConfig({
    mode: "pc",
    player1: currentUser,
    player2: {
      username: "Damon Bot",
      avatar: "🤖",
      isBot: true
    }
  });

  window.location.href = "category.html";
};

pvpBtn.onclick = () => {
  const currentUser = state.getCurrentUser();

  if (!currentUser) {
    showMessage("Log in first to continue.", "error");
    return;
  }

  window.location.href = "lobby.html";
};

refreshSessionUI();