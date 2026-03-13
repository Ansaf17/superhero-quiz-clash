const state = window.DamonState;

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const registerBtn = document.getElementById("registerBtn");
const pcBtn = document.getElementById("pcBtn");
const pvpBtn = document.getElementById("pvpBtn");

const profileToggleBtn = document.getElementById("profileToggleBtn");
const profileDropdown = document.getElementById("profileDropdown");
const profileToggleAvatar = document.getElementById("profileToggleAvatar");

const loggedOutPanel = document.getElementById("loggedOutPanel");
const loggedInPanel = document.getElementById("loggedInPanel");

const showRegisterBtn = document.getElementById("showRegisterBtn");
const hideRegisterBtn = document.getElementById("hideRegisterBtn");
const registerArea = document.getElementById("registerArea");

const miniAvatar = document.getElementById("miniAvatar");
const miniUsername = document.getElementById("miniUsername");

const avatarOptions = document.querySelectorAll(".avatar-option");
const messageBox = document.getElementById("messageBox");

let selectedAvatar = "";
let dropdownOpen = false;

if (window.DamonAudio) {
  window.DamonAudio.playMenuMusic();
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function openDropdown() {
  profileDropdown.classList.remove("profile-dropdown-hidden");
  profileDropdown.classList.add("profile-dropdown-visible");
  dropdownOpen = true;
}

function closeDropdown() {
  profileDropdown.classList.remove("profile-dropdown-visible");
  profileDropdown.classList.add("profile-dropdown-hidden");
  dropdownOpen = false;
}

function toggleDropdown() {
  if (dropdownOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function refreshSessionUI() {
  const currentUser = state.getCurrentUser();

  if (currentUser) {
    loggedOutPanel.classList.add("hidden");
    loggedInPanel.classList.remove("hidden");
    miniAvatar.textContent = currentUser.avatar;
    miniUsername.textContent = currentUser.username;
    profileToggleAvatar.textContent = currentUser.avatar;
  } else {
    loggedOutPanel.classList.remove("hidden");
    loggedInPanel.classList.add("hidden");
    profileToggleAvatar.textContent = "👤";
  }
}

profileToggleBtn.onclick = (event) => {
  event.stopPropagation();
  toggleDropdown();
};

profileDropdown.onclick = (event) => {
  event.stopPropagation();
};

document.addEventListener("click", () => {
  closeDropdown();
});

showRegisterBtn.onclick = () => {
  registerArea.classList.remove("hidden");
};

hideRegisterBtn.onclick = () => {
  registerArea.classList.add("hidden");
};

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

  document.getElementById("registerUsername").value = "";
  document.getElementById("registerPassword").value = "";
  selectedAvatar = "";
  avatarOptions.forEach(i => i.classList.remove("selected"));
  registerArea.classList.add("hidden");

  showMessage("Registered successfully. You can now log in.", "success");
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
  closeDropdown();
  showMessage("Login successful.", "success");
};

logoutBtn.onclick = () => {
  state.clearCurrentUser();
  state.clearBattleConfig();
  state.clearPvpDraft();
  refreshSessionUI();
  closeDropdown();
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
closeDropdown();