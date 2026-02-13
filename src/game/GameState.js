import { DEFAULT_ROUNDS, SPACES } from '../utils/constants.js';

/**
 * Core game state management.
 * Tracks players, positions, scores, rounds, and game phase.
 * Persists to localStorage so games survive page refreshes.
 */

const SAVE_KEY = 'zoe_math_quest_save';

export const PHASES = {
  SETUP: 'setup',
  DRAW: 'draw',
  SHOW_CARD: 'showCard',
  EQUATION: 'equation',
  ANSWERING: 'answering',
  RESULT: 'result',
  MOVING: 'moving',
  BONUS: 'bonus',
  PICK: 'pick',
  NEXT_TURN: 'nextTurn',
  ROUND_END: 'roundEnd',
  GAME_OVER: 'gameOver',
};

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.round = 1;
    this.maxRounds = DEFAULT_ROUNDS;
    this.phase = PHASES.SETUP;
    this.roundTallies = [];
    this.currentCard = null;
    this.timerRunning = false;
    this.finished = false;
    this.paused = false;
  }

  setMaxRounds(n) {
    this.maxRounds = Math.max(1, Math.min(3, n));
  }

  addPlayer(name, color, team) {
    this.players.push({
      id: this.players.length,
      name,
      color,
      team,
      position: 0,
      tallies: 0,
    });
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  get playerCount() {
    return this.players.length;
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  findNextSpace(currentPos, type) {
    for (let i = currentPos + 1; i <= 30; i++) {
      if (SPACES[i] && (SPACES[i].type === type || SPACES[i].bonus)) {
        return i;
      }
    }
    return currentPos;
  }

  addTally(playerIndex) {
    this.players[playerIndex].tallies++;
  }

  movePlayer(playerIndex, newPosition) {
    this.players[playerIndex].position = Math.min(newPosition, 30);
  }

  checkRoundEnd() {
    return this.players.some(p => p.position >= 30);
  }

  endRound() {
    this.roundTallies.push(
      this.players.map(p => ({ ...p, roundTally: p.tallies }))
    );

    if (this.round >= this.maxRounds) {
      this.phase = PHASES.GAME_OVER;
      this.finished = true;
      return;
    }

    this.round++;
    this.currentPlayerIndex = 0;
    for (const player of this.players) {
      player.position = 0;
    }
    this.phase = PHASES.ROUND_END;
  }

  getWinners() {
    let maxTally = 0;
    for (const p of this.players) {
      if (p.tallies > maxTally) maxTally = p.tallies;
    }
    return this.players.filter(p => p.tallies === maxTally);
  }

  getTotalScores() {
    return this.players.map(p => ({
      name: p.name,
      color: p.color,
      tallies: p.tallies,
      team: p.team,
    }));
  }

  // --- localStorage persistence ---

  save() {
    if (this.phase === PHASES.SETUP || this.phase === PHASES.GAME_OVER) return;
    try {
      const data = {
        players: this.players,
        currentPlayerIndex: this.currentPlayerIndex,
        round: this.round,
        maxRounds: this.maxRounds,
        phase: this.phase,
        roundTallies: this.roundTallies,
        finished: this.finished,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage may be unavailable; silently fail
    }
  }

  static hasSavedGame() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  static loadSaved() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  restoreFrom(data) {
    this.players = data.players;
    this.currentPlayerIndex = data.currentPlayerIndex;
    this.round = data.round;
    this.maxRounds = data.maxRounds;
    this.phase = data.phase;
    this.roundTallies = data.roundTallies;
    this.finished = data.finished;
  }

  static clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      // ignore
    }
  }
}
