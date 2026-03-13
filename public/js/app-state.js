window.DamonState = {
  normalizeUser(user) {
    return {
      username: user.username || "",
      password: user.password || "",
      avatar: user.avatar || "🦸",
      totalPoints: Number(user.totalPoints || 0),
      totalWins: Number(user.totalWins || 0),
      totalLosses: Number(user.totalLosses || 0),
      matchesPlayed: Number(user.matchesPlayed || 0),
      xp: Number(user.xp || 0),
      level: Number(user.level || 1),
      rankTitle: user.rankTitle || "Rookie",
      leaderboardTier: user.leaderboardTier || "Bronze",
      achievements: Array.isArray(user.achievements) ? user.achievements : [],
      dailyProgress: user.dailyProgress || {
        correctToday: 0,
        matchesToday: 0,
        winsToday: 0,
        lastUpdated: new Date().toISOString().split("T")[0]
      }
    };
  },

  getUsers() {
    const raw = localStorage.getItem("users");
    const users = raw ? JSON.parse(raw) : [];
    return users.map((user) => this.normalizeUser(user));
  },

  saveUsers(users) {
    const normalized = users.map((user) => this.normalizeUser(user));
    localStorage.setItem("users", JSON.stringify(normalized));
  },

  getCurrentUser() {
    const raw = localStorage.getItem("currentUser");
    return raw ? this.normalizeUser(JSON.parse(raw)) : null;
  },

  setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(this.normalizeUser(user)));
  },

  clearCurrentUser() {
    localStorage.removeItem("currentUser");
  },

  getBattleConfig() {
    const raw = localStorage.getItem("battleConfig");
    return raw ? JSON.parse(raw) : null;
  },

  setBattleConfig(config) {
    localStorage.setItem("battleConfig", JSON.stringify(config));
  },

  clearBattleConfig() {
    localStorage.removeItem("battleConfig");
  },

  clearPvpDraft() {
    localStorage.removeItem("pvpDraft");
  },

  getMatches() {
    const raw = localStorage.getItem("matches");
    return raw ? JSON.parse(raw) : [];
  },

  saveMatches(matches) {
    localStorage.setItem("matches", JSON.stringify(matches));
  },

  getH2H() {
    const raw = localStorage.getItem("h2h");
    return raw ? JSON.parse(raw) : {};
  },

  saveH2H(h2h) {
    localStorage.setItem("h2h", JSON.stringify(h2h));
  },

  shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  decodeHtml(text) {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  },

  getSettings() {
    return JSON.parse(localStorage.getItem("damonSettings") || "null");
  },

  saveSettings(settings) {
    localStorage.setItem("damonSettings", JSON.stringify(settings));
  },

  getDefaultSettings() {
    return {
      soundEnabled: true,
      defaultDifficulty: "easy",
      defaultCategory: "math",
      turnTimer: 10
    };
  },

  getXpForLevel(level) {
    if (level <= 1) return 0;
    let total = 0;
    for (let i = 1; i < level; i += 1) {
      total += i * 100;
    }
    return total;
  },

  getLevelFromXp(xp) {
    let level = 1;
    let requiredForNext = 100;
    let remainingXp = xp;

    while (remainingXp >= requiredForNext) {
      remainingXp -= requiredForNext;
      level += 1;
      requiredForNext = level * 100;
    }

    return level;
  },

  getRankTitle(level) {
    if (level >= 9) return "Legend";
    if (level >= 7) return "Master";
    if (level >= 5) return "Champion";
    if (level >= 3) return "Warrior";
    return "Rookie";
  },

  getLeaderboardTier(wins) {
    if (wins >= 20) return "Legend";
    if (wins >= 15) return "Master";
    if (wins >= 10) return "Diamond";
    if (wins >= 6) return "Gold";
    if (wins >= 3) return "Silver";
    return "Bronze";
  },

  calculateXpGain(score, winner, username) {
    const correctAnswerXp = Math.floor(score / 10) * 10;
    let outcomeXp = 0;

    if (winner === "draw") {
      outcomeXp = 10;
    } else if (winner === username) {
      outcomeXp = 25;
    } else {
      outcomeXp = 5;
    }

    return correctAnswerXp + outcomeXp;
  },

  applyProgress(user, xpGain) {
    const oldLevel = user.level;
    const oldRankTitle = user.rankTitle;
    const oldTier = user.leaderboardTier;

    user.xp += xpGain;
    user.level = this.getLevelFromXp(user.xp);
    user.rankTitle = this.getRankTitle(user.level);
    user.leaderboardTier = this.getLeaderboardTier(user.totalWins);

    return {
      xpGain,
      oldLevel,
      newLevel: user.level,
      leveledUp: user.level > oldLevel,
      oldRankTitle,
      newRankTitle: user.rankTitle,
      rankChanged: oldRankTitle !== user.rankTitle,
      oldTier,
      newTier: user.leaderboardTier,
      tierChanged: oldTier !== user.leaderboardTier
    };
  },

  saveUserStats(player1Username, player2Username, player1Score, player2Score, winner, category, mode) {
    const users = this.getUsers();

    const player1 = users.find((u) => u.username === player1Username);
    const player2 = users.find((u) => u.username === player2Username);

    if (!player1 || !player2) {
      return null;
    }

    player1.totalPoints += player1Score;
    player2.totalPoints += player2Score;

    player1.matchesPlayed += 1;
    player2.matchesPlayed += 1;

    if (winner === player1.username) {
      player1.totalWins += 1;
      player2.totalLosses += 1;
    } else if (winner === player2.username) {
      player2.totalWins += 1;
      player1.totalLosses += 1;
    }

    player1.leaderboardTier = this.getLeaderboardTier(player1.totalWins);
    player2.leaderboardTier = this.getLeaderboardTier(player2.totalWins);

    const player1XpGain = this.calculateXpGain(player1Score, winner, player1.username);
    const player2XpGain = this.calculateXpGain(player2Score, winner, player2.username);

    const player1Progress = this.applyProgress(player1, player1XpGain);
    const player2Progress = this.applyProgress(player2, player2XpGain);

    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedCurrentUser = users.find((u) => u.username === currentUser.username);
      if (updatedCurrentUser) {
        this.setCurrentUser(updatedCurrentUser);
      }
    }

    const matches = this.getMatches();
    matches.push({
      player1: player1.username,
      player2: player2.username,
      player1Score,
      player2Score,
      winner,
      category,
      mode,
      player1XpGain,
      player2XpGain,
      date: new Date().toLocaleString()
    });
    this.saveMatches(matches);

    const h2h = this.getH2H();
    const names = [player1.username, player2.username].sort();
    const key = `${names[0]}__${names[1]}`;

    if (!h2h[key]) {
      h2h[key] = {
        matches: 0,
        [player1.username]: 0,
        [player2.username]: 0,
        [`${player1.username}Points`]: 0,
        [`${player2.username}Points`]: 0
      };
    }

    h2h[key].matches += 1;
    h2h[key][`${player1.username}Points`] += player1Score;
    h2h[key][`${player2.username}Points`] += player2Score;

    if (winner === player1.username) {
      h2h[key][player1.username] += 1;
    } else if (winner === player2.username) {
      h2h[key][player2.username] += 1;
    }

    this.saveH2H(h2h);

    return {
      player1Progress,
      player2Progress
    };
  }
};