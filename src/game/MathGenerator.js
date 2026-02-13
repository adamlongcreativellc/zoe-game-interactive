/**
 * Generates age-appropriate math equations for The Rainbow Doozer.
 * Targets ages 5-8 (Zoe's examples: "2 + 2 = ?").
 */
export class MathGenerator {
  generateAddition() {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    return {
      equation: `${a} + ${b}`,
      display: `${a} + ${b} = ?`,
      answer: a + b,
      type: '+',
    };
  }

  generateSubtraction() {
    // Ensure result is always positive
    let a = Math.floor(Math.random() * 9) + 2; // 2-10
    let b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to (a-1)
    return {
      equation: `${a} - ${b}`,
      display: `${a} - ${b} = ?`,
      answer: a - b,
      type: '-',
    };
  }

  generate(type) {
    if (type === '+') return this.generateAddition();
    return this.generateSubtraction();
  }
}
