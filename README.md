# Superhero Quiz Clash

A superhero themed multiplayer quiz game where two players compete using API-generated questions.

Features:
- login system
- superhero avatars
- turn-based gameplay
- leaderboard
- head-to-head stats

Powerup rules

50/50
only works before answering
hides 2 wrong options
does not affect correct option

Skip
immediately ends current player turn
no points
no penalty

Extra Time
adds 5 seconds to current timer

Double Points
activates for next correct answer only
then turns off automatically after answer

## Branching Strategy

This project follows a Git branching workflow:

- main → stable production-ready code
- dev → integration branch for all features
- feature branches → individual feature development

Example branches:
- feature/xp-system
- feature/powerups
- feature/ui-upgrade
- bugfix/question-api

Workflow:
1. Create feature branch from dev
2. Develop feature
3. Merge into dev
4. Merge dev into main after testing

This approach ensures modular development, easier debugging, and maintainability.