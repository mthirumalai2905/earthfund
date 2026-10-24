/**
 * All copy on the site lives here. Wording is still draft pending Paal's review.
 * Portfolio names and the investment mandate below follow the 23 Oct 2026 workshop.
 */

export const site = {
  name: "Earth Fund",
  contactEmail: "paal@synx.tools",
  draftNotice:
    "Preview build. Copy is draft and subject to approval. Team details will be added once confirmed.",
  legal:
    "This website is for information only and does not constitute an offer to sell, or a solicitation of an offer to buy, any security or fund interest.",
};

export type ChapterId =
  | "opening"
  | "mission"
  | "atmosphere"
  | "ecosystems"
  | "impact"
  | "approach"
  | "portfolio"
  | "focus"
  | "contact";

/** Order and labels for the progress rail and header navigation. */
export const chapters: { id: ChapterId; label: string; nav?: boolean }[] = [
  { id: "opening", label: "Orbit" },
  { id: "mission", label: "Mission", nav: true },
  { id: "atmosphere", label: "Atmosphere" },
  { id: "ecosystems", label: "Ecosystems" },
  { id: "impact", label: "Impact", nav: true },
  { id: "approach", label: "Approach", nav: true },
  { id: "portfolio", label: "Portfolio", nav: true },
  { id: "focus", label: "Focus", nav: true },
  { id: "contact", label: "Contact", nav: true },
];

export const opening = {
  eyebrow: "An environmental investment fund",
  title: "Earth Fund",
  tagline: "Capital for a living planet",
  cue: "Scroll to descend",
};

export const mission = {
  eyebrow: "Mission",
  title: "From orbit, the planet reads as one system",
  body: "Climate, forests, oceans and freshwater are not separate causes. They are connected assets, and they are underpriced. Earth Fund exists to invest in them as one portfolio.",
};

export const atmosphere = {
  line: "Everything we value lives beneath a thin silver line",
};

export type Ecosystem = {
  key: string;
  image: string;
  alt: string;
  theme: string;
  title: string;
  body: string;
};

export const ecosystems: Ecosystem[] = [
  {
    key: "climate",
    image: "/images/silver-01-cloud-sea.jpg",
    alt: "An endless sea of liquid chrome clouds under a black sky",
    theme: "Climate",
    title: "The sky is a shared balance sheet",
    body: "We back technologies and projects that cut emissions at the source and remove what is already in the air.",
  },
  {
    key: "freshwater",
    image: "/images/silver-02-mountains.jpg",
    alt: "A chrome mountain range reflected in a mercury lake",
    theme: "Freshwater",
    title: "Water begins in high places",
    body: "Snowpacks and watersheds feed the rivers that cities, farms and industry rely on. We invest in protecting the sources.",
  },
  {
    key: "forests",
    image: "/images/silver-03-forest.jpg",
    alt: "Light shafts falling through an old forest of chrome trees",
    theme: "Forests and land",
    title: "The oldest infrastructure on Earth",
    body: "Forests regulate rainfall and shelter an extraordinary share of life on land. We fund models that make standing forests worth more than cleared ones.",
  },
  {
    key: "coasts",
    image: "/images/silver-04-ocean.jpg",
    alt: "Mercury waves rolling toward a low sun",
    theme: "Coasts",
    title: "Where land meets sea",
    body: "Reefs, mangroves and wetlands defend coastlines and nurture fisheries. We look for models that reward the people who keep them healthy.",
  },
  {
    key: "oceans",
    image: "/images/silver-05-underwater.jpg",
    alt: "A chrome sea turtle gliding over a silver coral reef",
    theme: "Oceans",
    title: "The blue engine",
    body: "The ocean absorbs heat on a planetary scale. We invest in restoration, responsible aquaculture and the data that makes ocean health measurable.",
  },
];

export const impact = {
  eyebrow: "Impact",
  title: "Impact, measured before it is marketed",
  body: "Every investment carries outcome targets agreed before capital is committed. We report against them, independently verified, for the life of the investment.",
  note: "Draft framework. Results will be published per investment once verified. No figures are shown until they exist.",
  metrics: [
    { system: "Climate", measure: "Emissions avoided and removed", unit: "tCO\u2082e" },
    { system: "Forests and land", measure: "Area restored or protected", unit: "hectares" },
    { system: "Oceans and coasts", measure: "Marine area under improved management", unit: "km\u00b2" },
    { system: "Freshwater", measure: "Water protected, saved or returned", unit: "m\u00b3" },
    { system: "Biodiversity", measure: "Habitat condition and species indicators", unit: "index" },
  ],
};

export const approach = {
  eyebrow: "Approach",
  title: "Natural capital is the most undervalued asset on Earth",
  body: "Markets have long treated healthy ecosystems as free. That is changing. We invest where protecting the planet and building durable value point in the same direction.",
  principles: [
    {
      title: "Systems, not silos",
      body: "We assess how each investment affects climate, land, water and oceans together, not one metric in isolation.",
    },
    {
      title: "Measured outcomes",
      body: "Targets are set before we invest and tracked with independent verification after.",
    },
    {
      title: "Patient capital",
      body: "Ecosystems recover on their own timelines. Our horizons are built to match them.",
    },
    {
      title: "Local partnership",
      body: "Lasting results depend on the communities closest to the land and water. We structure investments to share value with them.",
    },
  ],
  process: [
    { step: "Source", body: "Identify companies and projects where environmental and financial value align." },
    { step: "Diligence", body: "Test the science, the business model and the people behind it." },
    { step: "Invest", body: "Commit capital with outcome targets written into the terms." },
    { step: "Measure", body: "Track results with independent data and on-the-ground verification." },
    { step: "Report", body: "Publish what worked, what did not, and what we changed." },
  ],
  mandate:
    "We do not invest in weapons, war, coal, fossil fuels, carbon-based fuels, or wind turbines. We back solar, hemp, and natural biodegradable materials that replace plastic and support human survival.",
};

export const portfolio = {
  eyebrow: "Portfolio",
  title: "A short list, on purpose",
  body: "Investors commit capital to Earth Fund and join the investment team. The fund is being established in Dubai. These are the companies already in the portfolio.",
  companies: [
    { name: "Apollo", mark: "apollo" },
    { name: "MarNet", mark: "marnet" },
    { name: "Realtime Web", mark: "realtime-web" },
  ] as const,
};

export const focus = {
  eyebrow: "Where we look",
  title: "Areas of focus",
  body: "Where new capital is aimed. Current holdings are listed in the portfolio.",
  areas: [
    {
      key: "materials",
      image: "/images/silver-focus-land.jpg",
      alt: "Chrome hills, silver trees and a mercury pond",
      title: "Hemp and natural materials",
      body: "Hemp production and organic, biodegradable compounds meant to replace plastics, on land that stays productive.",
      tags: ["Hemp", "Plastic replacement", "Organic compounds"],
    },
    {
      key: "coastal",
      image: "/images/silver-focus-ocean.jpg",
      alt: "Chrome mangrove roots standing in still silver water",
      title: "Living coasts",
      body: "Mangroves, seagrass and wetlands that protect shorelines and support fisheries.",
      tags: ["Mangroves", "Fisheries", "Coastal resilience"],
    },
    {
      key: "solar",
      image: "/images/silver-focus-solar.jpg",
      alt: "Rows of chrome solar panels under a black sky and a low sun",
      title: "Solar energy",
      body: "Solar generation and storage, where the environmental footprint is designed in from the start.",
      tags: ["Solar", "Storage", "Efficiency"],
    },
    {
      key: "water",
      image: "/images/silver-focus-water.jpg",
      alt: "A mercury river running between chrome boulders toward silver mountains",
      title: "Freshwater systems",
      body: "Watershed protection, water efficiency and the monitoring that lets rivers be managed as the assets they are.",
      tags: ["Watersheds", "Efficiency", "Monitoring"],
    },
  ],
};

export const contact = {
  eyebrow: "Earth Fund",
  title: "Invest in the only planet we have",
  body: "We are opening conversations with investors, founders and project developers who share a long horizon.",
  primary: "Request the investor brief",
  secondary: "Revisit our approach",
};
