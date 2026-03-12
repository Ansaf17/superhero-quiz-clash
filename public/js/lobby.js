const state = window.DamonState;
const currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const messageBox = document.getElementById("messageBox");
const p1Avatar = document.getElementById("p1Avatar");
const p1Name = document.getElementById("p1Name");
const p2Avatar = document.getElementById("p2Avatar");
const p2Name = document.getElementById("p2Name");
const continueBtn = document.getElementById("continueBtn");

let player2 = null;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function renderPlayer1() {
  p1Avatar.textContent = currentUser.avatar || "🦸";
  p1Name.textContent = currentUser.username || "Player 1";
}

renderPlayer1();

document.getElementById("confirmPlayer2Btn").onclick = () => {
  const username = document.getElementById("player2Username").value.trim();
  const password = document.getElementById("player2Password").value.trim();

  if (!username || !password) {
    showMessage("Enter Player 2 username and password.", "error");
    return;
  }

  if (username === currentUser.username) {
    showMessage("Player 2 cannot be the same as Player 1.", "error");
    return;
  }

  const users = state.getUsers();
  const matched = users.find(u => u.username === username && u.password === password);

  if (!matched) {
    showMessage("Player 2 login failed.", "error");
    return;
  }

  player2 = matched;
  p2Avatar.textContent = matched.avatar;
  p2Name.textContent = matched.username;
  continueBtn.disabled = false;
  showMessage("Player 2 confirmed successfully.", "success");
};

continueBtn.onclick = () => {
  if (!player2) {
    showMessage("Confirm Player 2 first.", "error");
    return;
  }

  state.setBattleConfig({
    mode: "pvp",
    player1: currentUser,
    player2
  });

  if (window.DamonFX) {
    window.DamonFX.navigate("category.html");
  } else {
    window.location.href = "category.html";
  }
};