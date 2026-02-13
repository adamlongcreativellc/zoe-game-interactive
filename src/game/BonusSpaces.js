import { SPACES, TOTAL_SPACES } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

/**
 * Handles bonus space logic.
 * When a player lands on a bonus space, they auto-move forward or backward.
 */
export class BonusSpaces {
  /**
   * Check if a space is a bonus space
   */
  isBonus(spaceNum) {
    if (spaceNum < 1 || spaceNum > TOTAL_SPACES) return false;
    return SPACES[spaceNum].bonus;
  }

  /**
   * Get the bonus effect for a space
   * Returns { direction, amount, targetSpace } or null
   */
  getEffect(spaceNum) {
    if (!this.isBonus(spaceNum)) return null;

    const space = SPACES[spaceNum];

    // Special case: space 30 bonus is "move to finish"
    if (spaceNum === 30) {
      return {
        direction: 1,
        amount: 0,
        targetSpace: 30,
        label: 'WIN',
      };
    }

    const direction = space.bonusDirection;
    const amount = space.bonusAmount;
    const targetSpace = clamp(spaceNum + direction * amount, 1, TOTAL_SPACES);
    const label = `${direction > 0 ? '+' : '-'}${amount}`;

    return {
      direction,
      amount,
      targetSpace,
      label,
    };
  }
}
