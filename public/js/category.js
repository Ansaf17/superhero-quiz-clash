const state = window.DamonState;
const config = state.getBattleConfig();
const messageBox = document.getElementById("messageBox");
const tiles = document.querySelectorAll(".category-tile");
let selectedCategory = "math";
if (!config) {
window.location.href = "home.html";
}
function showMessage(text, type) {
messageBox.textContent = text;
messageBox.className = `message-box ${type}`;
}
tiles.forEach(tile => {
tile.onclick = () => {
tiles.forEach(t => t.classList.remove("active"));
tile.classList.add("active");
selectedCategory = tile.dataset.category;
};
});
document.getElementById("startGameBtn").onclick = () => {
config.category = selectedCategory;
state.setBattleConfig(config);
showMessage(`Category selected: ${selectedCategory}`, "success");
setTimeout(() => {
window.location.href = "game.html";
}, 350);
};
