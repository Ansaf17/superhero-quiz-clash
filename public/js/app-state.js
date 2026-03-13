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
      coins: Number(user.coins || 0),
      winStreak: Number(user.winStreak || 0),
      bestWinStreak: Number(user.bestWinStreak || 0),
      achievements: Array.isArray(user.achievements) ? user.achievements : [],
      ownedAvatars:
        Array.isArray(user.ownedAvatars) && user.ownedAvatars.length
          ? user.ownedAvatars
          : ["🦸"],
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
      },
      loginRewards: user.loginRewards || {
        lastClaimDate: "",
        streak: 0
      },
      bossStats: user.bossStats || {
        victories: 0,
        defeats: 0,
        bossesDefeated: []
      }
    };
  },

  getUsers() {
    const raw = localStorage.getItem("users");
    const users = raw ? JSON.parse(raw) : [];
    return users.map((user) => this.normalizeUser(user));
  },

  saveUsers(users) {
    localStorage.setItem(
      "users",
      JSON.stringify(users.map((user) => this.normalizeUser(user)))
    );
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

  getAvailableAvatars() {
    return [
      { avatar: "🦸", price: 0, name: "Hero" },
      { avatar: "🦹", price: 80, name: "Villain" },
      { avatar: "⚡", price: 100, name: "Lightning" },
      { avatar: "🔥", price: 100, name: "Fire" },
      { avatar: "🛡️", price: 120, name: "Shield" },
      { avatar: "🌟", price: 140, name: "Star" },
      { avatar: "💥", price: 150, name: "Blast" },
      { avatar: "🌪️", price: 160, name: "Storm" },
      { avatar: "🤖", price: 180, name: "Bot" },
      { avatar: "🐉", price: 220, name: "Dragon" },
      { avatar: "👑", price: 260, name: "Crown" },
      { avatar: "💎", price: 300, name: "Diamond" }
    ];
  },

  getShopItems() {
    return [
      { id: "fiftyFifty", title: "50/50", type: "powerup", price: 40, amount: 1, icon: "🎯" },
      { id: "skip", title: "Skip", type: "powerup", price: 45, amount: 1, icon: "⏭" },
      { id: "extraTime", title: "+5 Time", type: "powerup", price: 35, amount: 1, icon: "⏱" },
      { id: "doublePoints", title: "Double Points", type: "powerup", price: 60, amount: 1, icon: "💥" }
    ];
  },

  getBossProfiles() {
    return [
      {
        id: "ironTitan",
        name: "Iron Titan",
        avatar: "🛡️",
        hp: 60,
        description: "Slow but durable boss with heavy HP.",
        rewardCoins: 120,
        rewardXp: 80,
        rewardPowerup: "fiftyFifty"
      },
      {
        id: "shadowBrain",
        name: "Shadow Brain",
        avatar: "🧠",
        hp: 50,
        description: "Highly accurate boss with tricky pressure.",
        rewardCoins: 140,
        rewardXp: 100,
        rewardPowerup: "doublePoints"
      },
      {
        id: "chaosHydra",
        name: "Chaos Hydra",
        avatar: "🐉",
        hp: 70,
        description: "Unpredictable boss with strong endurance.",
        rewardCoins: 180,
        rewardXp: 130,
        rewardPowerup: "skip"
      }
    ];
  },

  calculateXpGain(score, winner, username) {
    const correctAnswerXp = Math.floor(score / 10) * 10;
    let outcomeXp = 0;

    if (winner === "draw") outcomeXp = 10;
    else if (winner === username) outcomeXp = 25;
    else outcomeXp = 5;

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
      { id: "five_win_streak", title: "5 Win Streak", description: "Win 5 matches in a row." },
      { id: "first_boss_win", title: "Boss Slayer", description: "Defeat your first boss." }
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
      { id: "five_win_streak", condition: user.winStreak >= 5 },
      { id: "first_boss_win", condition: user.bossStats?.victories >= 1 }
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

      if (challenge.id === "daily_win_1") completed = user.dailyProgress.wins >= 1;
      else if (challenge.id === "daily_correct_5") completed = user.dailyProgress.correctAnswers >= 5;
      else if (challenge.id === "daily_banana_1") completed = user.dailyProgress.bananaPlayed === true;

      return { ...challenge, completed };
    });
  },

  updateDailyProgress(user, category, correctAnswers, won) {
    this.resetDailyProgressIfNeeded(user);

    user.dailyProgress.matchesPlayed += 1;
    user.dailyProgress.correctAnswers += correctAnswers;

    if (won) user.dailyProgress.wins += 1;
    if (category === "banana") user.dailyProgress.bananaPlayed = true;

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

  rewardCoins(user, won, score) {
    const scoreCoins = Math.floor(score / 10) * 5;
    const resultCoins = won ? 25 : 10;
    const total = scoreCoins + resultCoins;
    user.coins += total;
    return total;
  },

  claimDailyLoginReward(username) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return { success: false, message: "User not found." };
    }

    const today = this.getTodayString();

    if (user.loginRewards.lastClaimDate === today) {
      return {
        success: false,
        alreadyClaimed: true,
        streak: user.loginRewards.streak,
        rewardCoins: 0,
        rewardPowerup: null
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    if (user.loginRewards.lastClaimDate === yesterdayString) {
      user.loginRewards.streak += 1;
    } else {
      user.loginRewards.streak = 1;
    }

    user.loginRewards.lastClaimDate = today;

    const rewardCoins = 20 + (user.loginRewards.streak - 1) * 5;
    user.coins += rewardCoins;

    let rewardPowerup = null;
    if (user.loginRewards.streak % 3 === 0) {
      user.powerupInventory.extraTime += 1;
      rewardPowerup = "+5 Time";
    }

    this.saveUsers(users);
    this.setCurrentUser(user);

    return {
      success: true,
      alreadyClaimed: false,
      streak: user.loginRewards.streak,
      rewardCoins,
      rewardPowerup
    };
  },

  buyShopItem(username, itemId) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);
    const item = this.getShopItems().find((shopItem) => shopItem.id === itemId);

    if (!user || !item) return { success: false, message: "Invalid purchase." };
    if (user.coins < item.price) return { success: false, message: "Not enough coins." };

    user.coins -= item.price;

    if (item.id === "fiftyFifty") user.powerupInventory.fiftyFifty += item.amount;
    else if (item.id === "skip") user.powerupInventory.skip += item.amount;
    else if (item.id === "extraTime") user.powerupInventory.extraTime += item.amount;
    else if (item.id === "doublePoints") user.powerupInventory.doublePoints += item.amount;

    this.saveUsers(users);
    this.setCurrentUser(user);

    return { success: true, item, user };
  },

  unlockAvatar(username, avatarValue) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);
    const avatarItem = this.getAvailableAvatars().find((item) => item.avatar === avatarValue);

    if (!user || !avatarItem) return { success: false, message: "Invalid avatar." };
    if (user.ownedAvatars.includes(avatarValue)) return { success: false, message: "Avatar already unlocked." };
    if (user.coins < avatarItem.price) return { success: false, message: "Not enough coins." };

    user.coins -= avatarItem.price;
    user.ownedAvatars.push(avatarValue);

    this.saveUsers(users);
    this.setCurrentUser(user);

    return { success: true, avatarItem, user };
  },

  equipAvatar(username, avatarValue) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);

    if (!user) return { success: false, message: "User not found." };
    if (!user.ownedAvatars.includes(avatarValue)) {
      return { success: false, message: "Avatar is not unlocked." };
    }

    user.avatar = avatarValue;
    this.saveUsers(users);
    this.setCurrentUser(user);

    return { success: true, user };
  },

  saveBossBattleStats(username, bossProfile, playerScore, bossScore, won, category, correctAnswers) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);

    if (!user) return null;

    user.totalPoints += playerScore;
    user.matchesPlayed += 1;

    if (won) {
      user.totalWins += 1;
      user.bossStats.victories += 1;
      if (!user.bossStats.bossesDefeated.includes(bossProfile.id)) {
        user.bossStats.bossesDefeated.push(bossProfile.id);
      }
    } else {
      user.totalLosses += 1;
      user.bossStats.defeats += 1;
    }

    this.updateWinStreak(user, won ? user.username : bossProfile.name);

    const scoreXp = this.calculateXpGain(playerScore, won ? user.username : bossProfile.name, user.username);
    const bossBonusXp = won ? bossProfile.rewardXp : Math.floor(bossProfile.rewardXp / 3);
    const totalXpGain = scoreXp + bossBonusXp;

    const progress = this.applyProgress(user, totalXpGain);
    const achievements = this.unlockAchievements(user);
    const daily = this.updateDailyProgress(user, category, correctAnswers, won);

    let coinReward = this.rewardCoins(user, won, playerScore);
    const rewards = [];

    if (won) {
      user.coins += bossProfile.rewardCoins;
      coinReward += bossProfile.rewardCoins;

      if (bossProfile.rewardPowerup === "fiftyFifty") {
        user.powerupInventory.fiftyFifty += 1;
        rewards.push("50/50");
      } else if (bossProfile.rewardPowerup === "skip") {
        user.powerupInventory.skip += 1;
        rewards.push("Skip");
      } else if (bossProfile.rewardPowerup === "extraTime") {
        user.powerupInventory.extraTime += 1;
        rewards.push("+5 Time");
      } else if (bossProfile.rewardPowerup === "doublePoints") {
        user.powerupInventory.doublePoints += 1;
        rewards.push("Double Points");
      }
    }

    this.saveUsers(users);
    this.setCurrentUser(user);

    const matches = this.getMatches();
    matches.push({
      player1: username,
      player2: bossProfile.name,
      player1Score: playerScore,
      player2Score: bossScore,
      winner: won ? username : bossProfile.name,
      category,
      mode: "boss",
      bossId: bossProfile.id,
      player1XpGain: totalXpGain,
      player2XpGain: 0,
      player1CorrectAnswers: correctAnswers,
      player2CorrectAnswers: 0,
      player1CoinReward: coinReward,
      player2CoinReward: 0,
      date: new Date().toLocaleString()
    });
    this.saveMatches(matches);

    return {
      progress,
      achievements,
      daily,
      rewards,
      coinReward,
      bossBonusXp
    };
  }
};