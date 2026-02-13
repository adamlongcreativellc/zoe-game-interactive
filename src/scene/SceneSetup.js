import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneSetup {
  constructor(canvas) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2d1b4e);

    // Camera - looking down at the table at an angle
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 16, 10);
    this.camera.lookAt(0, 0, 0);

    // Orbit controls - limited so kids can't get lost
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2.5;
    this.controls.minPolarAngle = Math.PI / 6;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 25;
    this.controls.target.set(0, 0, 0);
    this.controls.enablePan = false;

    // Lighting - warm playroom feel
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 15, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.001;
    this.scene.add(mainLight);

    // Soft fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffe0f0, 0.3);
    fillLight.position.set(-5, 10, -5);
    this.scene.add(fillLight);

    // Point light for warmth
    const warmLight = new THREE.PointLight(0xffd93d, 0.3, 30);
    warmLight.position.set(0, 8, 0);
    this.scene.add(warmLight);

    // Resize handler
    window.addEventListener('resize', () => this.onResize());

    // Animation
    this.clock = new THREE.Clock();
    this.animationCallbacks = [];
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onAnimate(callback) {
    this.animationCallbacks.push(callback);
    // Return removal function
    return () => {
      const idx = this.animationCallbacks.indexOf(callback);
      if (idx >= 0) this.animationCallbacks.splice(idx, 1);
    };
  }

  start() {
    this.renderer.setAnimationLoop((/* timestamp */) => {
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();
      this.controls.update();
      for (const cb of this.animationCallbacks) {
        cb(delta, elapsed);
      }
      this.renderer.render(this.scene, this.camera);
    });
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.controls.dispose();
    this.scene.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of materials) {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        }
      }
    });
    this.renderer.dispose();
  }
}
