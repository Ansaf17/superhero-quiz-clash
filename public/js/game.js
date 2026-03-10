const state = window.DamonState;
const config = state.getBattleConfig();
if (!config) window.location.href = "home.html";
const messageBox = document.getElementById("messageBox");
const p1Avatar = document.getElementById("p1Avatar");
const p2Avatar = document.getElementById("p2Avatar");
const p1Name = document.getElementById("p1Name");
const p2Name = document.getElementById("p2Name");
const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const turnIndicator = document.getElementById("turnIndicator");
const timerText = document.getElementById("timerText");
const roundNumber = document.getElementById("roundNumber");
const questionText = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answer-btn");
const resultCard = document.getElementById("resultCard");
const winnerText = document.getElementById("winnerText");
const finalScoreText = document.getElementById("finalScoreText");
const totalRounds = 5;
const turnTimeLimit = 10;
let player1Score = 0;
let player2Score = 0;
let currentTurn = "player1";
let currentRound = 1;
let correctIndex = 0;
let turnLocked = false;
let timerInterval = null;
let timeLeft = turnTimeLimit;
function showMessage(text, type) {
messageBox.textContent = text;
messageBox.className = `message-box ${type}`;
}
function updateHeader() {
p1Avatar.textContent = config.player1.avatar;
p2Avatar.textContent = config.player2.avatar;
p1Name.textContent = config.player1.username;
p2Name.textContent = config.player2.username;
p1ScoreEl.textContent = player1Score;
p2ScoreEl.textContent = player2Score;
roundNumber.textContent = currentRound;
turnIndicator.textContent = `Turn: ${currentTurn === "player1" ?
config.player1.username : config.player2.username}`;
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
function resetAnswers() {
answerButtons.forEach(btn => {
btn.classList.remove("correct", "wrong");
btn.disabled = false;
});
}
function setOptions(options, correctValue) {
const shuffled = state.shuffle(options);
correctIndex = shuffled.indexOf(correctValue);
answerButtons.forEach((btn, idx) => {
btn.textContent = shuffled[idx];
});
}
async function generateMathQuestion() {
const a = Math.floor(Math.random() * 10) + 1;
const b = Math.floor(Math.random() * 10) + 1;
const ops = ["+", "-", "*"];
const op = ops[Math.floor(Math.random() * ops.length)];
let correct = 0;
if (op === "+") correct = a + b;
if (op === "-") correct = a - b;
if (op === "*") correct = a * b;
questionText.textContent = `Question: ${a} ${op === "*" ? "×" : op} ${b}`;
const set = new Set([correct]);
while (set.size < 4) {
set.add(correct + (Math.floor(Math.random() * 7) - 3));
}
setOptions(Array.from(set), correct);
}
async function generateBananaQuestion() {
const response = await fetch("https://marcconrad.com/uob/banana/api.php");
const data = await response.json();
const solution = Number(data.solution);
questionText.innerHTML = `
 <div>
 <p>Solve the Banana Puzzle</p>
 <img src="${data.question}" alt="Banana puzzle">
 </div>
 `;
 const set = new Set([solution]);
while (set.size < 4) {
set.add(solution + (Math.floor(Math.random() * 7) - 3));
}
setOptions(Array.from(set), solution);
}
async function generateGeneralQuestion() {
const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
const data = await response.json();
const q = data.results[0];
const question = state.decodeHtml(q.question);
const correct = state.decodeHtml(q.correct_answer);
const incorrect = q.incorrect_answers.map(a => state.decodeHtml(a));
questionText.textContent = `Question: ${question}`;
setOptions([correct, ...incorrect], correct);
}
async function generateProgrammingQuestion() {
const response = await fetch("https://opentdb.com/api.php?amount=1&category=18&type=multiple");
const data = await response.json();
const q = data.results[0];
const question = state.decodeHtml(q.question);
const correct = state.decodeHtml(q.correct_answer);
const incorrect = q.incorrect_answers.map(a => state.decodeHtml(a));
questionText.textContent = `Question: ${question}`;
setOptions([correct, ...incorrect], correct);
}
async function generateQuestion() {
resetAnswers();
try {
if (config.category === "math") {
await generateMathQuestion();
} else if (config.category === "banana") {
await generateBananaQuestion();
} else if (config.category === "general") {
await generateGeneralQuestion();
} else if (config.category === "programming") {
await generateProgrammingQuestion();
} else {
await generateMathQuestion();
}
startTimer();
} catch (err) {
console.error(err);
showMessage("Question API failed. Falling back to maths.", "error");
await generateMathQuestion();
startTimer();
}
}
function finishMatch() {
stopTimer();
let winner = "draw";
let resultText = " The battle ended in a draw!";
if (player1Score > player2Score) {
winner = config.player1.username;
resultText = ` ${config.player1.username} wins the battle!`;
} else if (player2Score > player1Score) {
winner = config.player2.username;
resultText = ` ${config.player2.username} wins the battle!`;
}
winnerText.textContent = resultText;
finalScoreText.textContent = `Final Score: ${config.player1.username} $
{player1Score} - ${player2Score} ${config.player2.username}`;
state.saveUserStats(
config.player1.username,
config.player2.username,
player1Score,
player2Score,
winner,
config.category,
config.mode
);
resultCard.classList.remove("hidden");
showMessage("Match completed successfully.", "success");
}
async function nextTurn() {
resetAnswers();
turnLocked = false;
if (currentTurn === "player1") {
currentTurn = "player2";
updateHeader();
if (config.mode === "pc" && config.player2.isBot) {
await generateQuestion();
setTimeout(() => {
const botPick = Math.floor(Math.random() * 4);
handleAnswerClick(botPick);
}, 1500);
return;
}
await generateQuestion();
return;
}
if (currentRound === totalRounds) {
finishMatch();
return;
}
currentTurn = "player1";
currentRound += 1;
updateHeader();
await generateQuestion();
}
function handleTimeUp() {
if (turnLocked) return;
turnLocked = true;
answerButtons.forEach(btn => btn.disabled = true);
answerButtons[correctIndex].classList.add("correct");
showMessage("Time is up! Turn skipped.", "error");
setTimeout(() => nextTurn(), 1200);
}
function handleAnswerClick(index) {
if (turnLocked) return;
turnLocked = true;
stopTimer();
const correctBtn = answerButtons[correctIndex];
correctBtn.classList.add("correct");
if (index === correctIndex) {
if (currentTurn === "player1") player1Score += 10;
else player2Score += 10;
showMessage("Correct answer!", "success");
} else {
answerButtons[index].classList.add("wrong");
showMessage("Wrong answer!", "error");
}
updateHeader();
answerButtons.forEach(btn => btn.disabled = true);
setTimeout(() => nextTurn(), 1200);
}
answerButtons.forEach((btn, idx) => {
btn.onclick = () => handleAnswerClick(idx);
});
document.getElementById("playAgainBtn").onclick = () => {
window.location.href = "category.html";
};
document.getElementById("historyBtn").onclick = () => {
window.location.href = "leaderboard.html";
};
updateHeader();
generateQuestion();
