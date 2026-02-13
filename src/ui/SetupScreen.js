import { COLOR_ORDER, PLAYER_COLORS } from '../utils/constants.js';

/**
 * Manages the player setup / game start screen.
 */
export class SetupScreen {
  constructor(onStart) {
    this.onStart = onStart;
    this.element = document.getElementById('setup-screen');
    this.playerCount = 0;
    this.roundCount = 1;
    this.playerConfigs = [];
    this.takenColors = new Set();

    this.setupCountButtons();
    this.setupRoundButtons();
    this.setupStartButton();
  }

  setupCountButtons() {
    const buttons = this.element.querySelectorAll('.player-count-buttons .count-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playerCount = parseInt(btn.dataset.count);
        this.buildPlayerConfigs(this.playerCount);
      });
    });
  }

  setupRoundButtons() {
    const buttons = this.element.querySelectorAll('.round-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.roundCount = parseInt(btn.dataset.rounds);
      });
    });
  }

  buildPlayerConfigs(count) {
    const container = document.getElementById('player-configs');
    container.innerHTML = '';
    this.playerConfigs = [];
    this.takenColors = new Set();

    for (let i = 0; i < count; i++) {
      const config = this.createPlayerConfig(i);
      container.appendChild(config.element);
      this.playerConfigs.push(config);
    }

    this.validateStart();
  }

  createPlayerConfig(index) {
    const div = document.createElement('div');
    div.className = 'player-config';
    div.style.setProperty('--player-color', '#888');
    div.style.setProperty('--player-color-glow', 'rgba(136,136,136,0.2)');

    const config = {
      element: div,
      name: '',
      color: null,
      team: null,
      index,
    };

    // Name input
    const nameLabel = document.createElement('label');
    nameLabel.textContent = `Player ${index + 1}`;
    div.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter name...';
    nameInput.maxLength = 12;
    nameInput.addEventListener('input', () => {
      config.name = nameInput.value.trim();
      this.validateStart();
    });
    div.appendChild(nameInput);

    // Color selection
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-options';
    COLOR_ORDER.forEach(colorKey => {
      const btn = document.createElement('button');
      btn.className = 'color-btn';
      btn.style.backgroundColor = PLAYER_COLORS[colorKey].hex;
      btn.dataset.color = colorKey;

      btn.addEventListener('click', () => {
        if (this.takenColors.has(colorKey) && config.color !== colorKey) return;

        // Deselect previous
        if (config.color) {
          this.takenColors.delete(config.color);
        }

        config.color = colorKey;
        this.takenColors.add(colorKey);

        div.style.setProperty('--player-color', PLAYER_COLORS[colorKey].hex);
        div.style.setProperty('--player-color-glow', PLAYER_COLORS[colorKey].glow);
        div.classList.add('active');

        this.updateColorButtons();
        this.validateStart();
      });

      colorDiv.appendChild(btn);
    });
    div.appendChild(colorDiv);

    // Team selection (Girl/Boy)
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team-options';
    ['Girl', 'Boy'].forEach(team => {
      const btn = document.createElement('button');
      btn.className = 'team-btn';
      btn.textContent = team;
      btn.addEventListener('click', () => {
        config.team = team.toLowerCase();
        teamDiv.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.validateStart();
      });
      teamDiv.appendChild(btn);
    });
    div.appendChild(teamDiv);

    return config;
  }

  updateColorButtons() {
    this.playerConfigs.forEach(config => {
      const buttons = config.element.querySelectorAll('.color-btn');
      buttons.forEach(btn => {
        const colorKey = btn.dataset.color;
        btn.classList.remove('selected', 'taken');
        if (config.color === colorKey) {
          btn.classList.add('selected');
        } else if (this.takenColors.has(colorKey)) {
          btn.classList.add('taken');
        }
      });
    });
  }

  validateStart() {
    const startBtn = document.getElementById('start-btn');
    const allValid = this.playerConfigs.every(
      c => c.name && c.color && c.team
    );
    startBtn.disabled = !allValid;
  }

  setupStartButton() {
    document.getElementById('start-btn').addEventListener('click', () => {
      if (this.playerConfigs.every(c => c.name && c.color && c.team)) {
        const players = this.playerConfigs.map(c => ({
          name: c.name,
          color: c.color,
          team: c.team,
        }));
        this.hide();
        this.onStart(players, this.roundCount);
      }
    });
  }

  show() {
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
