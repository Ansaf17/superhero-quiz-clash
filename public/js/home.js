const state = window.DamonState;

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const registerBtn = document.getElementById("registerBtn");
const pcBtn = document.getElementById("pcBtn");
const pvpBtn = document.getElementById("pvpBtn");
const bossBtn = document.getElementById("bossBtn");
const tournamentBtn = document.getElementById("tournamentBtn");
const claimDailyBtn = document.getElementById("claimDailyBtn");

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
const miniCoinsText = document.getElementById("miniCoinsText");
const dailyRewardBox = document.getElementById("dailyRewardBox");

const avatarOptions = document.querySelectorAll(".avatar-option");
const messageBox = document.getElementById("messageBox");

let selectedAvatar = "";
let dropdownOpen = false;

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
  if (dropdownOpen) closeDropdown();
  else openDropdown();
}

function refreshDailyRewardUI(user) {
  if (!user) {
    dailyRewardBox.innerHTML = "";
    return;
  }

  const today = state.getTodayString();
  const alreadyClaimed = user.loginRewards?.lastClaimDate === today;
  const streak = user.loginRewards?.streak || 0;

  dailyRewardBox.innerHTML = `
    <div class="daily-login-status">
      <strong>Daily Reward</strong>
      <p>Streak: ${streak} day${streak === 1 ? "" : "s"}</p>
      <p>${alreadyClaimed ? "Already claimed today" : "Ready to claim today"}</p>
    </div>
  `;

  claimDailyBtn.disabled = alreadyClaimed;
}

function refreshSessionUI() {
  const currentUser = state.getCurrentUser();

  if (currentUser) {
    loggedOutPanel.classList.add("hidden");
    loggedInPanel.classList.remove("hidden");
    miniAvatar.textContent = currentUser.avatar;
    miniUsername.textContent = `${currentUser.username} • ${currentUser.rankTitle}`;
    miniCoinsText.textContent = `${currentUser.coins} Coins`;
    profileToggleAvatar.textContent = currentUser.avatar;
    refreshDailyRewardUI(currentUser);
  } else {
    loggedOutPanel.classList.remove("hidden");
    loggedInPanel.classList.add("hidden");
    profileToggleAvatar.textContent = "👤";
    refreshDailyRewardUI(null);
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

avatarOptions.forEach((option) => {
  option.onclick = () => {
    avatarOptions.forEach((item) => item.classList.remove("selected"));
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
  const exists = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

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
    matchesPlayed: 0,
    xp: 0,
    level: 1,
    rankTitle: "Rookie",
    leaderboardTier: "Bronze",
    coins: 100,
    winStreak: 0,
    bestWinStreak: 0,
    achievements: [],
    ownedAvatars: ["🦸", selectedAvatar],
    powerupInventory: {
      fiftyFifty: 1,
      skip: 1,
      extraTime: 1,
      doublePoints: 1
    },
    dailyProgress: {
      date: new Date().toISOString().split("T")[0],
      matchesPlayed: 0,
      wins: 0,
      correctAnswers: 0,
      bananaPlayed: false
    },
    loginRewards: {
      lastClaimDate: "",
      streak: 0
    }
  });

  state.saveUsers(users);

  document.getElementById("registerUsername").value = "";
  document.getElementById("registerPassword").value = "";
  selectedAvatar = "";
  avatarOptions.forEach((item) => item.classList.remove("selected"));
  registerArea.classList.add("hidden");

  showMessage("Registered successfully. You can now log in.", "success");
};

loginBtn.onclick = () => {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const users = state.getUsers();
  const user = users.find((u) => u.username === username && u.password === password);

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
  localStorage.removeItem("damonTournament");
  refreshSessionUI();
  closeDropdown();
  showMessage("Logged out successfully.", "success");
};

claimDailyBtn.onclick = () => {
  const currentUser = state.getCurrentUser();

  if (!currentUser) {
    showMessage("Log in first.", "error");
    return;
  }

  const result = state.claimDailyLoginReward(currentUser.username);

  if (!result.success && result.alreadyClaimed) {
    refreshSessionUI();
    showMessage("Daily reward already claimed today.", "error");
    return;
  }

  refreshSessionUI();
  const powerupText = result.rewardPowerup ? ` + ${result.rewardPowerup}` : "";
  showMessage(`Claimed daily reward: +${result.rewardCoins} coins${powerupText}`, "success");
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

bossBtn.onclick = () => {
  const currentUser = state.getCurrentUser();
  if (!currentUser) {
    showMessage("Log in first to continue.", "error");
    return;
  }
  window.location.href = "boss.html";
};

tournamentBtn.onclick = () => {
  const currentUser = state.getCurrentUser();
  if (!currentUser) {
    showMessage("Log in first to continue.", "error");
    return;
  }
  window.location.href = "tournament.html";
};

refreshSessionUI();
closeDropdown();