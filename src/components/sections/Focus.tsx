import Image from "next/image";
import type { CSSProperties } from "react";
import { focus } from "@/content/site";

export default function Focus() {
  return (
    <section
      id="focus"
      data-pinned="true"
      className="pin pin-focus"
      style={{ "--h": 360 } as CSSProperties}
      aria-labelledby="focus-title"
    >
      <div className="pin-stage stage-focus">
        <div className="focus-track" data-el="focus-track">
          <div className="focus-intro">
            <p className="eyebrow">{focus.eyebrow}</p>
            <h2 id="focus-title" className="display-lg">
              {focus.title}
            </h2>
            <p className="lede">{focus.body}</p>
          </div>
          {focus.areas.map((a, i) => (
            <article key={a.key} className="focus-card">
              <div className="focus-media">
                <Image
                  src={a.image}
                  alt={a.alt}
                  fill
                  sizes="(min-width: 900px) 30vw, 92vw"
                  quality={80}
                  data-focus-image
                />
              </div>
              <div className="focus-body">
                <span className="focus-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
                <ul className="tags" aria-label="Themes">
                  {a.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
