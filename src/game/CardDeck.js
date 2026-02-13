import { shuffleArray } from '../utils/helpers.js';
import { MathGenerator } from './MathGenerator.js';

/**
 * Manages the deck of cards.
 * 40 cards total: 20 plus, 20 minus.
 * Each card has a type (+/-) and an equation on the back.
 */
export class CardDeck {
  constructor() {
    this.mathGen = new MathGenerator();
    this.cards = [];
    this.currentIndex = 0;
    this.buildDeck();
  }

  buildDeck() {
    this.cards = [];

    // 20 plus cards
    for (let i = 0; i < 20; i++) {
      this.cards.push({ type: '+' });
    }

    // 20 minus cards
    for (let i = 0; i < 20; i++) {
      this.cards.push({ type: '-' });
    }

    shuffleArray(this.cards);
    this.currentIndex = 0;
  }

  drawCard() {
    if (this.currentIndex >= this.cards.length) {
      // Reshuffle when deck is exhausted
      this.buildDeck();
    }

    const card = this.cards[this.currentIndex];
    this.currentIndex++;

    // Generate equation matching the card type
    const equation = this.mathGen.generate(card.type);

    return {
      type: card.type,
      equation: equation.equation,
      display: equation.display,
      answer: equation.answer,
    };
  }

  drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      drawn.push(this.drawCard());
    }
    return drawn;
  }

  returnCards(cards) {
    // Insert un-picked card types back after currentIndex
    for (const card of cards) {
      this.cards.splice(this.currentIndex, 0, { type: card.type });
    }
    // Shuffle the remaining portion (from currentIndex onward) to maintain randomness
    const remaining = this.cards.splice(this.currentIndex);
    shuffleArray(remaining);
    this.cards.push(...remaining);
  }

  get remaining() {
    return this.cards.length - this.currentIndex;
  }
}
