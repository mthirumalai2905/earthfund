import type { CSSProperties } from "react";
import { atmosphere, ecosystems, mission, opening } from "@/content/site";

const h = (vh: number) => ({ "--h": vh }) as CSSProperties;

/** The pinned, scroll-scrubbed descent: orbit, mission, atmosphere entry and ecosystems. */
export default function Journey() {
  const n = ecosystems.length;
  return (
    <>
      <section id="opening" data-pinned="true" className="pin" style={h(200)} aria-labelledby="opening-title">
        <div className="pin-stage stage-opening">
          <div className="hero" data-window="-1,0.62" data-drift="-120">
            <p className="eyebrow hero-in" style={{ animationDelay: "0.5s" }}>
              {opening.eyebrow}
            </p>
            <h1 id="opening-title" className="hero-title hero-in" style={{ animationDelay: "0.9s" }}>
              {opening.title}
            </h1>
            <p className="hero-tagline hero-in" style={{ animationDelay: "1.4s" }}>
              {opening.tagline}
            </p>
          </div>
          <div className="scroll-cue" data-window="-1,0.25" data-drift="0">
            <div className="hero-in" style={{ animationDelay: "2.2s" }}>
              <span>{opening.cue}</span>
              <i aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section id="mission" data-pinned="true" className="pin" style={h(230)} aria-labelledby="mission-title">
        <div className="pin-stage stage-mission">
          <div className="mission-copy" data-window="0.12,0.88" data-drift="70">
            <p className="eyebrow">{mission.eyebrow}</p>
            <h2 id="mission-title" className="display-lg">
              {mission.title}
            </h2>
            <p className="lede">{mission.body}</p>
          </div>
        </div>
      </section>

      <section id="atmosphere" data-pinned="true" className="pin" style={h(240)} aria-label="Atmosphere">
        <div className="pin-stage stage-atmosphere">
          <p className="atmo-line display-md" data-window="0.08,0.55" data-drift="90">
            {atmosphere.line}
          </p>
        </div>
      </section>

      <section
        id="ecosystems"
        data-pinned="true"
        className="pin"
        style={h(160 * n)}
        aria-label="Ecosystems we invest in"
      >
        <div className="pin-stage stage-eco">
          {ecosystems.map((e, i) => (
            <article
              key={e.key}
              className="eco-copy"
              data-window={`${((i + 0.12) / n).toFixed(4)},${((i + 0.8) / n).toFixed(4)}`}
              data-drift="80"
            >
              <p className="eyebrow">
                <span className="eco-index">
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
                {e.theme}
              </p>
              <h2 className="display-lg">{e.title}</h2>
              <p className="lede">{e.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
