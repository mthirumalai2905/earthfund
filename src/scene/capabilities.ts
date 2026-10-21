import type { Tier } from "./EarthScene";

export interface Capabilities {
  webgl: boolean;
  reducedMotion: boolean;
  tier: Tier;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectCapabilities(): Capabilities {
  const params = new URLSearchParams(window.location.search);
  const reducedMotion =
    params.has("reduced") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const low = params.has("low") || cores <= 4 || memory <= 4 || (coarse && window.innerWidth < 900);
  return {
    webgl: !params.has("nogl") && supportsWebGL(),
    reducedMotion,
    tier: low ? "low" : "high",
  };
}
