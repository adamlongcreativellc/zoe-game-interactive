import { PLAYER_COLORS } from '../utils/constants.js';

/**
 * Displays round end and final game results.
 */
export class ResultScreen {
  constructor() {
    this.element = document.getElementById('result-screen');
    this.title = document.getElementById('result-title');
    this.subtitle = document.getElementById('result-subtitle');
    this.scores = document.getElementById('result-scores');
    this.button = document.getElementById('result-btn');
  }

  showRoundEnd(round, players, onContinue) {
    this.title.textContent = `Round ${round} Complete!`;
    this.subtitle.textContent = 'Here are the scores so far...';
    this.button.textContent = 'Next Round';
    this.button.onclick = () => {
      this.hide();
      onContinue();
    };
    this.renderScores(players, false);
    this.element.style.display = 'flex';
  }

  showGameOver(players, winners, onRestart) {
    if (winners.length === 1) {
      this.title.textContent = `${winners[0].name} Wins!`;
    } else {
      this.title.textContent = "It's a Tie!";
    }
    this.subtitle.textContent = 'Final Scores';
    this.button.textContent = 'Play Again';
    this.button.onclick = () => {
      this.hide();
      onRestart();
    };
    this.renderScores(players, true, winners);
    this.element.style.display = 'flex';
  }

  renderScores(players, showWinner, winners = []) {
    this.scores.innerHTML = '';
    const winnerIds = new Set(winners.map(w => w.id));

    players.forEach(player => {
      const div = document.createElement('div');
      div.className = 'result-player';
      const isWinner = winnerIds.has(player.id);

      if (showWinner && isWinner) {
        div.classList.add('winner');
      }

      div.style.borderColor = PLAYER_COLORS[player.color].hex;

      let html = '';
      if (showWinner && isWinner) {
        html += '<div class="result-crown">\u{1F451}</div>';
      }
      html += `<div class="result-player-name" style="color: ${PLAYER_COLORS[player.color].hex}">${player.name}</div>`;
      html += `<div class="result-player-score">${player.tallies}</div>`;
      html += `<div style="color: #999; font-size: 1rem;">${player.team === 'girl' ? 'Girl' : 'Boy'} Team</div>`;
      div.innerHTML = html;
      this.scores.appendChild(div);
    });
  }

  hide() {
    this.element.style.display = 'none';
  }
}
