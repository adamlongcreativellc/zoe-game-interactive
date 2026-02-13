import { PLAYER_COLORS } from '../utils/constants.js';

/**
 * Scoreboard display - built into the HUD tally board.
 * This module provides helper methods for updating the displayed scores.
 */
export class Scoreboard {
  constructor(hud) {
    this.hud = hud;
  }

  init(players) {
    this.hud.buildTallyBoard(players);
    this.update(players);
  }

  update(players) {
    for (const player of players) {
      this.hud.updateTally(player.id, player.tallies);
    }
  }
}
