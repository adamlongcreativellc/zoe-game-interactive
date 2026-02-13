// Player colors matching Zoe's game pieces
export const PLAYER_COLORS = {
  red: { hex: '#ff6b6b', name: 'Red', three: 0xff6b6b, glow: 'rgba(255,107,107,0.4)' },
  blue: { hex: '#45b7d1', name: 'Blue', three: 0x45b7d1, glow: 'rgba(69,183,209,0.4)' },
  green: { hex: '#6bcb77', name: 'Green', three: 0x6bcb77, glow: 'rgba(107,203,119,0.4)' },
  yellow: { hex: '#ffd93d', name: 'Yellow', three: 0xffd93d, glow: 'rgba(255,217,61,0.4)' },
};

export const COLOR_ORDER = ['red', 'blue', 'green', 'yellow'];

// Board space definitions: type = '+' or '-'
// Strict alternation: odd index = '+', even index = '-'
// Bonus spaces have a fixed bonusDirection: 1 = forward, -1 = back
export const SPACES = [
  null, // index 0 = no space (1-indexed)
  { num: 1, type: '+', bonus: false },
  { num: 2, type: '-', bonus: false },
  { num: 3, type: '+', bonus: true, bonusAmount: 2, bonusDirection: 1 },   // forward 2
  { num: 4, type: '-', bonus: false },
  { num: 5, type: '+', bonus: false },
  { num: 6, type: '-', bonus: false },
  { num: 7, type: '+', bonus: false },
  { num: 8, type: '-', bonus: true, bonusAmount: 1, bonusDirection: -1 },  // back 1
  { num: 9, type: '+', bonus: false },
  { num: 10, type: '-', bonus: false },
  { num: 11, type: '+', bonus: false },
  { num: 12, type: '-', bonus: true, bonusAmount: 3, bonusDirection: 1 },  // forward 3
  { num: 13, type: '+', bonus: false },
  { num: 14, type: '-', bonus: false },
  { num: 15, type: '+', bonus: false },
  { num: 16, type: '-', bonus: false },
  { num: 17, type: '+', bonus: false },
  { num: 18, type: '-', bonus: false },
  { num: 19, type: '+', bonus: true, bonusAmount: 2, bonusDirection: -1 }, // back 2
  { num: 20, type: '-', bonus: false },
  { num: 21, type: '+', bonus: false },
  { num: 22, type: '-', bonus: false },
  { num: 23, type: '+', bonus: true, bonusAmount: 2, bonusDirection: 1 },  // forward 2
  { num: 24, type: '-', bonus: false },
  { num: 25, type: '+', bonus: false },
  { num: 26, type: '-', bonus: false },
  { num: 27, type: '+', bonus: false },
  { num: 28, type: '-', bonus: false },
  { num: 29, type: '+', bonus: false },
  { num: 30, type: '-', bonus: true, bonusAmount: 99, bonusDirection: 1 }, // WIN
];

// Timing
export const TIMER_SECONDS = 10;
export const TURN_MESSAGE_DURATION = 2000;
export const CARD_DRAW_DURATION = 800;
export const CARD_FLIP_DURATION = 600;
export const PIECE_MOVE_DURATION = 500;
export const BONUS_MOVE_DELAY = 800;
export const RESULT_DISPLAY_DURATION = 1500;

// Game
export const DEFAULT_ROUNDS = 1;
export const MAX_ROUNDS_LIMIT = 3;
export const TOTAL_SPACES = 30;

// Rainbow colors for the board background
export const RAINBOW_COLORS = [
  0xff6b6b, // red
  0xffa06b, // orange
  0xffd93d, // yellow
  0x6bcb77, // green
  0x45b7d1, // blue
  0x7c6bff, // indigo
  0xa78bfa, // violet
  0xf472b6, // pink
];

// Card colors
export const CARD_PLUS_COLOR = 0x9b59b6; // purple
export const CARD_MINUS_COLOR = 0x45b7d1; // blue

// Board layout
export const BOARD_WIDTH = 18;
export const BOARD_HEIGHT = 14;
export const SPACE_SIZE = 1.1;
export const SPACE_GAP = 0.15;
