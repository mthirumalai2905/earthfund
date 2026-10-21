import { impact } from "@/content/site";

const RING_BASE = 112;
const RING_STEP = 36;

/** Rings draw on as the section scrolls; one ring per system the fund will report on. */
function SystemsRings() {
  return (
    <svg className="rings" viewBox="0 0 600 600" role="img" aria-label="Five planetary systems measured as one portfolio">
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dfe3ea" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#dfe3ea" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="100" fill="url(#core)" />
      {impact.metrics.map((m, i) => {
        const r = RING_BASE + i * RING_STEP;
        return (
          <g key={m.system} className={`ring ring-${i}`}>
            <circle cx="300" cy="300" r={r} className="ring-base" />
            <circle
              cx="300"
              cy="300"
              r={r}
              className="ring-progress"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              transform="rotate(-90 300 300)"
              data-ring={i}
            />
            <g data-ring-node={i} style={{ opacity: 0 }}>
              <circle cx={300 + r} cy="300" r="4.5" className="ring-node" />
              <circle cx={300 + r} cy="300" r="12" className="ring-halo" />
            </g>
          </g>
        );
      })}
      <text x="300" y="292" textAnchor="middle" className="rings-kicker">
        Five systems
      </text>
      <text x="300" y="326" textAnchor="middle" className="rings-title">
        One portfolio
      </text>
    </svg>
  );
}

export default function Impact() {
  return (
    <section id="impact" className="info info-impact" aria-labelledby="impact-title">
      <div className="info-inner impact-grid">
        <div className="impact-visual">
          <div className="impact-visual-sticky">
            <SystemsRings />
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
