import * as THREE from 'three';
import { PLAYER_COLORS } from '../utils/constants.js';

export class GamePiece {
  constructor(scene, colorKey, playerIndex) {
    this.scene = scene;
    this.colorKey = colorKey;
    this.playerIndex = playerIndex;
    this.colorData = PLAYER_COLORS[colorKey];
    this.mesh = null;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.targetPos = null;
    this.visible = false;

    this.build();
  }

  build() {
    const group = new THREE.Group();

    // Main body - cylinder pawn shape
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.5, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.colorData.three,
      roughness: 0.4,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.25;
    body.castShadow = true;
    group.add(body);

    // Top sphere (pawn head)
    const headGeo = new THREE.SphereGeometry(0.2, 16, 12);
    const headMat = new THREE.MeshStandardMaterial({
      color: this.colorData.three,
      roughness: 0.3,
      metalness: 0.15,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.6;
    head.castShadow = true;
    group.add(head);

    // Base ring
    const baseGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: this.colorData.three,
      roughness: 0.5,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = Math.PI / 2;
    base.position.y = 0.02;
    group.add(base);

    group.visible = false;
    this.mesh = group;
    this.scene.add(group);
  }

  show(position) {
    this.mesh.visible = true;
    this.visible = true;
    this.mesh.position.set(position.x, position.y, position.z);
  }

  hide() {
    this.mesh.visible = false;
    this.visible = false;
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  // Idle bobbing animation
  updateBob(elapsed) {
    if (!this.visible) return;
    const bob = Math.sin(elapsed * 2 + this.bobOffset) * 0.03;
    this.mesh.position.y = 0.15 + bob;
  }
}
