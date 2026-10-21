import { chapters, site } from "@/content/site";

export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10.25" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.9 13.6c3.2-2.1 6.6-3.1 10.1-3.1s6.9 1 10.1 3.1" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="16.4" cy="6.9" r="1.35" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const nav = chapters.filter((c) => c.nav && c.id !== "contact");
  return (
    <header className="site-header" data-el="header" data-scrolled="0">
      <a href="#opening" className="brand" aria-label={`${site.name}, back to top`}>
        <Mark />
        <span>{site.name}</span>
      </a>
      <nav aria-label="Primary" className="site-nav">
        {nav.map((c) => (
          <a key={c.id} href={`#${c.id}`}>
            {c.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#contact">
        Contact
      </a>
    </header>
  );
}
