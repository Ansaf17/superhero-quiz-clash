const state = window.DamonState;
let currentUser = state.getCurrentUser();

if (!currentUser) {
  window.location.href = "home.html";
}

const messageBox = document.getElementById("messageBox");
const shopCoinsText = document.getElementById("shopCoinsText");
const shopPowerupGrid = document.getElementById("shopPowerupGrid");
const shopAvatarGrid = document.getElementById("shopAvatarGrid");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function refreshCurrentUser() {
  currentUser = state.getCurrentUser();
  shopCoinsText.textContent = `${currentUser.coins} Coins`;
}

function renderPowerups() {
  const shopItems = state.getShopItems();

  shopPowerupGrid.innerHTML = "";
  shopItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card shop-item-card";
    card.innerHTML = `
      <div class="shop-item-icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>Price: ${item.price} coins</p>
      <p>Owned: ${currentUser.powerupInventory[item.id]}</p>
      <button type="button">Buy</button>
    `;

    const btn = card.querySelector("button");
    btn.onclick = () => {
      const result = state.buyShopItem(currentUser.username, item.id);

      if (!result.success) {
        showMessage(result.message, "error");
        return;
      }

      refreshCurrentUser();
      renderPowerups();
      showMessage(`Purchased ${item.title}.`, "success");
    };

    shopPowerupGrid.appendChild(card);
  });
}

function renderAvatars() {
  const avatars = state.getAvailableAvatars();

  shopAvatarGrid.innerHTML = "";
  avatars.forEach((item) => {
    const owned = currentUser.ownedAvatars.includes(item.avatar);
    const equipped = currentUser.avatar === item.avatar;

    const card = document.createElement("div");
    card.className = "card shop-item-card";
    card.innerHTML = `
      <div class="shop-avatar-preview">${item.avatar}</div>
      <h3>${item.name}</h3>
      <p>${item.price === 0 ? "Starter Avatar" : `Price: ${item.price} coins`}</p>
      <p>${owned ? "Unlocked" : "Locked"}</p>
      <button type="button">${equipped ? "Equipped" : owned ? "Equip" : "Unlock"}</button>
    `;

    const btn = card.querySelector("button");
    if (equipped) btn.disabled = true;

    btn.onclick = () => {
      if (!owned) {
        const result = state.unlockAvatar(currentUser.username, item.avatar);

        if (!result.success) {
          showMessage(result.message, "error");
          return;
        }

        refreshCurrentUser();
        renderAvatars();
        showMessage(`${item.name} unlocked.`, "success");
        return;
      }

      const equipResult = state.equipAvatar(currentUser.username, item.avatar);

      if (!equipResult.success) {
        showMessage(equipResult.message, "error");
        return;
      }

      refreshCurrentUser();
      renderAvatars();
      showMessage(`${item.name} equipped.`, "success");
    };

    shopAvatarGrid.appendChild(card);
  });
}

refreshCurrentUser();
renderPowerups();
renderAvatars();
