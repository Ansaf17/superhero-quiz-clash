const state = window.DamonState;
const container = document.getElementById("h2hDetailContent");

const params = new URLSearchParams(window.location.search);
const key = params.get("key");

const h2h = state.getH2H();

if (!key || !h2h[key]) {
  container.innerHTML = `<p>No head-to-head record found.</p>`;
} else {
  const record = h2h[key];
  const [nameA, nameB] = key.split("__");

  container.innerHTML = `
    <h2 style="margin-top:0;">${nameA} vs ${nameB}</h2>
    <div class="grid-2 profile-stats-grid">
      <div class="profile-stat-box">
        <h3>Total Matches</h3>
        <p>${record.matches}</p>
      </div>

      <div class="profile-stat-box">
        <h3>Overall Winner</h3>
        <p>${(record[nameA] || 0) > (record[nameB] || 0) ? nameA : (record[nameB] || 0) > (record[nameA] || 0) ? nameB : "Draw"}</p>
      </div>

      <div class="profile-stat-box">
        <h3>${nameA} Wins</h3>
        <p>${record[nameA] || 0}</p>
      </div>

      <div class="profile-stat-box">
        <h3>${nameB} Wins</h3>
        <p>${record[nameB] || 0}</p>
      </div>

      <div class="profile-stat-box">
        <h3>${nameA} Total Points</h3>
        <p>${record[`${nameA}Points`] || 0}</p>
      </div>

      <div class="profile-stat-box">
        <h3>${nameB} Total Points</h3>
        <p>${record[`${nameB}Points`] || 0}</p>
      </div>
    </div>
  `;
}
if (window.DamonAudio) {
  window.DamonAudio.playMenuMusic();
}