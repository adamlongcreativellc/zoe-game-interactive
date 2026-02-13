import { SceneSetup } from './scene/SceneSetup.js';
import { Board } from './scene/Board.js';
import { GamePiece } from './scene/GamePiece.js';
import { Card3D } from './scene/Card3D.js';
import { GameState } from './game/GameState.js';
import { CardDeck } from './game/CardDeck.js';
import { BonusSpaces } from './game/BonusSpaces.js';
import { TurnManager } from './game/TurnManager.js';
import { PieceAnimator } from './animation/PieceAnimator.js';
import { CardAnimator } from './animation/CardAnimator.js';
import { Celebration } from './animation/Celebration.js';
import { AudioManager } from './audio/AudioManager.js';
import { SetupScreen } from './ui/SetupScreen.js';
import { CardPicker } from './ui/CardPicker.js';
import { HUD } from './ui/HUD.js';
import { AnswerInput } from './ui/AnswerInput.js';
import { Scoreboard } from './ui/Scoreboard.js';
import { ResultScreen } from './ui/ResultScreen.js';

/**
 * Zoe's Math Quest - Main Entry Point
 */

// Wait for fonts to load
document.fonts.ready.then(() => {
  init();
});

function init() {
  // 1. Setup Three.js scene
  const canvas = document.getElementById('game-canvas');
  const sceneSetup = new SceneSetup(canvas);

  // 2. Build the game board
  const board = new Board(sceneSetup.scene);

  // 3. Create the 3D card
  const card3d = new Card3D(sceneSetup.scene);
  card3d.buildDeck();

  // 4. Create animation systems
  const pieceAnimator = new PieceAnimator(board.path);
  const cardAnimator = new CardAnimator(card3d);
  const celebration = new Celebration();

  // 5. Audio manager
  const audio = new AudioManager();

  // 6. Game state and logic
  const gameState = new GameState();
  const cardDeck = new CardDeck();
  const bonusSpaces = new BonusSpaces();

  // 7. UI elements
  const hud = new HUD();
  const answerInput = new AnswerInput();
  const scoreboard = new Scoreboard(hud);
  const resultScreen = new ResultScreen();
  const cardPicker = new CardPicker();

  // 8. Game pieces (created after player selection)
  let pieces = [];

  // Helper: create pieces for a set of players and launch the TurnManager
  function createGamePiecesAndStart(isResume) {
    audio.init();

    pieces = gameState.players.map((player, i) => {
      const piece = new GamePiece(sceneSetup.scene, player.color, i);
      const startPos = board.path.getStartPosition(i);
      const offset = board.path.getPieceOffset(i);
      piece.setPosition(
        startPos.x + offset.x,
        -1,
        startPos.z + offset.z
      );
      return piece;
    });

    const turnManager = new TurnManager({
      gameState,
      cardDeck,
      card3d,
      cardAnimator,
      board,
      pieces,
      pieceAnimator,
      bonusSpaces,
      hud,
      answerInput,
      scoreboard,
      resultScreen,
      celebration,
      audio,
      cardPicker,
    });

    if (isResume) {
      turnManager.resumeGame();
    } else {
      turnManager.startGame();
    }
  }

  // 9. Check for saved game
  const savedData = GameState.loadSaved();
  if (savedData && savedData.players && savedData.players.length > 0) {
    // Restore saved game — skip setup screen
    gameState.restoreFrom(savedData);
    document.getElementById('setup-screen').style.display = 'none';
    createGamePiecesAndStart(true);
  } else {
    // Show setup screen for a new game
    const setupScreen = new SetupScreen((players, roundCount) => {
      gameState.setMaxRounds(roundCount);
      players.forEach(p => {
        gameState.addPlayer(p.name, p.color, p.team);
      });
      createGamePiecesAndStart(false);
    });
  }

  // Animation loop - piece bobbing
  sceneSetup.onAnimate((delta, elapsed) => {
    for (const piece of pieces) {
      piece.updateBob(elapsed);
    }
  });

  // Start rendering
  sceneSetup.start();
}
