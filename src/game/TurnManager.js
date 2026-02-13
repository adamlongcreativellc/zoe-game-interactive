import { SPACES, TIMER_SECONDS, TOTAL_SPACES } from '../utils/constants.js';
import { PHASES, GameState } from './GameState.js';
import { delay } from '../utils/helpers.js';

/**
 * Orchestrates the turn flow:
 * 1. Show player turn message
 * 2. Draw card (animate)
 * 3. Flip card to reveal equation
 * 4. Start timer, show answer input
 * 5. Evaluate answer → move or stay
 * 6. Check bonus space
 * 7. Check round end
 * 8. Next player
 */
export class TurnManager {
  constructor({ gameState, cardDeck, card3d, cardAnimator, board, pieces, pieceAnimator, bonusSpaces, hud, answerInput, scoreboard, resultScreen, celebration, audio, cardPicker }) {
    this.state = gameState;
    this.deck = cardDeck;
    this.card3d = card3d;
    this.cardAnimator = cardAnimator;
    this.board = board;
    this.pieces = pieces; // array of GamePiece, indexed by player id
    this.pieceAnimator = pieceAnimator;
    this.bonusSpaces = bonusSpaces;
    this.hud = hud;
    this.answerInput = answerInput;
    this.scoreboard = scoreboard;
    this.resultScreen = resultScreen;
    this.celebration = celebration;
    this.audio = audio;
    this.cardPicker = cardPicker;

    this.turnActive = false;
    this.paused = false;
    this._pauseResolve = null;

    this.setupControls();
  }

  // --- Pause / Restart Controls ---

  setupControls() {
    document.getElementById('pause-btn').addEventListener('click', () => this.pause());
    document.getElementById('restart-btn').addEventListener('click', () => this.confirmRestart());
    document.getElementById('resume-btn').addEventListener('click', () => this.resume());
    document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
    document.getElementById('reset-game-btn').addEventListener('click', () => this.resetAndClear());
  }

  showControls() {
    document.getElementById('game-controls').style.display = 'flex';
  }

  hideControls() {
    document.getElementById('game-controls').style.display = 'none';
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.state.paused = true;
    this.hud.stopTimer();
    document.getElementById('pause-screen').classList.add('visible');
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.state.paused = false;
    document.getElementById('pause-screen').classList.remove('visible');

    // If we were in answering phase, the turn promise is waiting — resolve to continue
    if (this._pauseResolve) {
      this._pauseResolve();
      this._pauseResolve = null;
    }
  }

  confirmRestart() {
    // Go to pause screen which has restart options
    this.pause();
  }

  newGame() {
    GameState.clearSave();
    window.location.reload();
  }

  resetAndClear() {
    GameState.clearSave();
    window.location.reload();
  }

  // Check if paused; if so, wait until resumed
  async waitIfPaused() {
    if (!this.paused) return;
    return new Promise(resolve => {
      this._pauseResolve = resolve;
    });
  }

  // Save state after meaningful changes
  saveState() {
    this.state.save();
  }

  // --- Game Flow ---

  async startGame() {
    this.state.phase = PHASES.DRAW;
    this.hud.show();
    this.showControls();
    this.hud.updateRound(this.state.round, this.state.maxRounds);
    this.scoreboard.init(this.state.players);

    // Animate pieces entering the board
    for (let i = 0; i < this.state.players.length; i++) {
      const startPos = this.board.path.getStartPosition(i);
      const offset = this.board.path.getPieceOffset(i);
      await this.pieceAnimator.animateEntry(this.pieces[i], {
        x: startPos.x + offset.x,
        y: startPos.y,
        z: startPos.z + offset.z,
      });
    }

    this.saveState();
    await delay(500);
    this.startTurn();
  }

  /**
   * Resume a saved game: place pieces at their saved positions and start turn.
   */
  async resumeGame() {
    this.state.phase = PHASES.DRAW;
    this.hud.show();
    this.showControls();
    this.hud.updateRound(this.state.round, this.state.maxRounds);
    this.scoreboard.init(this.state.players);
    this.scoreboard.update(this.state.players);

    // Place pieces at their saved positions
    for (let i = 0; i < this.state.players.length; i++) {
      const player = this.state.players[i];
      const offset = this.board.path.getPieceOffset(i);
      let pos;
      if (player.position === 0) {
        pos = this.board.path.getStartPosition(i);
      } else {
        pos = this.board.path.getPosition(player.position);
      }
      this.pieces[i].show({
        x: pos.x + offset.x,
        y: pos.y,
        z: pos.z + offset.z,
      });
    }

    await delay(300);
    this.startTurn();
  }

  async startTurn() {
    if (this.turnActive) return;
    await this.waitIfPaused();
    this.turnActive = true;

    const player = this.state.currentPlayer;
    this.hud.updateCurrentPlayer(player);

    // Show turn message — prompt to pick a card
    await this.showMessage(`${player.name}'s Turn!`, 'Pick a card!', 1500);
    await this.waitIfPaused();

    // Draw 3 cards from deck and show the picker
    this.state.phase = PHASES.PICK;
    const drawnCards = this.deck.drawCards(3);
    const { chosen, unchosen } = await this.cardPicker.show(drawnCards);

    // Return unchosen cards to the deck
    this.deck.returnCards(unchosen);
    this.audio.playCardPick();

    // Use the chosen card
    const card = chosen;
    this.state.currentCard = card;

    // Setup and animate card draw
    this.state.phase = PHASES.DRAW;
    this.card3d.setupCard(card.type, card.display);
    this.audio.playCardDraw();
    await this.cardAnimator.animateDraw();

    // Show card face briefly (+ or -)
    await this.showMessage(
      card.type === '+' ? 'Plus Card!' : 'Minus Card!',
      `Move to the next ${card.type} space`,
      1200
    );

    await this.waitIfPaused();

    // Flip card to show equation
    this.state.phase = PHASES.EQUATION;
    this.audio.playCardFlip();
    await this.cardAnimator.animateFlip();

    // Start answering phase
    this.state.phase = PHASES.ANSWERING;
    await this.startAnswerPhase(card);
  }

  startAnswerPhase(card) {
    return new Promise(resolve => {
      let answered = false;

      const finish = async (playerAnswer) => {
        if (answered) return;
        answered = true;
        this.hud.stopTimer();
        this.answerInput.hide();

        const correct = playerAnswer === card.answer;

        if (correct) {
          await this.handleCorrectAnswer(card);
        } else {
          await this.handleWrongAnswer(playerAnswer, card);
        }

        resolve();
      };

      // Show answer input
      this.answerInput.show(card.display, (answer) => {
        finish(answer);
      });

      // Start timer
      this.hud.startTimer(
        TIMER_SECONDS,
        (secondsLeft) => {
          if (secondsLeft <= 3) {
            this.audio.playUrgentTick();
          } else {
            this.audio.playTick();
          }
        },
        () => {
          // Timer ran out
          finish(null);
        }
      );
    });
  }

  async handleCorrectAnswer(card) {
    this.state.phase = PHASES.RESULT;
    this.audio.playCorrect();
    await this.cardAnimator.animateCorrect();
    this.celebration.burstSmall();

    await this.showMessage('Correct!', `${card.equation} = ${card.answer}`, 1200);

    // Move piece to next matching space
    this.state.phase = PHASES.MOVING;
    const player = this.state.currentPlayer;
    const currentPos = player.position;
    const targetPos = this.findNextMatchingSpace(currentPos, card.type);

    if (targetPos > currentPos) {
      this.audio.playHop();
      await this.pieceAnimator.animateMove(
        this.pieces[player.id],
        currentPos,
        targetPos,
        player.id
      );
      this.state.movePlayer(player.id, targetPos);

      // Add tally
      this.state.addTally(player.id);
      this.scoreboard.update(this.state.players);

      // Highlight landing space
      this.board.highlightSpace(targetPos);
      await delay(300);
      this.board.clearHighlight(targetPos);

      // Check bonus (pass pre-move position for anti-loop protection)
      await this.checkBonus(player, currentPos);
    }

    // Dismiss card
    await this.cardAnimator.animateDismiss();

    // Save after each turn completes
    this.saveState();

    // Check round end
    if (this.state.checkRoundEnd()) {
      await this.endRound();
      return;
    }

    // Next player
    this.state.nextPlayer();
    this.saveState();
    this.turnActive = false;
    this.startTurn();
  }

  async handleWrongAnswer(playerAnswer, card) {
    this.state.phase = PHASES.RESULT;
    this.audio.playWrong();

    const msg = playerAnswer === null ? "Time's up!" : 'Not quite!';
    await this.showMessage(msg, `The answer was ${card.answer}`, 1500);

    // Dismiss card
    await this.cardAnimator.animateDismiss();

    // Save after each turn
    this.saveState();

    // Check round end
    if (this.state.checkRoundEnd()) {
      await this.endRound();
      return;
    }

    // Next player
    this.state.nextPlayer();
    this.saveState();
    this.turnActive = false;
    this.startTurn();
  }

  async checkBonus(player, preMovePos) {
    const effect = this.bonusSpaces.getEffect(player.position);
    if (!effect) return;

    // Anti-loop: if the bonus would send the player back to where they came from, skip it
    if (effect.targetSpace === preMovePos) {
      this.state.phase = PHASES.BONUS;
      await this.showMessage('Bonus Space!', 'Safe! You stay here.', 1200);
      return;
    }

    this.state.phase = PHASES.BONUS;
    this.audio.playBonus();

    const dirLabel = effect.direction > 0 ? 'Forward' : 'Back';
    await this.showMessage(
      'Bonus Space!',
      `Move ${dirLabel} ${effect.amount === 99 ? 'to FINISH!' : effect.amount + ' spaces'}`,
      1200
    );

    if (effect.targetSpace !== player.position) {
      await this.pieceAnimator.animateMove(
        this.pieces[player.id],
        player.position,
        effect.targetSpace,
        player.id
      );
      this.state.movePlayer(player.id, effect.targetSpace);
    }
  }

  findNextMatchingSpace(currentPos, type) {
    for (let i = currentPos + 1; i <= TOTAL_SPACES; i++) {
      const space = SPACES[i];
      if (!space) continue;
      if (space.type === type) {
        return i;
      }
    }
    return Math.min(currentPos + 1, TOTAL_SPACES);
  }

  async endRound() {
    this.hud.hideTimer();
    this.answerInput.hide();
    this.state.endRound();

    if (this.state.finished) {
      // Game over — clear save
      GameState.clearSave();
      this.audio.playWin();
      this.celebration.burstBig();
      const winners = this.state.getWinners();

      await delay(500);
      this.hideControls();
      this.resultScreen.showGameOver(
        this.state.players,
        winners,
        () => this.newGame()
      );
    } else {
      this.saveState();
      // Round end, more rounds to go
      await delay(500);
      this.resultScreen.showRoundEnd(
        this.state.round - 1,
        this.state.players,
        () => this.startNextRound()
      );
    }
  }

  async startNextRound() {
    this.hud.updateRound(this.state.round, this.state.maxRounds);
    this.scoreboard.update(this.state.players);

    // Reset piece positions
    for (let i = 0; i < this.state.players.length; i++) {
      const startPos = this.board.path.getStartPosition(i);
      const offset = this.board.path.getPieceOffset(i);
      await this.pieceAnimator.animateEntry(this.pieces[i], {
        x: startPos.x + offset.x,
        y: startPos.y,
        z: startPos.z + offset.z,
      });
    }

    this.state.phase = PHASES.DRAW;
    this.saveState();
    this.turnActive = false;
    await delay(500);
    this.startTurn();
  }

  showMessage(text, subText, duration = 1500) {
    return new Promise(resolve => {
      const msgEl = document.getElementById('turn-message');
      const textEl = document.getElementById('turn-message-text');
      const subEl = document.getElementById('turn-sub-message');

      textEl.textContent = text;
      subEl.textContent = subText || '';
      msgEl.style.display = 'block';

      // Re-trigger animation
      textEl.style.animation = 'none';
      textEl.offsetHeight; // force reflow
      textEl.style.animation = 'messageAppear 0.4s ease-out';

      setTimeout(() => {
        msgEl.style.display = 'none';
        resolve();
      }, duration);
    });
  }
}
