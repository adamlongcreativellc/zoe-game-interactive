import { SPACE_SIZE, SPACE_GAP } from '../utils/constants.js';

/**
 * Computes the 3D positions for all 30 spaces in a winding snake pattern.
 * Layout (from Zoe's board):
 *   Row 1 (bottom):    Spaces 1-7   left to right
 *   Row 2:             Spaces 8-14  right to left
 *   Row 3:             Spaces 15-21 left to right
 *   Row 4 (top):       Spaces 22-30 right to left → finish
 */
export class BoardPath {
  constructor() {
    this.positions = [null]; // index 0 is unused (1-indexed)
    this.computePositions();
  }

  computePositions() {
    const step = SPACE_SIZE + SPACE_GAP;
    const rows = [
      { start: 1, end: 7, z: 3.75, dir: 1 },     // bottom row, left to right
      { start: 8, end: 14, z: 1.25, dir: -1 },    // row 2, right to left
      { start: 15, end: 21, z: -1.25, dir: 1 },   // row 3, left to right
      { start: 22, end: 30, z: -3.75, dir: -1 },  // top row, right to left
    ];

    for (const row of rows) {
      const count = row.end - row.start + 1;
      // Center the row horizontally
      const totalWidth = (count - 1) * step;
      const startX = row.dir === 1 ? -totalWidth / 2 : totalWidth / 2;

      for (let i = 0; i < count; i++) {
        const x = startX + row.dir * i * step;
        const z = row.z;
        this.positions.push({ x, y: 0.15, z });
      }
    }
  }

  getPosition(spaceNum) {
    if (spaceNum < 1 || spaceNum > 30) return { x: 0, y: 0.15, z: 6 };
    return this.positions[spaceNum];
  }

  // Start position (off-board, below space 1)
  getStartPosition(playerIndex) {
    const offsets = [-0.7, -0.25, 0.25, 0.7];
    return {
      x: this.positions[1].x - 2 + offsets[playerIndex],
      y: 0.15,
      z: this.positions[1].z + 1.5,
    };
  }

  // Small offset so multiple pieces on same space don't overlap
  getPieceOffset(playerIndex) {
    const offsets = [
      { x: -0.2, z: -0.2 },
      { x: 0.2, z: -0.2 },
      { x: -0.2, z: 0.2 },
      { x: 0.2, z: 0.2 },
    ];
    return offsets[playerIndex];
  }
}
