import { easeInOutCubic, easeOutBounce } from '../utils/helpers.js';
import { PIECE_MOVE_DURATION } from '../utils/constants.js';

/**
 * Animates game pieces hopping along the board path.
 */
export class PieceAnimator {
  constructor(boardPath) {
    this.boardPath = boardPath;
    this.animations = [];
  }

  /**
   * Animate a piece from one space to another, hopping through intermediate spaces.
   * Returns a promise that resolves when animation completes.
   */
  async animateMove(piece, fromSpace, toSpace, playerIndex) {
    if (fromSpace === toSpace) return;

    const start = Math.max(fromSpace, 0);
    const end = toSpace;
    const step = end > start ? 1 : -1;

    // Hop through each intermediate space
    for (let s = start + step; s !== end + step; s += step) {
      const targetPos = this.boardPath.getPosition(Math.max(1, Math.min(30, s)));
      const offset = this.boardPath.getPieceOffset(playerIndex);

      await this.hopTo(piece, {
        x: targetPos.x + offset.x,
        y: targetPos.y,
        z: targetPos.z + offset.z,
      });
    }
  }

  /**
   * Hop piece to a position with a bounce arc.
   */
  hopTo(piece, target) {
    return new Promise(resolve => {
      const startPos = {
        x: piece.mesh.position.x,
        y: piece.mesh.position.y,
        z: piece.mesh.position.z,
      };
      const startTime = performance.now();
      const duration = PIECE_MOVE_DURATION;
      const hopHeight = 0.6;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);

        // Horizontal interpolation
        piece.mesh.position.x = startPos.x + (target.x - startPos.x) * eased;
        piece.mesh.position.z = startPos.z + (target.z - startPos.z) * eased;

        // Vertical arc (hop)
        const arc = Math.sin(t * Math.PI) * hopHeight;
        piece.mesh.position.y = target.y + arc;

        // Small rotation during hop
        piece.mesh.rotation.y = Math.sin(t * Math.PI) * 0.2;

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          piece.mesh.position.set(target.x, target.y, target.z);
          piece.mesh.rotation.y = 0;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Animate piece entering the board from off-screen.
   */
  animateEntry(piece, targetPos) {
    return new Promise(resolve => {
      const startPos = {
        x: piece.mesh.position.x,
        y: 3,
        z: piece.mesh.position.z,
      };
      piece.mesh.position.y = 3;
      piece.mesh.visible = true;
      piece.visible = true;

      const startTime = performance.now();
      const duration = 800;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutBounce(t);

        piece.mesh.position.x = startPos.x + (targetPos.x - startPos.x) * eased;
        piece.mesh.position.y = startPos.y + (targetPos.y - startPos.y) * eased;
        piece.mesh.position.z = startPos.z + (targetPos.z - startPos.z) * eased;

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          piece.mesh.position.set(targetPos.x, targetPos.y, targetPos.z);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}
