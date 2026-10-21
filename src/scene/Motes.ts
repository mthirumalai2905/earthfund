interface Mote {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
}

/** Soft floating particles over the ecosystem imagery; nearer motes travel faster with scroll. */
export class Motes {
  private ctx: CanvasRenderingContext2D;
  private motes: Mote[] = [];
  private sprite: HTMLCanvasElement;
  private w = 0;
  private h = 0;
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement, private count: number) {
    this.ctx = canvas.getContext("2d")!;
    this.sprite = document.createElement("canvas");
    this.sprite.width = this.sprite.height = 64;
    const s = this.sprite.getContext("2d")!;
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(246,248,252,1)");
    g.addColorStop(0.35, "rgba(210,218,232,0.35)");
    g.addColorStop(1, "rgba(200,210,228,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);
  }

  resize(w: number, h: number) {
    this.dpr = Math.min(window.devicePixelRatio, 1.5);
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    if (!this.motes.length) {
      for (let i = 0; i < this.count; i++) {
        const z = 0.2 + Math.random() * 0.8;
        this.motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 2 + z * z * 9,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  update(time: number, scrollDelta: number, opacity: number) {
    const { ctx, w, h } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (opacity <= 0.001) return;
    ctx.globalCompositeOperation = "lighter";
    for (const m of this.motes) {
      m.y -= scrollDelta * m.z * 0.35 + 0.12 * m.z;
      m.x += Math.sin(time * 0.3 + m.phase) * 0.15 * m.z;
      if (m.y < -20) m.y += h + 40;
      if (m.y > h + 20) m.y -= h + 40;
      if (m.x < -20) m.x += w + 40;
      if (m.x > w + 20) m.x -= w + 40;
      const flicker = 0.7 + 0.3 * Math.sin(time * 0.8 + m.phase * 3);
      ctx.globalAlpha = opacity * (0.08 + 0.32 * m.z) * flicker;
      const d = m.r * 2;
      ctx.drawImage(this.sprite, m.x - m.r, m.y - m.r, d, d);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}
