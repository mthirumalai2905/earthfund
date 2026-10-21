import * as THREE from "three";
import {
  atmosphereFragment,
  atmosphereVertex,
  cloudFragment,
  earthFragment,
  fogFragment,
  fullscreenVertex,
  starsFragment,
  starsVertex,
  surfaceVertex,
} from "./shaders";

export type Tier = "high" | "low";

export interface SceneState {
  camDist: number;
  lookY: number;
  earthX: number;
  earthY: number;
  spin: number;
  sun: THREE.Vector3;
  fog: number;
  travel: number;
  exposure: number;
  starSpin: number;
}

export function createSceneState(): SceneState {
  return {
    camDist: 3.4,
    lookY: 0,
    earthX: 0,
    earthY: -1.05,
    spin: 0,
    sun: new THREE.Vector3(1, 0.25, -0.45).normalize(),
    fog: 0,
    travel: 0,
    exposure: 1,
    starSpin: 0,
  };
}

const AXIAL_TILT = 0.41;
const TEXTURE_WIDTH: Record<Tier, number> = { high: 4096, low: 2048 };
const TEXTURE_SUFFIX: Record<Tier, string> = { high: "4k", low: "2k" };
const MAX_PIXEL_RATIO: Record<Tier, number> = { high: 1.75, low: 1 };
const CLOUD_RADIUS = 1.012;
const ATMOSPHERE_RADIUS = 1.075;

export class EarthScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.01, 400);
  private fogScene = new THREE.Scene();
  private fogCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private planet = new THREE.Group();
  private spinGroup = new THREE.Group();
  private clouds: THREE.Mesh;
  private stars: THREE.Points;
  private sunSprite: THREE.Sprite;
  private disposables: { dispose(): void }[] = [];
  private ready = 0;
  private loaded = false;
  private width = 1;
  private height = 1;
  private pixelRatio: number;
  private frameAvg = 16.7;
  private frameCount = 0;
  private lastFrame = 0;
  private earthMat: THREE.ShaderMaterial;
  private cloudMat: THREE.ShaderMaterial;
  private atmoMat: THREE.ShaderMaterial;
  private starMat: THREE.ShaderMaterial;
  private fogMat: THREE.ShaderMaterial;
  private lookTarget = new THREE.Vector3();
  private baseVTan = Math.tan(THREE.MathUtils.degToRad(35 / 2));

  constructor(canvas: HTMLCanvasElement, private tier: Tier) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier === "high",
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x020306, 1);
    this.renderer.autoClear = false;
    this.pixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO[tier]);
    this.renderer.setPixelRatio(this.pixelRatio);

    const [albedo, data] = this.loadMaps();

    const segments = tier === "high" ? 192 : 96;
    const sphere = new THREE.SphereGeometry(1, segments, segments / 2);
    const cloudSphere = new THREE.SphereGeometry(CLOUD_RADIUS, segments, segments / 2);
    const atmoSphere = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 96, 48);
    this.disposables.push(sphere, cloudSphere, atmoSphere);

    const sun = { value: new THREE.Vector3(1, 0.2, -0.4).normalize() };
    const exposure = { value: 0 };

    this.earthMat = new THREE.ShaderMaterial({
      vertexShader: surfaceVertex,
      fragmentShader: earthFragment,
      uniforms: {
        uAlbedo: { value: albedo },
        uData: { value: data },
        uSunDir: sun,
        uExposure: exposure,
        uTexel: { value: new THREE.Vector2(1 / TEXTURE_WIDTH[tier], 2 / TEXTURE_WIDTH[tier]) },
        uRelief: { value: TEXTURE_WIDTH[tier] / 400 },
        uCloudShift: { value: 0 },
      },
    });
    this.cloudMat = new THREE.ShaderMaterial({
      vertexShader: surfaceVertex,
      fragmentShader: cloudFragment,
      uniforms: { uData: { value: data }, uSunDir: sun, uExposure: exposure },
      transparent: true,
      depthWrite: false,
    });
    this.atmoMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      uniforms: { uSunDir: sun, uExposure: exposure },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.disposables.push(this.earthMat, this.cloudMat, this.atmoMat);

    const earth = new THREE.Mesh(sphere, this.earthMat);
    this.clouds = new THREE.Mesh(cloudSphere, this.cloudMat);
    const atmosphere = new THREE.Mesh(atmoSphere, this.atmoMat);
    this.spinGroup.add(earth, this.clouds);
    const tilt = new THREE.Group();
    tilt.rotation.z = AXIAL_TILT;
    tilt.add(this.spinGroup);
    this.planet.add(tilt, atmosphere);
    this.scene.add(this.planet);

    this.starMat = new THREE.ShaderMaterial({
      vertexShader: starsVertex,
      fragmentShader: starsFragment,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uOpacity: { value: 0 } },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.stars = this.createStars(tier === "high" ? 5200 : 1800);
    this.scene.add(this.stars);

    this.sunSprite = this.createSun();
    this.scene.add(this.sunSprite);

    this.fogMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader: fogFragment,
      defines: { FOG_OCTAVES: tier === "high" ? 4 : 3 },
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uOpacity: { value: 0 },
        uTravel: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.PlaneGeometry(2, 2);
    this.fogScene.add(new THREE.Mesh(quad, this.fogMat));
    this.disposables.push(quad, this.fogMat, this.starMat);
  }

  /** Real planetary maps; the planet fades in once both have uploaded. */
  private loadMaps(): THREE.Texture[] {
    const loader = new THREE.TextureLoader();
    const suffix = TEXTURE_SUFFIX[this.tier];
    const aniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    let pending = 2;
    const textures = ["earth-albedo", "earth-data"].map((name) => {
      const tex = loader.load(`/textures/${name}-${suffix}.jpg`, () => {
        this.renderer.initTexture(tex);
        if (--pending === 0) this.loaded = true;
      });
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = aniso;
      this.disposables.push(tex);
      return tex;
    });
    return textures;
  }

  private createStars(count: number): THREE.Points {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const band = new THREE.Vector3(0.3, 1, 0.2).normalize();
    const v = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      // Pull a share of stars toward a great circle to suggest the galactic plane.
      if (i % 3 === 0) {
        const d = v.dot(band);
        tmp.copy(band).multiplyScalar(d * 0.85);
        v.sub(tmp).normalize();
      }
      v.multiplyScalar(120 + Math.random() * 120);
      positions.set([v.x, v.y, v.z], i * 3);
      const bright = Math.random();
      sizes[i] = bright > 0.985 ? 5 + Math.random() * 3 : 1.2 + Math.pow(Math.random(), 3) * 3;
      phases[i] = Math.random();
      const tint = Math.random();
      const c = tint > 0.85 ? [0.86, 0.9, 1] : [0.94, 0.95, 0.97];
      const k = 0.35 + bright * 0.65;
      colors.set([c[0] * k, c[1] * k, c[2] * k], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    this.disposables.push(geo);
    return new THREE.Points(geo, this.starMat);
  }

  private createSun(): THREE.Sprite {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.06, "rgba(236,240,248,0.85)");
    g.addColorStop(0.22, "rgba(200,208,224,0.18)");
    g.addColorStop(1, "rgba(190,200,220,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
    this.disposables.push(tex, mat);
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(60);
    return sprite;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    // Keep the planet framed on portrait screens by widening the vertical field of view.
    const vTan = aspect < 1 ? this.baseVTan / Math.pow(aspect, 0.8) : this.baseVTan;
    this.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(vTan));
    this.camera.updateProjectionMatrix();
    const pr = this.renderer.getPixelRatio();
    this.fogMat.uniforms.uRes.value.set(width * pr, height * pr);
  }

  /** Steps the pixel ratio down when frames run long so scrolling stays fluid. */
  private adaptResolution() {
    const now = performance.now();
    const dt = now - this.lastFrame;
    this.lastFrame = now;
    if (dt <= 0 || dt > 100) return;
    this.frameAvg += (dt - this.frameAvg) * 0.05;
    if (++this.frameCount < 90 || this.frameAvg < 21 || this.pixelRatio <= 1) return;
    this.pixelRatio = Math.max(1, this.pixelRatio - 0.25);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.starMat.uniforms.uPixelRatio.value = this.pixelRatio;
    this.resize(this.width, this.height);
    this.frameCount = 0;
    this.frameAvg = 16.7;
  }

  render(state: SceneState, time: number) {
    this.adaptResolution();
    if (this.loaded && this.ready < 1) this.ready = Math.min(1, this.ready + 0.02);
    const reveal = this.ready * this.ready * (3 - 2 * this.ready);
    this.planet.visible = reveal > 0;

    const u = this.earthMat.uniforms;
    u.uSunDir.value.copy(state.sun).normalize();
    u.uExposure.value = state.exposure * reveal;
    this.starMat.uniforms.uTime.value = time;
    this.starMat.uniforms.uOpacity.value = Math.min(1, state.exposure * 1.2);

    this.planet.position.set(state.earthX, state.earthY, 0);
    this.spinGroup.rotation.y = state.spin;
    this.clouds.rotation.y = state.spin * 0.08 + time * 0.004;
    u.uCloudShift.value = this.clouds.rotation.y / (Math.PI * 2);
    this.stars.rotation.y = state.starSpin;

    this.camera.position.set(0, 0, state.camDist);
    this.lookTarget.set(0, state.lookY, 0);
    this.camera.lookAt(this.lookTarget);

    this.sunSprite.position.copy(state.sun).normalize().multiplyScalar(150);
    (this.sunSprite.material as THREE.SpriteMaterial).opacity = Math.min(1, state.exposure);

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    if (state.fog > 0.001) {
      const f = this.fogMat.uniforms;
      f.uOpacity.value = state.fog;
      f.uTravel.value = state.travel;
      f.uTime.value = time;
      this.renderer.render(this.fogScene, this.fogCamera);
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
