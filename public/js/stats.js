const state = window.DamonState;

const user = state.getCurrentUser();

if (!user) {
location.href = "home.html";
}

const matches = state.getMatches();

const userMatches = matches.filter(m =>
m.player1 === user.username || m.player2 === user.username
);

document.getElementById("statsAvatar").textContent = user.avatar;
document.getElementById("statsUsername").textContent = user.username;

document.getElementById("statsPoints").textContent = user.totalPoints;
document.getElementById("statsWins").textContent = user.totalWins;
document.getElementById("statsLosses").textContent = user.totalLosses;
document.getElementById("statsMatches").textContent = user.matchesPlayed;

const winRate = user.matchesPlayed
? Math.round(user.totalWins / user.matchesPlayed * 100)
: 0;

document.getElementById("statsWinRate").textContent = winRate + "%";

const categories = {
math:0,
banana:0,
general:0,
programming:0
};

const modes = {
pvp:0,
pc:0
};

userMatches.forEach(match=>{

if(categories[match.category] !== undefined){
categories[match.category]++;
}

if(match.mode==="pvp") modes.pvp++;
if(match.mode==="pc") modes.pc++;

});

const bestCategory = Object.keys(categories)
.reduce((a,b)=>categories[a]>categories[b]?a:b);

document.getElementById("statsBestCategory").textContent = bestCategory;

new Chart(document.getElementById("categoryChart"),{

type:"bar",

data:{
labels:["Math","Banana","General","Programming"],
datasets:[{
label:"Matches",
data:[
categories.math,
categories.banana,
categories.general,
categories.programming
],
backgroundColor:[
"#38bdf8",
"#facc15",
"#a855f7",
"#22c55e"
]
}]
},

options:{
plugins:{legend:{display:false}},
responsive:true
}

});

new Chart(document.getElementById("modeChart"),{

type:"doughnut",

data:{
labels:["PVP","Player vs PC"],
datasets:[{
data:[modes.pvp,modes.pc],
backgroundColor:[
"#22c55e",
"#f97316"
]
}]
},

options:{
responsive:true
}

});

if (window.DamonAudio) {
  window.DamonAudio.playMenuMusic();
}

const recentDiv = document.getElementById("recentMatches");

const recent = userMatches.slice(-5).reverse();

recent.forEach(match=>{

const el = document.createElement("div");

el.className="stats-breakdown-item";

el.innerHTML=`
<strong>${match.player1} vs ${match.player2}</strong>
<span>${match.category}</span>
`;

recentDiv.appendChild(el);

});