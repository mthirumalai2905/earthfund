import Image from "next/image";
import type { RefObject } from "react";
import { ecosystems } from "@/content/site";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  motesRef: RefObject<HTMLCanvasElement | null>;
}

/** Fixed visual stack behind the scrolling copy. The director animates every layer. */
export default function Backdrop({ canvasRef, motesRef }: Props) {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="nature">
        {ecosystems.map((e, i) => (
          <div key={e.key} className="nature-layer" data-layer={i} style={{ zIndex: ecosystems.length - i }}>
            <Image src={e.image} alt="" fill sizes="100vw" quality={82} priority={i === 0} />
          </div>
        ))}
      </div>
      <div className="scrim" data-el="scrim" />

      <div className="scene" data-el="canvas">
        <canvas ref={canvasRef} className="scene-canvas" />
      </div>

      <div className="fallback" data-el="fallback">
        <div className="fallback-stars" />
        <div className="fallback-earth">
          <Image src="/images/silver-00-earth.jpg" alt="" fill sizes="100vw" quality={85} />
        </div>
        <div className="fallback-fog" data-el="fallback-fog" />
      </div>

      <canvas ref={motesRef} className="motes" data-el="motes" />
      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}
