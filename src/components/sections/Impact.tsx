import Image from "next/image";
import { impact } from "@/content/site";

export default function Impact() {
  return (
    <section id="impact" className="info info-impact" aria-labelledby="impact-title">
      <div className="info-inner impact-grid">
        <div className="impact-visual">
          <div className="impact-visual-sticky">
            <figure className="solar" data-el="solar">
              <Image
                src="/images/solar-system.jpg"
                alt="The solar system rendered in liquid chrome: eight silver orbit rings, polished planets, an asteroid belt and a glowing sun"
                width={1024}
                height={768}
                sizes="(max-width: 899px) 92vw, 44vw"
                quality={90}
              />
              <figcaption className="solar-caption">
                <span className="solar-kicker">Five systems</span>
                <span className="solar-title">One portfolio</span>
                <span className="solar-note">Orbits not to scale</span>
              </figcaption>
            </figure>
          </div>
        </div>
        <div className="impact-copy">
          <p className="eyebrow" data-rise>
            {impact.eyebrow}
          </p>
          <h2 id="impact-title" className="display-lg" data-rise>
            {impact.title}
          </h2>
          <p className="lede" data-rise>
            {impact.body}
          </p>
          <ol className="metrics">
            {impact.metrics.map((m, i) => (
              <li key={m.system} className="metric" data-rise>
                <span className={`metric-dot ring-${i}`} aria-hidden="true" />
                <span className="metric-system">{m.system}</span>
                <span className="metric-measure">{m.measure}</span>
                <span className="metric-unit">Reported in {m.unit}</span>
              </li>
            ))}
          </ol>
          <p className="note" data-rise>
            {impact.note}
          </p>
        </div>
      </div>
    </section>
  );
}
