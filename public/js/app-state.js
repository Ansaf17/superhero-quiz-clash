window.DamonState = {
  normalizeUser(user) {
    const today = new Date().toISOString().split("T")[0];

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
      winStreak: Number(user.winStreak || 0),
      bestWinStreak: Number(user.bestWinStreak || 0),
      achievements: Array.isArray(user.achievements) ? user.achievements : [],
      powerupInventory: {
        fiftyFifty: Number(user.powerupInventory?.fiftyFifty || 1),
        skip: Number(user.powerupInventory?.skip || 1),
        extraTime: Number(user.powerupInventory?.extraTime || 1),
        doublePoints: Number(user.powerupInventory?.doublePoints || 1)
      },
      dailyProgress: user.dailyProgress || {
        date: today,
        matchesPlayed: 0,
        wins: 0,
        correctAnswers: 0,
        bananaPlayed: false
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

  getXpIntoCurrentLevel(xp) {
    let level = 1;
    let requiredForNext = 100;
    let remainingXp = xp;

    while (remainingXp >= requiredForNext) {
      remainingXp -= requiredForNext;
      level += 1;
      requiredForNext = level * 100;
    }

    return {
      level,
      xpIntoLevel: remainingXp,
      xpNeededForNextLevel: requiredForNext
    };
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

  getTierEmoji(tier) {
    const map = {
      Bronze: "🟤",
      Silver: "⚪",
      Gold: "🟡",
      Diamond: "💎",
      Master: "🟣",
      Legend: "👑"
    };
    return map[tier] || "🏅";
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
    const oldXp = user.xp;

    user.xp += xpGain;
    user.level = this.getLevelFromXp(user.xp);
    user.rankTitle = this.getRankTitle(user.level);
    user.leaderboardTier = this.getLeaderboardTier(user.totalWins);

    const xpState = this.getXpIntoCurrentLevel(user.xp);

    return {
      xpGain,
      oldXp,
      newXp: user.xp,
      oldLevel,
      newLevel: user.level,
      leveledUp: user.level > oldLevel,
      oldRankTitle,
      newRankTitle: user.rankTitle,
      rankChanged: oldRankTitle !== user.rankTitle,
      oldTier,
      newTier: user.leaderboardTier,
      tierChanged: oldTier !== user.leaderboardTier,
      xpIntoLevel: xpState.xpIntoLevel,
      xpNeededForNextLevel: xpState.xpNeededForNextLevel,
      xpPercent: Math.max(0, Math.min(100, (xpState.xpIntoLevel / xpState.xpNeededForNextLevel) * 100))
    };
  },

  getTodayString() {
    return new Date().toISOString().split("T")[0];
  },

  resetDailyProgressIfNeeded(user) {
    const today = this.getTodayString();

    if (!user.dailyProgress || user.dailyProgress.date !== today) {
      user.dailyProgress = {
        date: today,
        matchesPlayed: 0,
        wins: 0,
        correctAnswers: 0,
        bananaPlayed: false
      };
    }
  },

  getAchievementDefinitions() {
    return [
      { id: "first_win", title: "First Win", description: "Win your first match." },
      { id: "ten_wins", title: "10 Wins", description: "Reach 10 total wins." },
      { id: "hundred_points", title: "100 Points", description: "Reach 100 total points." },
      { id: "five_win_streak", title: "5 Win Streak", description: "Win 5 matches in a row." }
    ];
  },

  getAchievementMap() {
    const defs = this.getAchievementDefinitions();
    const map = {};
    defs.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  },

  unlockAchievements(user) {
    const unlocked = [];
    const current = new Set(user.achievements);
    const defs = this.getAchievementMap();

    const checks = [
      { id: "first_win", condition: user.totalWins >= 1 },
      { id: "ten_wins", condition: user.totalWins >= 10 },
      { id: "hundred_points", condition: user.totalPoints >= 100 },
      { id: "five_win_streak", condition: user.winStreak >= 5 }
    ];

    checks.forEach((check) => {
      if (check.condition && !current.has(check.id)) {
        user.achievements.push(check.id);
        unlocked.push(defs[check.id]);
      }
    });

    return unlocked;
  },

  getDailyChallengeDefinitions() {
    return [
      { id: "daily_win_1", title: "Daily Challenger", description: "Win 1 match today." },
      { id: "daily_correct_5", title: "Sharp Mind", description: "Answer 5 questions correctly today." },
      { id: "daily_banana_1", title: "Banana Trouble", description: "Play 1 Banana API match today." }
    ];
  },

  getDailyChallengeStatuses(user) {
    this.resetDailyProgressIfNeeded(user);

    const defs = this.getDailyChallengeDefinitions();

    return defs.map((challenge) => {
      let completed = false;

      if (challenge.id === "daily_win_1") {
        completed = user.dailyProgress.wins >= 1;
      } else if (challenge.id === "daily_correct_5") {
        completed = user.dailyProgress.correctAnswers >= 5;
      } else if (challenge.id === "daily_banana_1") {
        completed = user.dailyProgress.bananaPlayed === true;
      }

      return { ...challenge, completed };
    });
  },

  updateDailyProgress(user, category, correctAnswers, won) {
    this.resetDailyProgressIfNeeded(user);

    user.dailyProgress.matchesPlayed += 1;
    user.dailyProgress.correctAnswers += correctAnswers;

    if (won) {
      user.dailyProgress.wins += 1;
    }

    if (category === "banana") {
      user.dailyProgress.bananaPlayed = true;
    }

    return this.getDailyChallengeStatuses(user);
  },

  updateWinStreak(user, winner) {
    if (winner === user.username) {
      user.winStreak += 1;
      if (user.winStreak > user.bestWinStreak) {
        user.bestWinStreak = user.winStreak;
      }
    } else if (winner !== "draw") {
      user.winStreak = 0;
    }
  },

  rewardPowerups(user, won) {
    const rewards = [];

    if (won) {
      user.powerupInventory.fiftyFifty += 1;
      user.powerupInventory.skip += 1;
      rewards.push("50/50", "Skip");
    } else {
      user.powerupInventory.extraTime += 1;
      rewards.push("+5 Time");
    }

    if (user.totalWins > 0 && user.totalWins % 3 === 0) {
      user.powerupInventory.doublePoints += 1;
      rewards.push("Double Points");
    }

    return rewards;
  },

  saveUserStats(player1Username, player2Username, player1Score, player2Score, winner, category, mode, extra = {}) {
    const users = this.getUsers();

    const player1 = users.find((u) => u.username === player1Username);
    const player2 = users.find((u) => u.username === player2Username);

    if (!player1 || !player2) {
      return null;
    }

    const player1CorrectAnswers = Number(extra.player1CorrectAnswers || 0);
    const player2CorrectAnswers = Number(extra.player2CorrectAnswers || 0);

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

    this.updateWinStreak(player1, winner);
    this.updateWinStreak(player2, winner);

    const player1XpGain = this.calculateXpGain(player1Score, winner, player1.username);
    const player2XpGain = this.calculateXpGain(player2Score, winner, player2.username);

    const player1Progress = this.applyProgress(player1, player1XpGain);
    const player2Progress = this.applyProgress(player2, player2XpGain);

    const player1Achievements = this.unlockAchievements(player1);
    const player2Achievements = this.unlockAchievements(player2);

    const player1Daily = this.updateDailyProgress(player1, category, player1CorrectAnswers, winner === player1.username);
    const player2Daily = this.updateDailyProgress(player2, category, player2CorrectAnswers, winner === player2.username);

    const player1Rewards = this.rewardPowerups(player1, winner === player1.username);
    const player2Rewards = this.rewardPowerups(player2, winner === player2.username);

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
      player1CorrectAnswers,
      player2CorrectAnswers,
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
      player2Progress,
      player1Achievements,
      player2Achievements,
      player1Daily,
      player2Daily,
      player1Rewards,
      player2Rewards
    };
  },

  saveSinglePlayerStats(username, opponentName, playerScore, opponentScore, winner, category, mode, extra = {}) {
    const users = this.getUsers();
    const player = users.find((u) => u.username === username);

    if (!player) {
      return null;
    }

    const correctAnswers = Number(extra.correctAnswers || 0);

    player.totalPoints += playerScore;
    player.matchesPlayed += 1;

    if (winner === player.username) {
      player.totalWins += 1;
    } else if (winner !== "draw") {
      player.totalLosses += 1;
    }

    this.updateWinStreak(player, winner);

    const xpGain = this.calculateXpGain(playerScore, winner, player.username);
    const progress = this.applyProgress(player, xpGain);
    const achievements = this.unlockAchievements(player);
    const daily = this.updateDailyProgress(player, category, correctAnswers, winner === player.username);
    const rewards = this.rewardPowerups(player, winner === player.username);

    this.saveUsers(users);
    this.setCurrentUser(player);

    const matches = this.getMatches();
    matches.push({
      player1: username,
      player2: opponentName,
      player1Score: playerScore,
      player2Score: opponentScore,
      winner,
      category,
      mode,
      player1XpGain: xpGain,
      player2XpGain: 0,
      player1CorrectAnswers: correctAnswers,
      player2CorrectAnswers: 0,
      difficulty: extra.difficulty || "easy",
      personality: extra.personality || "slowThinker",
      date: new Date().toLocaleString()
    });
    this.saveMatches(matches);

    return {
      progress,
      achievements,
      daily,
      rewards
    };
  }
};
