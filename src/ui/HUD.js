import { PLAYER_COLORS, TIMER_SECONDS } from '../utils/constants.js';

/**
 * Heads-up display: current player, timer, tally scoreboard.
 */
export class HUD {
  constructor() {
    this.element = document.getElementById('hud');
    this.playerDot = document.getElementById('hud-player-dot');
    this.playerName = document.getElementById('hud-player-name');
    this.roundDisplay = document.getElementById('hud-round');
    this.timerContainer = document.getElementById('timer-container');
    this.timerProgress = document.getElementById('timer-progress');
    this.timerText = document.getElementById('timer-text');
    this.tallyRows = document.getElementById('tally-rows');

    this.timerInterval = null;
    this.timeRemaining = TIMER_SECONDS;
    this.onTimerEnd = null;
    this.onTick = null;
  }

  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }

  updateCurrentPlayer(player) {
    const colorData = PLAYER_COLORS[player.color];
    this.playerDot.style.backgroundColor = colorData.hex;
    this.playerName.textContent = `${player.name}'s Turn`;
    // Always use white text for readability; the colored dot indicates the player
    this.playerName.style.color = '#fff';
  }

  updateRound(round, maxRounds) {
    this.roundDisplay.textContent = `Round ${round} of ${maxRounds}`;
  }

  buildTallyBoard(players) {
    this.tallyRows.innerHTML = '';
    players.forEach(player => {
      const row = document.createElement('div');
      row.className = 'tally-row';
      row.id = `tally-row-${player.id}`;

      const dot = document.createElement('div');
      dot.className = 'tally-dot';
      dot.style.backgroundColor = PLAYER_COLORS[player.color].hex;

      const name = document.createElement('span');
      name.className = 'tally-name';
      name.textContent = player.name;

      const marks = document.createElement('span');
      marks.className = 'tally-marks';
      marks.id = `tally-marks-${player.id}`;
      marks.textContent = '';

      row.appendChild(dot);
      row.appendChild(name);
      row.appendChild(marks);
      this.tallyRows.appendChild(row);
    });
  }

  updateTally(playerId, count) {
    const el = document.getElementById(`tally-marks-${playerId}`);
    if (el) {
      // Show tally marks as vertical bars: ||||
      el.textContent = '|'.repeat(count) || '0';
    }
  }

  // Timer
  startTimer(seconds, onTick, onEnd) {
    this.stopTimer();
    this.timeRemaining = seconds;
    this.onTimerEnd = onEnd;
    this.onTick = onTick;
    this.timerContainer.style.display = 'block';
    this.updateTimerDisplay();

    const circumference = 2 * Math.PI * 15.9;
    this.timerProgress.style.strokeDasharray = `${circumference} ${circumference}`;

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 0.1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.updateTimerDisplay();
        this.stopTimer();
        if (this.onTimerEnd) this.onTimerEnd();
        return;
      }
      this.updateTimerDisplay();

      // Tick sound at each whole second
      if (Math.abs(this.timeRemaining - Math.round(this.timeRemaining)) < 0.05) {
        if (this.onTick) this.onTick(Math.round(this.timeRemaining));
      }
    }, 100);
  }

  updateTimerDisplay() {
    const displayTime = Math.ceil(this.timeRemaining);
    this.timerText.textContent = displayTime;

    const circumference = 2 * Math.PI * 15.9;
    const progress = this.timeRemaining / TIMER_SECONDS;
    const offset = circumference * (1 - progress);
    this.timerProgress.style.strokeDashoffset = offset;

    const isWarning = this.timeRemaining <= 3;
    this.timerProgress.classList.toggle('warning', isWarning);
    this.timerText.classList.toggle('warning', isWarning);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  hideTimer() {
    this.stopTimer();
    this.timerContainer.style.display = 'none';
  }
}
