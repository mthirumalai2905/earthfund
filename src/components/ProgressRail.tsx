import { chapters } from "@/content/site";

export default function ProgressRail() {
  return (
    <>
      <nav className="rail" aria-label="Chapters">
        <div className="rail-track" data-el="rail-fill" />
        <ol>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} data-rail-link={c.id}>
                <span className="rail-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="rail-label">{c.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="progress-bar" data-el="bar-fill" aria-hidden="true" />
    </>
  );
}
