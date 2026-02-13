import * as THREE from 'three';
import { easeInOutCubic, easeOutBack } from '../utils/helpers.js';
import { CARD_DRAW_DURATION, CARD_FLIP_DURATION } from '../utils/constants.js';

/**
 * Handles card draw and flip animations.
 */
export class CardAnimator {
  constructor(card3d) {
    this.card = card3d;
  }

  /**
   * Animate card rising from deck to center of view.
   */
  animateDraw() {
    return new Promise(resolve => {
      const card = this.card.mesh;
      card.visible = true;

      const startPos = this.card.deckPosition.clone();
      const endPos = this.card.centerPosition.clone();
      card.position.copy(startPos);
      card.rotation.set(0, 0, 0);

      const startTime = performance.now();
      const duration = CARD_DRAW_DURATION;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutBack(t);

        card.position.lerpVectors(startPos, endPos, eased);
        // Slight wobble during draw
        card.rotation.z = Math.sin(t * Math.PI * 2) * 0.05 * (1 - t);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          card.position.copy(endPos);
          card.rotation.z = 0;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Animate card flipping 180 degrees to reveal equation.
   */
  animateFlip() {
    return new Promise(resolve => {
      const card = this.card.mesh;
      const startTime = performance.now();
      const duration = CARD_FLIP_DURATION;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);

        // Rotate 180 degrees around X axis to show the back
        card.rotation.x = Math.PI * eased;

        // Slight scale effect during flip
        const scale = 1 + Math.sin(t * Math.PI) * 0.1;
        card.scale.set(scale, scale, scale);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          card.rotation.x = Math.PI;
          card.scale.set(1, 1, 1);
          this.card.isFlipped = true;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Animate card floating away (dismiss).
   */
  animateDismiss() {
    return new Promise(resolve => {
      const card = this.card.mesh;
      const startPos = card.position.clone();
      const endPos = new THREE.Vector3(startPos.x, startPos.y + 3, startPos.z - 2);

      const startTime = performance.now();
      const duration = 500;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);

        card.position.lerpVectors(startPos, endPos, eased);
        card.material && (card.material.opacity = 1 - eased);

        // Fade out by scaling down
        const s = 1 - eased * 0.5;
        card.scale.set(s, s, s);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          card.visible = false;
          card.scale.set(1, 1, 1);
          card.position.copy(this.card.deckPosition);
          card.rotation.set(0, 0, 0);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Animate card glowing green for correct answer.
   */
  animateCorrect() {
    return new Promise(resolve => {
      const card = this.card.mesh;
      const startTime = performance.now();
      const duration = 600;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Pulse green glow
        const pulse = Math.sin(t * Math.PI * 3) * 0.5 + 0.5;
        if (card.material && card.material.length) {
          card.material[2].emissive = new THREE.Color(0x6bcb77);
          card.material[2].emissiveIntensity = pulse * 0.5;
        }

        const scale = 1 + Math.sin(t * Math.PI) * 0.15;
        card.scale.set(scale, scale, scale);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          if (card.material && card.material.length) {
            card.material[2].emissiveIntensity = 0;
          }
          card.scale.set(1, 1, 1);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}
