import { approach } from "@/content/site";

export default function Approach() {
  return (
    <section id="approach" className="info info-approach" aria-labelledby="approach-title">
      <div className="info-inner">
        <p className="eyebrow" data-rise>
          {approach.eyebrow}
        </p>
        <h2 id="approach-title" className="display-xl" data-rise>
          {approach.title}
        </h2>
        <p className="lede approach-lede" data-rise>
          {approach.body}
        </p>

        <ul className="principles">
          {approach.principles.map((p, i) => (
            <li key={p.title} className="principle" data-rise>
              <span className="principle-index">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <div className="process" data-rise>
          <h3 className="process-heading">How an investment moves</h3>
          <div className="process-line" aria-hidden="true">
            <span data-process-fill />
          </div>
          <ol className="process-steps">
            {approach.process.map((s, i) => (
              <li key={s.step} data-process-step={i}>
                <span className="process-dot" aria-hidden="true" />
                <h4>{s.step}</h4>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
