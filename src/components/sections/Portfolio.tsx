import { portfolio } from "@/content/site";

function ApolloMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M0 0h14v14H0V0zm18 0h14v14H18V0zM0 18h14v14H0V18zm22 4h10v10H22V22z"
      />
    </svg>
  );
}

function MarNetMark() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14" cy="14" r="7" fill="none" stroke="#2563ff" strokeWidth="1.6" />
      <circle cx="14" cy="14" r="2.6" fill="#2563ff" />
    </svg>
  );
}

function Mark({ id }: { id: (typeof portfolio.companies)[number]["mark"] }) {
  if (id === "apollo") return <ApolloMark />;
  if (id === "marnet") return <MarNetMark />;
  return (
    <img
      src="/logos/realtime-web.png"
      alt=""
      width={640}
      height={640}
    />
  );
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="info info-portfolio" aria-labelledby="portfolio-title">
      <div className="info-inner">
        <p className="eyebrow" data-rise>
          {portfolio.eyebrow}
        </p>
        <h2 id="portfolio-title" className="display-xl" data-rise>
          {portfolio.title}
        </h2>
        <p className="lede approach-lede" data-rise>
          {portfolio.body}
        </p>
        <ul className="holdings">
          {portfolio.companies.map((company) => (
            <li key={company.name} className="holding" data-rise>
              <div className={`holding-mark mark-${company.mark}`}>
                <Mark id={company.mark} />
              </div>
              <h3>{company.name}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
