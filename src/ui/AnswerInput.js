/**
 * Answer input area with number pad for kids.
 */
export class AnswerInput {
  constructor() {
    this.element = document.getElementById('answer-area');
    this.equationDisplay = document.getElementById('equation-display');
    this.answerDisplay = document.getElementById('answer-display');
    this.currentAnswer = '';
    this.onSubmit = null;
    this.active = false;

    this.setupButtons();
    this.setupKeyboard();
  }

  setupButtons() {
    const pad = document.getElementById('number-pad');
    pad.addEventListener('click', (e) => {
      if (!this.active) return;
      const btn = e.target.closest('.num-btn');
      if (!btn) return;

      if (btn.dataset.num !== undefined) {
        this.appendDigit(btn.dataset.num);
      } else if (btn.dataset.action === 'clear') {
        this.clearAnswer();
      } else if (btn.dataset.action === 'submit') {
        this.submitAnswer();
      }
    });
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!this.active) return;

      if (e.key >= '0' && e.key <= '9') {
        this.appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        this.backspace();
      } else if (e.key === 'Enter') {
        this.submitAnswer();
      }
    });
  }

  appendDigit(digit) {
    if (this.currentAnswer.length >= 3) return; // Max 3 digits
    this.currentAnswer += digit;
    this.answerDisplay.textContent = this.currentAnswer;
  }

  backspace() {
    this.currentAnswer = this.currentAnswer.slice(0, -1);
    this.answerDisplay.textContent = this.currentAnswer || '\u00A0';
  }

  clearAnswer() {
    this.currentAnswer = '';
    this.answerDisplay.textContent = '\u00A0';
  }

  submitAnswer() {
    if (!this.currentAnswer || !this.onSubmit) return;
    const answer = parseInt(this.currentAnswer, 10);
    this.onSubmit(answer);
  }

  show(equationText, onSubmit) {
    this.element.style.display = 'block';
    this.equationDisplay.textContent = equationText;
    this.clearAnswer();
    this.onSubmit = onSubmit;
    this.active = true;
  }

  hide() {
    this.element.style.display = 'none';
    this.active = false;
    this.onSubmit = null;
  }
}
