"use client";

import { useEffect, useRef } from "react";
import { createDirector } from "@/scroll/director";
import { EarthScene } from "@/scene/EarthScene";
import { Motes } from "@/scene/Motes";
import { detectCapabilities } from "@/scene/capabilities";
import Backdrop from "./Backdrop";
import Header from "./Header";
import ProgressRail from "./ProgressRail";
import Journey from "./sections/Journey";
import Impact from "./sections/Impact";
import Approach from "./sections/Approach";
import Portfolio from "./sections/Portfolio";
import Focus from "./sections/Focus";
import Contact from "./sections/Contact";

export default function Experience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const caps = detectCapabilities();

    let scene: EarthScene | null = null;
    if (caps.webgl && canvasRef.current) {
      try {
        scene = new EarthScene(canvasRef.current, caps.tier);
      } catch (err) {
        console.warn("WebGL scene unavailable, using image fallback", err);
        scene = null;
      }
    }
    const motes = motesRef.current ? new Motes(motesRef.current, caps.tier === "high" ? 70 : 32) : null;

    root.dataset.mode = scene ? "webgl" : "fallback";
    root.dataset.motion = caps.reducedMotion ? "reduced" : "full";

    const director = createDirector(root, { scene, motes, caps });
    return () => {
      director.destroy();
      scene?.dispose();
    };
  }, []);

  return (
    <div ref={rootRef} className="ef" data-mode="pending">
      <a className="skip-link" href="#impact">
        Skip the journey
      </a>
      <Backdrop canvasRef={canvasRef} motesRef={motesRef} />
      <Header />
      <ProgressRail />
      <main>
        <Journey />
        <Impact />
        <Approach />
        <Portfolio />
        <Focus />
        <Contact />
      </main>
    </div>
  );
}
