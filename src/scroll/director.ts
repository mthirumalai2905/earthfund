import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import { chapters, type ChapterId } from "@/content/site";
import { createSceneState, type EarthScene } from "@/scene/EarthScene";
import type { Capabilities } from "@/scene/capabilities";
import type { Motes } from "@/scene/Motes";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const ease = (v: number, a: number, b: number) => smooth(range(v, a, b));
const easeOut = (v: number, a: number, b: number) => 1 - Math.pow(1 - range(v, a, b), 2.2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUN_OPENING = new THREE.Vector3(1, 0.22, -0.5).normalize();
const SUN_MISSION = new THREE.Vector3(0.75, 0.3, 0.6).normalize();
const SUN_ENTRY = new THREE.Vector3(0.45, 0.75, -0.35).normalize();
const SUN_CLOSING = new THREE.Vector3(0.85, 0.25, 0.55).normalize();

interface WindowEl {
  el: HTMLElement;
  section: ChapterId;
  a: number;
  b: number;
  drift: number;
}

interface Options {
  scene: EarthScene | null;
  motes: Motes | null;
  caps: Capabilities;
}

/**
 * One ticker drives everything: each chapter section reports its scroll progress and this
 * maps those values onto the 3D camera, image layers and overlay copy.
 */
export function createDirector(root: HTMLElement, { scene, motes, caps }: Options) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const motion = caps.reducedMotion ? 0 : 1;
  const lenis = motion
    ? new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, touchMultiplier: 1.1, smoothWheel: true, anchors: true })
    : null;
  const lenisRaf = (time: number) => lenis?.raf(time * 1000);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
  }

  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T & HTMLElement>(sel);
  const qa = <T extends Element = HTMLElement>(sel: string) =>
    Array.from(root.querySelectorAll<T & HTMLElement>(sel));

  const P = Object.fromEntries(chapters.map((c) => [c.id, 0])) as Record<ChapterId, number>;
  // Eased copy of P: removes any stepping from native touch scroll or wheel bursts.
  const S = { ...P };
  let settled = false;
  const triggers: ScrollTrigger[] = [];

  const railLinks = qa<HTMLAnchorElement>("[data-rail-link]");
  const setActive = (id: ChapterId) => {
    railLinks.forEach((a) => {
      const on = a.dataset.railLink === id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
  };

  for (const { id } of chapters) {
    const el = q(`#${id}`);
    if (!el) continue;
    const pinned = el.dataset.pinned === "true";
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: pinned ? "top top" : "top bottom",
        end: pinned ? "bottom bottom" : "bottom top",
        onUpdate: (s) => (P[id] = s.progress),
        onRefresh: (s) => (P[id] = s.progress),
      }),
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (s) => s.isActive && setActive(id),
      }),
    );
  }

  const windows: WindowEl[] = qa("[data-window]").map((el) => {
    const [a, b] = (el.dataset.window ?? "0,1").split(",").map(Number);
    const section = (el.closest("section[id]")?.id ?? "opening") as ChapterId;
    return { el, section, a, b, drift: Number(el.dataset.drift ?? 40) };
  });

  // Scrubbed reveals for the editorial sections.
  const ctx = gsap.context(() => {
    qa("[data-rise]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 70 * motion, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 94%", end: "top 62%", scrub: motion ? 0.6 : true },
        },
      );
    });
  }, root);

  const canvasWrap = q("[data-el=canvas]");
  const fallback = q("[data-el=fallback]");
  const fallbackFog = q("[data-el=fallback-fog]");
  const layers = qa("[data-layer]");
  const scrim = q("[data-el=scrim]");
  const motesEl = q("[data-el=motes]");
  const rings = qa<SVGCircleElement>("[data-ring]");
  const ringNodes = qa<SVGGElement>("[data-ring-node]");
  const processFill = q("[data-process-fill]");
  const processSteps = qa("[data-process-step]");
  const focusTrack = q("[data-el=focus-track]");
  const focusImages = qa("[data-focus-image]");
  const railFill = q("[data-el=rail-fill]");
  const barFill = q("[data-el=bar-fill]");
  const header = q("[data-el=header]");
  const desktop = window.matchMedia("(min-width: 900px)");

  const state = createSceneState();
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let focusMax = 0;
  let scrollMax = 1;
  let focusCenters: number[] = [];
  const measure = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    scene?.resize(vw, vh);
    motes?.resize(vw, vh);
    scrollMax = Math.max(1, document.documentElement.scrollHeight - vh);
    if (focusTrack) {
      const prev = focusTrack.style.transform;
      focusTrack.style.transform = "";
      focusMax = desktop.matches ? Math.max(0, focusTrack.scrollWidth - vw) : 0;
      focusCenters = focusImages.map((img) => {
        const r = img.parentElement!.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      if (desktop.matches) focusTrack.style.transform = prev;
    }
  };
  measure();
  const onResize = () => {
    measure();
    ScrollTrigger.refresh();
  };
  window.addEventListener("resize", onResize);
  ScrollTrigger.addEventListener("refresh", measure);

  const start = performance.now();
  let lastScroll = window.scrollY;
  let lastActive = "";

  const tick = (time: number, deltaMs: number) => {
    const k = !settled || !motion ? 1 : 1 - Math.exp(-Math.min(deltaMs, 50) / 1000 * 9);
    for (const { id } of chapters) {
      const d = P[id] - S[id];
      S[id] = Math.abs(d) < 1e-5 ? P[id] : S[id] + d * k;
    }
    settled = true;
    const o = S.opening, m = S.mission, at = S.atmosphere, eco = S.ecosystems;
    const imp = S.impact, ap = S.approach, fo = S.focus, ct = S.contact;
    const elapsed = (performance.now() - start) / 1000;
    const intro = motion ? smooth(range(elapsed, 0.25, 3.6)) : 1;
    const aspect = vw / vh;
    const side = clamp01((aspect - 0.85) / 0.6);
    const timeSpin = motion ? time * 0.01 : 0;

    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;

    // ---- Camera path -------------------------------------------------------------
    const closing = imp > 0.5;
    let canvasOpacity: number;
    if (!closing) {
      const eo = ease(o, 0, 1), em = ease(m, 0, 0.9);
      state.camDist = lerp(lerp(lerp(3.45, 3.05, eo), 2.4, em), 1.17, easeOut(at, 0.02, 1));
      state.earthY = lerp(lerp(lerp(-1.32, -1.15, intro), -0.78, eo), 0, em);
      state.earthX = lerp(lerp(0, 0.6 * side, em), 0, ease(at, 0, 0.45));
      state.lookY = lerp(0, 1.2, ease(at, 0.12, 1));
      state.sun.copy(SUN_OPENING).lerp(SUN_MISSION, em).lerp(SUN_ENTRY, ease(at, 0.15, 1));
      state.spin = -1.75 + timeSpin + o * 0.15 + m * 0.6 + at * 0.45;
      state.fog = ease(at, 0.5, 0.93);
      state.travel = at * 1.7;
      state.starSpin = (o + m + at) * 0.1 + pointer.sx * 0.01 * motion;
      canvasOpacity = 1 - ease(at, 0.9, 1);
    } else {
      const ec = easeOut(ct, 0, 0.8);
      state.camDist = lerp(1.3, 3.7, ec);
      state.earthY = lerp(0, 0.3, ec);
      state.earthX = 0;
      state.lookY = lerp(0.95, 0, ease(ct, 0, 0.7));
      state.sun.copy(SUN_CLOSING);
      state.spin = 4.2 + timeSpin + ct * 0.9;
      state.fog = 0;
      state.travel = 0;
      state.starSpin = 0.4 + ct * 0.12 + pointer.sx * 0.01 * motion;
      canvasOpacity = ease(ct, 0, 0.22);
    }
    state.exposure = intro;

    if (canvasWrap) canvasWrap.style.opacity = canvasOpacity.toFixed(3);
    if (scene && canvasOpacity > 0.003) scene.render(state, time);
    if (!scene && fallback) {
      const s = 3.1 / state.camDist;
      fallback.style.opacity = canvasOpacity.toFixed(3);
      fallback.style.setProperty("--earth-x", `${state.earthX * 24}vw`);
      fallback.style.setProperty("--earth-y", `${-state.earthY * 40 + state.lookY * 30}vh`);
      fallback.style.setProperty("--earth-s", s.toFixed(3));
      if (fallbackFog) fallbackFog.style.opacity = state.fog.toFixed(3);
    }

    // ---- Ecosystem image layers -------------------------------------------------------
    const n = layers.length;
    const entry = clamp01(range(at, 0.88, 1) * 0.45 + range(eco, 0, 0.1) * 0.55);
    const deep = range(imp, 0, 0.7);
    for (let i = 0; i < n; i++) {
      const el = layers[i];
      const local = eco * n - i;
      const exit = i < n - 1 ? ease(local, 0.74, 1) : 0;
      const opacity = 1 - exit;
      let scale = 1.05 + 0.12 * clamp01(local) * motion + exit * 0.32 * motion;
      let bright = 1;
      if (i === 0) {
        scale += (1 - entry) * 0.35 * motion;
        bright = 1 + (1 - entry) * 0.9;
      }
      if (i === n - 1) scale += deep * 0.14 * motion;
      const ready = i === 0 ? at > 0.84 : local > -0.3;
      const visible = ready && opacity > 0.002 && canvasOpacity < 0.999;
      el.style.visibility = visible ? "visible" : "hidden";
      if (!visible) continue;
      el.style.opacity = opacity.toFixed(3);
      const px = -pointer.sx * 14 * motion;
      const py = -pointer.sy * 9 * motion;
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      el.style.filter = bright > 1.001 ? `brightness(${bright.toFixed(3)})` : "none";
    }
    if (scrim) scrim.style.opacity = (ease(imp, 0, 0.32) * 0.86).toFixed(3);

    // ---- Overlay copy windows --------------------------------------------------------
    for (const w of windows) {
      const p = P[w.section];
      const t = (p - w.a) / (w.b - w.a);
      const fin = w.a < 0 ? 1 : ease(t, 0, 0.22);
      const fout = w.b > 1 ? 1 : 1 - ease(t, 0.78, 1);
      const op = fin * fout;
      const y = (0.5 - clamp01(t)) * w.drift * motion;
      w.el.style.opacity = op.toFixed(3);
      w.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      w.el.style.pointerEvents = op > 0.5 ? "auto" : "none";
    }

    // ---- Impact visualisation ---------------------------------------------------------
    rings.forEach((r, i) => {
      const t = ease(imp, 0.1 + i * 0.05, 0.4 + i * 0.05);
      r.style.strokeDashoffset = (1 - t).toFixed(4);
    });
    ringNodes.forEach((g, i) => {
      const t = ease(imp, 0.1 + i * 0.05, 0.4 + i * 0.05);
      const deg = -90 + t * 360 * (0.55 + i * 0.08) + (motion ? time * (2 + i) : 0);
      g.setAttribute("transform", `rotate(${deg.toFixed(2)} 300 300)`);
      g.style.opacity = t > 0.01 ? "1" : "0";
    });

    // ---- Approach timeline ------------------------------------------------------------
    if (processFill) {
      const f = ease(ap, 0.42, 0.72);
      processFill.style.setProperty("--fill", f.toFixed(4));
      processSteps.forEach((s, i) => {
        s.classList.toggle("is-reached", f >= i / Math.max(1, processSteps.length - 1) - 0.001);
      });
    }

    // ---- Focus areas: horizontal travel on wide screens -----------------------------
    if (focusTrack && focusMax > 0) {
      const x = -focusMax * range(fo, 0.06, 0.94);
      focusTrack.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      if (motion) {
        focusImages.forEach((img, i) => {
          const off = ((focusCenters[i] ?? 0) + x - vw / 2) / vw;
          img.style.transform = `translate3d(${(-off * 60).toFixed(1)}px, 0, 0) scale(1.18)`;
        });
      }
    }

    // ---- Particles, progress, header -----------------------------------------------
    const scrollY = lenis ? lenis.scroll : window.scrollY;
    const delta = scrollY - lastScroll;
    lastScroll = scrollY;
    if (motes && motesEl) {
      const mo = ease(at, 0.9, 1) * (1 - ease(ct, 0, 0.25)) * (1 - ease(imp, 0.2, 0.6) * 0.6);
      motesEl.style.opacity = mo > 0.001 ? "1" : "0";
      motes.update(time, motion ? delta : 0, mo);
    }
    const total = clamp01(scrollY / scrollMax);
    railFill?.style.setProperty("--progress", total.toFixed(4));
    barFill?.style.setProperty("--progress", total.toFixed(4));
    const scrolled = scrollY > 40 ? "1" : "0";
    if (header && scrolled !== lastActive) {
      header.dataset.scrolled = scrolled;
      lastActive = scrolled;
    }
  };

  gsap.ticker.add(tick);
  ScrollTrigger.refresh();
  setActive("opening");

  return {
    destroy() {
      gsap.ticker.remove(tick);
      gsap.ticker.remove(lenisRaf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", measure);
      triggers.forEach((t) => t.kill());
      ctx.revert();
      lenis?.destroy();
    },
  };
}
