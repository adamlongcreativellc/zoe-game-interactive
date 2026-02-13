/**
 * DOM-based card picker overlay.
 * Shows 3 face-down cards for the player to choose from.
 * Returns a Promise that resolves with { chosen, unchosen }.
 */
export class CardPicker {
  constructor() {
    this.container = document.getElementById('card-picker');
  }

  /**
   * Display face-down cards and wait for the player to pick one.
   * @param {Array} cards - Array of card objects from CardDeck.drawCards()
   * @returns {Promise<{chosen: object, unchosen: Array}>}
   */
  show(cards) {
    return new Promise(resolve => {
      this.container.innerHTML = '';
      this.container.classList.add('visible');

      const cardEls = cards.map((card, index) => {
        const el = document.createElement('div');
        el.className = 'pick-card';
        el.textContent = '?';
        el.addEventListener('click', () => {
          // Prevent double-clicks
          if (el.classList.contains('picked')) return;

          // Mark chosen
          el.classList.add('picked');

          // Fade out others
          cardEls.forEach((otherEl, otherIndex) => {
            if (otherIndex !== index) {
              otherEl.classList.add('not-picked');
            }
          });

          // Resolve after a short delay for the animation
          setTimeout(() => {
            const unchosen = cards.filter((_, i) => i !== index);
            this.hide();
            resolve({ chosen: card, unchosen });
          }, 400);
        });

        this.container.appendChild(el);
        return el;
      });
    });
  }

  hide() {
    this.container.classList.remove('visible');
    this.container.innerHTML = '';
  }
}
