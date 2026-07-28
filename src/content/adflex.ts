/**
 * Single source of truth for all ADFLEX project copy.
 *
 * Every paragraph on the public website comes from this file. Copy is taken
 * from the supplied `ADFLEX_Website_content.pdf` (see docs/CONTENT-SOURCE.md).
 * No ADFLEX facts, statistics, partner details, publications or funding
 * details may be added here unless they have been supplied and approved.
 *
 * To change the website copy, edit this file only — components read it through
 * props and must not hard-code project paragraphs.
 */

export type NavigationItem = {
  /** Stable section id used both for the anchor and for the section element. */
  id: string;
  label: string;
  href: string;
};

export type ImageAsset = {
  src: string;
  alt: string;
  /** Intrinsic pixel size of the supplied file, used to preserve aspect ratio. */
  width: number;
  height: number;
};

export type HeroContent = {
  tags: readonly string[];
  headline: string;
  tagline: string;
  explainer: string;
  cta: { label: string; href: string };
  diagram: ImageAsset & { caption: string; concepts: readonly string[] };
};

export type AboutItem = {
  id: string;
  title: string;
  body: string;
};

export type Technology = {
  id: string;
  name: string;
  description: string;
};

export type Partner = {
  id: string;
  name: string;
  /** Decorative initials only — not an official logo. */
  initials: string;
};

export type ConsortiumContent = {
  title: string;
  intro: string;
  partners: readonly Partner[];
};

export type PilotContent = {
  title: string;
  subtitle: string;
  body: string;
  /** Assets and programmes named in the supplied pilot description. */
  assets: readonly string[];
};

export type ResultsContent = {
  title: string;
  heading: string;
  body: string;
};

export type ContactDetails = {
  title: string;
  intro: string;
  email: string;
  organisation: string;
  addressLines: readonly string[];
};

export type BrandAssets = {
  logo: ImageAsset;
};

export type AdflexContent = {
  meta: { title: string; description: string; skipLinkLabel: string };
  brand: BrandAssets;
  navigation: readonly NavigationItem[];
  hero: HeroContent;
  about: { title: string; items: readonly AboutItem[] };
  technologies: { title: string; intro: string; items: readonly Technology[] };
  consortium: ConsortiumContent;
  pilot: PilotContent;
  results: ResultsContent;
  contact: ContactDetails;
  footer: { navTitle: string; designSystemLabel: string; legalNote: string };
};

export const adflexContent = {
  meta: {
    title: "ADFLEX — Local Energy Flexibility",
    description:
      "ADFLEX develops and validates a digital framework that helps Sustainable Energy Communities in mixed-use buildings provide flexibility and take part in local energy markets, piloted in Ringsend, Dublin.",
    skipLinkLabel: "Skip to main content",
  },

  brand: {
    logo: {
      src: "/images/adflex/adflex-logo.png",
      alt: "ADFLEX — Local Energy Flexibility",
      width: 3790,
      height: 1148,
    },
  },

  // Navigation order must match the visible order of the sections on the page.
  navigation: [
    { id: "home", label: "Home", href: "#home" },
    { id: "technologies", label: "Technologies", href: "#technologies" },
    { id: "consortium", label: "Consortium", href: "#consortium" },
    { id: "pilot", label: "Pilot", href: "#pilot" },
    { id: "results", label: "Results & Publications", href: "#results" },
    { id: "contact", label: "Contact", href: "#contact" },
  ],

  hero: {
    tags: ["EU-Funded Project", "Energy Flexibility", "Digital Integration"],
    headline:
      "ADFLEX — Advanced Demonstrators for Flexibility and Local Energy Exchange in Sustainable Energy Communities",
    tagline:
      "Turning community buildings into flexumers, prosumers and flexible energy users, who together help balance a smarter, cleaner grid.",
    explainer:
      "A flexumer is a household or building that both uses and shares its energy flexibility with the grid.",
    cta: { label: "See Pilot Results", href: "#results" },
    diagram: {
      src: "/images/adflex/adflex-system-concept.png",
      alt: "ADFLEX system concept showing a community building with solar PV, heat pump, thermal storage and EV charging connected through Digital Spine middleware and a digital twin to aggregators, ESB Networks and the main grid. Red arrows show power flow and blue arrows show data and control signals.",
      width: 1849,
      height: 560,
      caption:
        "Red arrows represent power flow. Blue arrows represent data and control signals.",
      // Repeats the labels shown inside the diagram as real HTML text, so the
      // concepts are not communicated by the image alone.
      concepts: [
        "Community building",
        "Rooftop solar PV",
        "Heat pump and thermal storage",
        "EV charging",
        "Digital Spine middleware",
        "Digital twin (building and network model)",
        "Aggregators (market role)",
        "ESB Networks (DSO)",
        "Main grid / import power",
      ],
    },
  },

  about: {
    title: "About ADFLEX",
    items: [
      {
        id: "objective",
        title: "Objective",
        body: "ADFLEX addresses a central challenge for the energy transition: helping Sustainable Energy Communities in mixed-use buildings provide flexibility and take part in local energy markets. The project develops and validates a digital framework that coordinates heat pumps, electric vehicles, solar PV and smart meters, tested in a real pilot in Ringsend, Dublin, rather than in simulation alone.",
      },
      {
        id: "impact",
        title: "Impact",
        body: "By giving distribution and transmission system operators real-time visibility into local load and generation, ADFLEX supports the wider EU push to cut emissions and absorb more renewable energy onto the grid. The project’s outcome is a blueprint that other Sustainable Energy Communities across Europe can adopt and adapt, not a one-off pilot result.",
      },
      {
        id: "our-role",
        title: "Our role",
        body: "At the core of ADFLEX is the Digital Spine, a middleware layer that lets home devices like heat pumps and EV chargers talk to grid operators using a shared, open language, so equipment from different manufacturers can work together without custom setup for each one. Alongside it, a digital twin, a virtual copy of the pilot buildings and network, lets the team test and fine-tune flexibility strategies before anything changes on-site, reducing the risk of disruption to residents.",
      },
    ],
  },

  technologies: {
    title: "Technologies",
    intro:
      "Four building blocks make local energy flexibility workable for a community rather than only for a single building.",
    items: [
      {
        id: "digital-spine",
        name: "Digital Spine middleware",
        description:
          "The data backbone of the project. It connects heat pumps, EV chargers, batteries and PV systems to grid stakeholders through standards-based, interoperable data exchange, so devices from different manufacturers can be coordinated without custom integration work for each one.",
      },
      {
        id: "digital-twin",
        name: "Digital twin",
        description:
          "A virtual replica of the pilot buildings and local network, used to model how changes in heating, charging or storage behaviour affect both resident comfort and grid load, before those changes are rolled out physically.",
      },
      {
        id: "smart-tariffs",
        name: "Smart tariffs and dynamic pricing",
        description:
          "Pricing mechanisms that let flexibility translate into a tangible benefit for residents, giving communities a reason to shift consumption in response to grid conditions rather than just a technical capability to do so.",
      },
      {
        id: "data-spaces",
        name: "Shared data standards and data spaces",
        description:
          "ADFLEX uses data spaces, secure, agreed environments for exchanging energy data, so information from the pilot can be trusted, compared and reused by other communities, grid operators and researchers working on flexibility elsewhere.",
      },
    ],
  },

  consortium: {
    title: "Consortium",
    intro:
      "ADFLEX brings together three partners spanning research, technical delivery and energy market expertise:",
    // Partner roles, descriptions, logos, URLs and countries have not been
    // supplied. Do not add them here without approved source material.
    partners: [
      { id: "maynooth-university", name: "Maynooth University", initials: "MU" },
      {
        id: "university-college-dublin",
        name: "University College Dublin (UCD)",
        initials: "UCD",
      },
      { id: "arden-energy", name: "Arden Energy", initials: "AE" },
    ],
  },

  pilot: {
    title: "Pilot",
    subtitle: "Ringsend Sustainable Energy Community, Dublin",
    body: "The pilot covers Ringsend and Irishtown, a community of around 9,000 residents southeast of Dublin city centre, already recognised as a decarbonisation demonstration zone by Dublin City Council. It includes a mix of domestic homes with heat pumps, EVs and solar PV, plus a commercial building with an EV charger, solar PV, heat pump and combined heat and power unit. These assets are being coordinated through the Digital Spine and Arden Energy's platform, working alongside ESB Networks' Beat the Peak programme, allowing the community to demonstrate flexibility in practice rather than on paper, and giving the project real operational data to refine the underlying models.",
    assets: [
      "Heat pumps",
      "Electric vehicles and EV charging",
      "Solar PV",
      "Combined heat and power",
      "Digital Spine",
      "Arden Energy’s platform",
      "ESB Networks’ Beat the Peak programme",
    ],
  },

  results: {
    title: "Results & Publications",
    heading: "Project findings are still being finalised",
    body: "Results and publications from ADFLEX are still being finalised as the project progresses through its pilot phase. This section will be updated as findings, deliverables and papers become available.",
  },

  // A dedicated ADFLEX contact has not been confirmed. These are the standard
  // IRESI contact details supplied with the website copy — replace the values
  // here and both the contact section and the footer will follow.
  contact: {
    title: "Contact",
    intro: "For questions about ADFLEX, please get in touch.",
    email: "info@iresi.eu",
    organisation: "Maynooth University",
    addressLines: ["Maynooth, Co. Kildare", "Ireland"],
  },

  footer: {
    navTitle: "Sections",
    designSystemLabel: "ADFLEX Design System",
    // Funding programme, grant number, funding disclaimer, EU emblem and legal
    // pages have not been supplied or approved — see docs/OPEN-ITEMS.md.
    legalNote:
      "First release of the ADFLEX project website. Funding and legal information will be added once confirmed.",
  },
} as const satisfies AdflexContent;
