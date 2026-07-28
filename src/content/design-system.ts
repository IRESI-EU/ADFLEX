/**
 * Explanatory copy for the /design-system page.
 *
 * This file documents the implementation. It deliberately contains no ADFLEX
 * project facts — those live only in `src/content/adflex.ts`.
 */

export type DesignSystemSection = {
  id: string;
  label: string;
  title: string;
};

export type ColourToken = {
  /** CSS custom property name, as defined in src/styles/adflex-tokens.css. */
  token: string;
  name: string;
  /** Documented value. Keep in sync with src/styles/adflex-tokens.css. */
  hex: string;
  usage: string;
};

export type ScaleToken = {
  token: string;
  value: string;
  usage: string;
};

export type RuleGroup = {
  title: string;
  items: readonly string[];
};

export const designSystemContent = {
  meta: {
    title: "ADFLEX Design System",
    description:
      "The visual and interaction foundations behind the first release of the ADFLEX project website.",
    backLabel: "Back to ADFLEX",
    navTitle: "On this page",
  },

  sections: [
    { id: "introduction", label: "Introduction", title: "Introduction" },
    {
      id: "brand-foundations",
      label: "Brand & Foundations",
      title: "Brand & Foundations",
    },
    { id: "logo-imagery", label: "Logo & Imagery", title: "Logo & Imagery" },
    { id: "components", label: "Components", title: "Components" },
    {
      id: "layout-patterns",
      label: "Layout & Patterns",
      title: "Layout & Patterns",
    },
    {
      id: "accessibility",
      label: "Accessibility & Content",
      title: "Accessibility & Content Rules",
    },
  ],

  introduction: {
    lead: "This design system describes how the ADFLEX website is built today. It exists so that a second developer, or a second agency, can extend the site without guessing at colours, spacing or component behaviour.",
    points: [
      "It documents the current first-release implementation, not a future roadmap.",
      "The production components in src/components are the source of truth. Everything on this page is rendered with those same components and the same scoped CSS tokens as the public site.",
      "It is intentionally lightweight: one CSS token file, nine components and no build tooling of its own.",
      "It can grow when the website scope grows. New tokens and components belong here as soon as they are used in production.",
    ],
  },

  colours: [
    {
      token: "--adflex-color-ink",
      name: "Ink",
      hex: "#091320",
      usage: "Headings. Taken from the ADFLEX wordmark.",
    },
    {
      token: "--adflex-color-text",
      name: "Text",
      hex: "#1B2733",
      usage: "Body copy on light surfaces.",
    },
    {
      token: "--adflex-color-muted",
      name: "Muted text",
      hex: "#4A5A6A",
      usage: "Supporting copy, captions and labels. Approximately 7:1 on white.",
    },
    {
      token: "--adflex-color-primary",
      name: "Interaction teal",
      hex: "#006B63",
      usage:
        "Buttons, links and focus rings. Darker than the logo teal so white text on it reaches roughly 6.4:1.",
    },
    {
      token: "--adflex-color-primary-hover",
      name: "Interaction teal (hover)",
      hex: "#00544E",
      usage: "Hover and active states for primary actions.",
    },
    {
      token: "--adflex-color-brand",
      name: "Brand teal",
      hex: "#08857B",
      usage:
        "Decorative rules and numeric marks. Approximately 4.5:1 on white, so it is not used for long body text.",
    },
    {
      token: "--adflex-color-brand-soft",
      name: "Pale blue-grey",
      hex: "#8EA8C1",
      usage:
        "From the logo tagline. Decorative only — never used for body text.",
    },
    {
      token: "--adflex-color-accent",
      name: "Energy yellow",
      hex: "#FEC003",
      usage:
        "From the logo bolt. Decorative accent only — never small text on white.",
    },
    {
      token: "--adflex-color-background",
      name: "Page background",
      hex: "#F2F7F6",
      usage: "Default page background.",
    },
    {
      token: "--adflex-color-surface",
      name: "Surface",
      hex: "#FFFFFF",
      usage: "Cards, header and footer. The only surface the logo sits on.",
    },
    {
      token: "--adflex-color-surface-soft",
      name: "Soft surface",
      hex: "#E7F0EE",
      usage: "Alternating section bands and tags.",
    },
    {
      token: "--adflex-color-border",
      name: "Border",
      hex: "#D5E2E0",
      usage: "Card and divider borders.",
    },
    {
      token: "--adflex-color-border-strong",
      name: "Strong border",
      hex: "#B9CBC8",
      usage: "Tag outlines, empty-state edges and secondary buttons.",
    },
  ],

  typography: [
    {
      token: "--adflex-text-3xl",
      value: "clamp(2rem, 1.4rem + 2.2vw, 2.875rem)",
      usage: "h1 — one per page.",
    },
    { token: "--adflex-text-2xl", value: "1.875rem", usage: "h2 — section titles." },
    { token: "--adflex-text-xl", value: "1.5rem", usage: "Hero tagline, pilot subtitle." },
    { token: "--adflex-text-lg", value: "1.1875rem", usage: "h3 — card titles, section leads." },
    { token: "--adflex-text-base", value: "1.0625rem", usage: "Body copy." },
    { token: "--adflex-text-sm", value: "0.9375rem", usage: "Captions, labels, navigation." },
    { token: "--adflex-text-xs", value: "0.8125rem", usage: "Tags and footer legal row." },
  ],

  spacing: [
    { token: "--adflex-space-1", value: "0.25rem", usage: "Icon and inline gaps." },
    { token: "--adflex-space-2", value: "0.5rem", usage: "Tight stacks, tag gaps." },
    { token: "--adflex-space-3", value: "0.75rem", usage: "Text to text." },
    { token: "--adflex-space-4", value: "1rem", usage: "Inside small blocks." },
    { token: "--adflex-space-5", value: "1.5rem", usage: "Card padding, grid gaps." },
    { token: "--adflex-space-6", value: "2.5rem", usage: "Between blocks in a section." },
    { token: "--adflex-space-7", value: "4rem", usage: "Section vertical rhythm." },
  ],

  radii: [
    { token: "--adflex-radius-sm", value: "4px", usage: "Focus rings, nav links." },
    { token: "--adflex-radius-md", value: "10px", usage: "Buttons, mobile menu panel." },
    { token: "--adflex-radius-lg", value: "16px", usage: "Cards and panels." },
  ],

  shadows: [
    {
      token: "--adflex-shadow-sm",
      value: "0 1px 2px rgba(9, 19, 32, 0.06)",
      usage: "Resting cards.",
    },
    {
      token: "--adflex-shadow-md",
      value: "0 6px 20px rgba(9, 19, 32, 0.08)",
      usage: "The mobile navigation panel only.",
    },
  ],

  layoutTokens: [
    {
      token: "--adflex-container",
      value: "1160px",
      usage: "Maximum content width, applied by the .adflex-container utility.",
    },
    {
      token: "--adflex-header-height",
      value: "84px (72px below 720px)",
      usage:
        "Drives the sticky header height and the scroll-margin-top on anchored sections.",
    },
    {
      token: "--adflex-target-min",
      value: "44px",
      usage: "Minimum internal target size for interactive elements.",
    },
  ],

  logoRules: {
    intro:
      "One PNG is supplied. It is a raster asset with an opaque white background — there is no vector, monochrome, reversed or favicon version, so none may be produced by tracing or redrawing.",
    dos: [
      "Use the supplied full-colour PNG at /images/adflex/adflex-logo.png.",
      "Preserve its aspect ratio: set a width and leave height automatic.",
      "Keep the leaf-and-lightning symbol, the wordmark and the LOCAL ENERGY FLEXIBILITY line all visible.",
      "Place it on white or a very light surface, with clear space around it.",
      "Use it through next/image with the alt text “ADFLEX — Local Energy Flexibility”.",
    ],
    donts: [
      "Do not recolour, stretch, squeeze, rotate or distort it.",
      "Do not crop away the symbol, the wordmark or the tagline.",
      "Do not remove the white background or try to fake transparency.",
      "Do not trace it into SVG or present the raster file as a vector asset.",
      "Do not rebuild the wordmark with ordinary text.",
      "Do not create monochrome or reversed variants.",
      "Do not add shadows, bevels, borders or other effects.",
      "Do not place it directly on dark teal or charcoal.",
      "Do not extract the logo out of the system diagram — use the separate official file.",
    ],
  },

  imageryRules: {
    intro:
      "The system diagram at /images/adflex/adflex-system-concept.png is the supplied project-system visual. It already carries detailed labels of its own.",
    rules: [
      "Show the complete diagram. Every label must stay visible at every viewport size.",
      "Never place text or UI over it, and never crop it into a conventional hero banner.",
      "Display it full width with automatic height, so it never causes horizontal page overflow.",
      "Red arrows represent power flow. Blue arrows represent data and control signals — this is stated in the visible caption as well as in the alt text.",
      "Repeat the essential concepts in surrounding HTML, so nothing depends on text baked into the image.",
      "Diagram red and blue keep their diagram meaning and are never reused as UI colours.",
    ],
  },

  layoutPatterns: [
    {
      title: "Content container",
      items: [
        ".adflex-container caps content at --adflex-container and centres it.",
        "Horizontal padding steps down from --adflex-space-5 to --adflex-space-4 below 720px.",
        "Applied by the header, hero, every section and the footer, so all content lines up on one vertical rhythm.",
      ],
    },
    {
      title: "SectionShell",
      items: [
        "Renders a <section> landmark with a stable id, an h2 labelled by aria-labelledby and an optional lead paragraph.",
        "Adds scroll-margin-top so anchored sections clear the sticky header.",
        "The tone=\"soft\" variant swaps the background to --adflex-color-surface-soft to separate adjacent sections.",
      ],
    },
    {
      title: "Hero structure",
      items: [
        "Fixed order: tags, h1, tagline, muted explainer, primary call to action, then the full-width diagram and its caption.",
        "The standalone logo is not repeated in the hero — it is already in the header and inside the diagram.",
        "Below the diagram, the diagram's own labels are repeated as a plain list of concepts.",
      ],
    },
    {
      title: "Two-column card grid",
      items: [
        "Technologies use a two-column grid on desktop and a single column below 720px.",
        "Cards stretch to equal height, so rows stay aligned regardless of copy length.",
      ],
    },
    {
      title: "Three-card partner layout",
      items: [
        "The consortium uses three equal columns, dropping to two below 900px and one below 720px.",
        "Cards are text only. Initials are decorative and hidden from assistive technology.",
      ],
    },
    {
      title: "Sticky header",
      items: [
        "The header is position: sticky at top: 0 with z-index 50 on a white surface.",
        "Its height comes from --adflex-header-height, which is also what every anchored section uses for scroll-margin-top — change the token and both stay aligned.",
        "Below 940px the navigation collapses behind a button with aria-expanded; above it, the full list is visible.",
      ],
    },
    {
      title: "Responsive stacking",
      items: [
        "Breakpoints in use: 940px (header navigation), 900px (three-column and pilot layouts) and 720px (everything to a single column).",
        "Grids use minmax(0, 1fr) so long words cannot force horizontal overflow.",
        "Images are width: 100% with height: auto, never fixed pixel heights.",
      ],
    },
  ],

  accessibilityRules: [
    {
      title: "Structure",
      items: [
        "Exactly one h1 per route, followed by h2 section titles and h3 card titles in order.",
        "Semantic landmarks throughout: header, nav, main, section and footer.",
        "Every section is labelled by its own heading through aria-labelledby.",
        "Sections carry stable ids that match the navigation ids in src/content/adflex.ts.",
      ],
    },
    {
      title: "Keyboard and focus",
      items: [
        "The skip link is the first focusable element on both routes and targets #main-content.",
        "The mobile navigation is a real button with aria-expanded; it opens and closes with the keyboard, closes on Escape and closes after a link is chosen.",
        "Focus is always visible: a 3px --adflex-color-primary outline with a 2px offset.",
        "Interactive elements keep an internal target size of at least 44 × 44 CSS pixels.",
      ],
    },
    {
      title: "Colour and motion",
      items: [
        "Text colours were chosen against white for contrast; the interaction teal is darker than the brand teal for exactly this reason.",
        "Yellow and pale blue-grey are decorative only and never carry small text on white.",
        "Nothing is communicated by colour alone: the diagram's red and blue arrow meanings are written out, and the empty state says so in words as well as with a dashed edge.",
        "Smooth scrolling is opted into only under prefers-reduced-motion: no-preference. There is no other animation.",
        "Browser zoom is not disabled and no viewport scaling limits are set.",
      ],
    },
    {
      title: "Content rules",
      items: [
        "Alt text describes what an image conveys; the system diagram's alt text names its parts and both arrow meanings.",
        "Link text is meaningful on its own — no “click here” and no bare URLs.",
        "No ADFLEX fact, statistic, partner detail, publication or funding claim may be added without approved source material.",
        "No fake links, empty downloads or placeholder publications. Where content does not exist yet, the EmptyState component says so.",
      ],
    },
  ],

  scopeNote:
    "This page has been checked against the rules above during development. That is an implementation guardrail, not a formal WCAG audit — no independent accessibility audit has been carried out on this release.",
} as const;
