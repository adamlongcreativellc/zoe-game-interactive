import * as THREE from 'three';
import { CARD_PLUS_COLOR, CARD_MINUS_COLOR } from '../utils/constants.js';

export class Card3D {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.frontMaterial = null;
    this.backMaterial = null;
    this.isFlipped = false;
    this.build();
  }

  build() {
    // Card geometry - flat box, playing card proportions
    const cardGeo = new THREE.BoxGeometry(1.4, 0.03, 2.0);

    // Placeholder materials (will be updated per card draw)
    this.frontMaterial = new THREE.MeshStandardMaterial({
      color: CARD_PLUS_COLOR,
      roughness: 0.6,
      metalness: 0.05,
    });

    this.backMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.0,
    });

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
    });

    // Box has 6 faces: +x, -x, +y (top/front), -y (bottom/back), +z, -z
    const materials = [
      sideMat,           // right
      sideMat,           // left
      this.frontMaterial, // top (front of card - visible when face up)
      this.backMaterial,  // bottom (equation side)
      sideMat,           // front
      sideMat,           // back
    ];

    this.mesh = new THREE.Mesh(cardGeo, materials);
    this.mesh.castShadow = true;
    this.mesh.visible = false;

    // Card starts above and to the right of the board (deck position)
    this.deckPosition = new THREE.Vector3(7, 1, 4);
    this.centerPosition = new THREE.Vector3(0, 4, 2);
    this.mesh.position.copy(this.deckPosition);

    this.scene.add(this.mesh);
  }

  // Set card type and equation
  setupCard(type, equation) {
    this.isFlipped = false;
    this.mesh.rotation.set(0, 0, 0);

    // Front face: purple for +, blue for -
    const color = type === '+' ? CARD_PLUS_COLOR : CARD_MINUS_COLOR;
    this.frontMaterial.color.setHex(color);

    // Dispose old textures before creating new ones (prevent GPU memory leak)
    if (this.frontMaterial.map) this.frontMaterial.map.dispose();
    if (this.backMaterial.map) this.backMaterial.map.dispose();

    // Create front texture (+ or - symbol)
    const frontCanvas = this.createCardFace(type, color);
    const frontTex = new THREE.CanvasTexture(frontCanvas);
    this.frontMaterial.map = frontTex;
    this.frontMaterial.color.setHex(0xffffff);
    this.frontMaterial.needsUpdate = true;

    // Create back texture (equation)
    const backCanvas = this.createEquationFace(equation);
    const backTex = new THREE.CanvasTexture(backCanvas);
    this.backMaterial.map = backTex;
    this.backMaterial.needsUpdate = true;
  }

  createCardFace(type, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Background
    const hexStr = '#' + colorHex.toString(16).padStart(6, '0');
    ctx.fillStyle = hexStr;
    ctx.fillRect(0, 0, 256, 360);

    // Add some crayon-like texture
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
      const x = Math.random() * 256;
      const y = Math.random() * 360;
      ctx.fillRect(x, y, Math.random() * 20, Math.random() * 3);
    }
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 340);

    // Symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 140px Gaegu, cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type, 128, 180);

    return canvas;
  }

  createEquationFace(equation) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // White background with subtle paper texture
    ctx.fillStyle = '#fffef5';
    ctx.fillRect(0, 0, 256, 360);

    // Faint lines (like notebook paper)
    ctx.strokeStyle = 'rgba(100, 149, 237, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 40; y < 360; y += 30) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(236, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 348);

    // Equation text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 48px Gaegu, cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(equation, 128, 180);

    return canvas;
  }

  show() {
    this.mesh.visible = true;
    this.mesh.position.copy(this.deckPosition);
    this.mesh.rotation.set(0, 0, 0);
    this.isFlipped = false;
  }

  hide() {
    this.mesh.visible = false;
  }

  // Build a simple deck visual (stack of cards)
  buildDeck() {
    const deckGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const deckCardGeo = new THREE.BoxGeometry(1.4, 0.03, 2.0);
      const deckCardMat = new THREE.MeshStandardMaterial({
        color: 0x9b59b6,
        roughness: 0.6,
      });
      const deckCard = new THREE.Mesh(deckCardGeo, deckCardMat);
      deckCard.position.set(this.deckPosition.x, this.deckPosition.y + i * 0.035, this.deckPosition.z);
      deckCard.castShadow = true;
      deckGroup.add(deckCard);
    }
    this.scene.add(deckGroup);
    this.deckVisual = deckGroup;
  }
}
