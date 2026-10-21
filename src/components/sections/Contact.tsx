import type { CSSProperties } from "react";
import { contact, site } from "@/content/site";
import { Mark } from "../Header";

export default function Contact() {
  const mail = `mailto:${site.contactEmail}?subject=${encodeURIComponent("Earth Fund investor brief")}`;
  return (
    <>
      <section
        id="contact"
        data-pinned="true"
        className="pin"
        style={{ "--h": 240 } as CSSProperties}
        aria-labelledby="contact-title"
      >
        <div className="pin-stage stage-contact">
          <div className="contact-copy" data-window="0.3,2" data-drift="80">
            <p className="eyebrow">{contact.eyebrow}</p>
            <h2 id="contact-title" className="display-xl">
              {contact.title}
            </h2>
            <p className="lede">{contact.body}</p>
            <div className="cta-row">
              <a className="btn btn-primary" href={mail}>
                {contact.primary}
              </a>
              <a className="btn btn-ghost" href="#approach">
                {contact.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-brand">
          <Mark size={18} />
          <span>{site.name}</span>
        </div>
        <p>{site.draftNotice}</p>
        <p>{site.legal}</p>
        <p className="footer-meta">
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <span>&copy; {new Date().getFullYear()} {site.name}</span>
        </p>
      </footer>
    </>
  );
}
