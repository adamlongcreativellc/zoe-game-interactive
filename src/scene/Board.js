import * as THREE from 'three';
import { BoardPath } from './BoardPath.js';
import { SPACES, RAINBOW_COLORS, SPACE_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from '../utils/constants.js';
import { wobble } from '../utils/helpers.js';

export class Board {
  constructor(scene) {
    this.scene = scene;
    this.path = new BoardPath();
    this.spaceMeshes = [null]; // 1-indexed
    this.group = new THREE.Group();
    scene.add(this.group);

    this.buildTable();
    this.buildRainbowBackground();
    this.buildSpaces();
  }

  buildTable() {
    // Table surface - large rounded rectangle
    const tableGeo = new THREE.BoxGeometry(BOARD_WIDTH, 0.3, BOARD_HEIGHT, 1, 1, 1);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xfaf3e8,
      roughness: 0.8,
      metalness: 0.0,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.15;
    table.receiveShadow = true;
    this.group.add(table);

    // Paper sheet on top (slightly smaller, white-ish)
    const paperGeo = new THREE.BoxGeometry(BOARD_WIDTH - 0.5, 0.05, BOARD_HEIGHT - 0.5);
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfffef5,
      roughness: 0.9,
      metalness: 0.0,
    });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.y = 0.025;
    paper.receiveShadow = true;
    this.group.add(paper);
  }

  buildRainbowBackground() {
    // Create colored pencil rainbow stripes across the board
    const stripeCount = RAINBOW_COLORS.length;
    const stripeWidth = (BOARD_WIDTH - 1) / stripeCount;

    for (let i = 0; i < stripeCount; i++) {
      const stripeGeo = new THREE.PlaneGeometry(
        stripeWidth + 0.3,
        BOARD_HEIGHT - 1
      );
      const stripeMat = new THREE.MeshStandardMaterial({
        color: RAINBOW_COLORS[i],
        transparent: true,
        opacity: 0.12,
        roughness: 1.0,
        metalness: 0.0,
        side: THREE.DoubleSide,
      });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      const x = -((BOARD_WIDTH - 1) / 2) + stripeWidth * i + stripeWidth / 2;
      stripe.position.set(x, 0.06, 0);
      stripe.rotation.x = -Math.PI / 2;
      // Slight rotation for hand-drawn feel
      stripe.rotation.z = wobble(0.05);
      this.group.add(stripe);
    }
  }

  buildSpaces() {
    // Shared geometry and materials for all tiles (reduces GPU memory ~30x)
    this.sharedTileGeo = new THREE.BoxGeometry(SPACE_SIZE, 0.12, SPACE_SIZE);
    this.sharedMaterials = {
      bonus: new THREE.MeshStandardMaterial({ color: 0x6bcb77, roughness: 0.7, metalness: 0.05 }),
      plus: new THREE.MeshStandardMaterial({ color: 0xfff8e7, roughness: 0.7, metalness: 0.05 }),
      minus: new THREE.MeshStandardMaterial({ color: 0xf0f0ff, roughness: 0.7, metalness: 0.05 }),
    };
    this.canvasTextures = [];

    for (let i = 1; i <= 30; i++) {
      const space = SPACES[i];
      const pos = this.path.getPosition(i);

      const spaceGroup = new THREE.Group();
      spaceGroup.position.set(pos.x, pos.y, pos.z);

      // Pick shared material by space type
      let tileMat;
      if (space.bonus) {
        tileMat = this.sharedMaterials.bonus;
      } else if (space.type === '+') {
        tileMat = this.sharedMaterials.plus;
      } else {
        tileMat = this.sharedMaterials.minus;
      }

      const tile = new THREE.Mesh(this.sharedTileGeo, tileMat);
      tile.castShadow = true;
      tile.receiveShadow = true;
      spaceGroup.add(tile);

      // Border around tile
      const borderGeo = new THREE.EdgesGeometry(this.sharedTileGeo);
      const borderMat = new THREE.LineBasicMaterial({
        color: space.bonus ? 0x2d8a4e : 0x888888,
        linewidth: 1,
      });
      const border = new THREE.LineSegments(borderGeo, borderMat);
      spaceGroup.add(border);

      // Number text using canvas texture
      const numberCanvas = this.createTextCanvas(
        String(i),
        space.bonus ? '#fff' : '#444',
        64,
        'bold 38px Gaegu, cursive'
      );
      const numberTex = new THREE.CanvasTexture(numberCanvas);
      this.canvasTextures.push(numberTex);
      const numberMat = new THREE.MeshBasicMaterial({
        map: numberTex,
        transparent: true,
        depthWrite: false,
      });
      const numberGeo = new THREE.PlaneGeometry(0.5, 0.5);
      const numberMesh = new THREE.Mesh(numberGeo, numberMat);
      numberMesh.rotation.x = -Math.PI / 2;
      numberMesh.position.set(-0.25, 0.07, -0.25);
      spaceGroup.add(numberMesh);

      // +/- symbol on tile
      if (!space.bonus) {
        const symbol = space.type;
        const symbolCanvas = this.createTextCanvas(
          symbol,
          symbol === '+' ? '#9b59b6' : '#45b7d1',
          48,
          'bold 36px Gaegu, cursive'
        );
        const symbolTex = new THREE.CanvasTexture(symbolCanvas);
        this.canvasTextures.push(symbolTex);
        const symbolMat = new THREE.MeshBasicMaterial({
          map: symbolTex,
          transparent: true,
          depthWrite: false,
        });
        const symbolGeo = new THREE.PlaneGeometry(0.4, 0.4);
        const symbolMesh = new THREE.Mesh(symbolGeo, symbolMat);
        symbolMesh.rotation.x = -Math.PI / 2;
        symbolMesh.position.set(0.15, 0.07, 0.15);
        spaceGroup.add(symbolMesh);
      } else {
        // Bonus label — show arrow for direction, or 'WIN' for space 30
        const bonusLabel = space.num === 30 ? 'WIN' : (space.bonusDirection > 0 ? '\u2B06' : '\u2B07');
        const labelCanvas = this.createTextCanvas(
          bonusLabel,
          '#fff',
          64,
          'bold 28px Gaegu, cursive'
        );
        const labelTex = new THREE.CanvasTexture(labelCanvas);
        this.canvasTextures.push(labelTex);
        const labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthWrite: false,
        });
        const labelGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.rotation.x = -Math.PI / 2;
        labelMesh.position.set(0.15, 0.07, 0.15);
        spaceGroup.add(labelMesh);
      }

      this.group.add(spaceGroup);
      this.spaceMeshes.push(spaceGroup);
    }
  }

  createTextCanvas(text, color, size, font) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = color;
    ctx.font = font || `bold ${size * 0.6}px Gaegu, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    return canvas;
  }

  dispose() {
    for (const tex of this.canvasTextures) tex.dispose();
    this.sharedTileGeo.dispose();
    for (const mat of Object.values(this.sharedMaterials)) mat.dispose();
  }

  // Highlight a space (e.g., when a piece lands on it)
  highlightSpace(spaceNum, color = 0xffd93d) {
    if (spaceNum < 1 || spaceNum > 30) return;
    const mesh = this.spaceMeshes[spaceNum];
    if (!mesh) return;
    const tile = mesh.children[0];
    this._originalColor = tile.material.color.getHex();
    tile.material.emissive = new THREE.Color(color);
    tile.material.emissiveIntensity = 0.3;
  }

  clearHighlight(spaceNum) {
    if (spaceNum < 1 || spaceNum > 30) return;
    const mesh = this.spaceMeshes[spaceNum];
    if (!mesh) return;
    const tile = mesh.children[0];
    tile.material.emissiveIntensity = 0;
  }
}
