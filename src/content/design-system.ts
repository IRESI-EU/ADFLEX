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
    lead: "This design system describes how the ADFLEX website is built today. It exists so that a second developer, or a second agency, can extend the site without guessing at colours, spacing or component behaviour. It covers all five routes: the home page, About, Project Outputs, Contact and this page.",
    points: [
      "It documents the current first-release implementation, not a future roadmap.",
      "The production components in src/components are the source of truth. Everything on this page is rendered with those same components and the same scoped CSS tokens as the public site.",
      "It is intentionally lightweight: one CSS token file, a small set of components and no build tooling of its own.",
      "It can grow when the website scope grows. New tokens and components belong here as soon as they are used in production.",
    ],
  },

  bands: {
    lead: "The site alternates between two bands. Light sections carry reading-heavy copy; deep sections carry the supplied imagery, which is uniformly dark navy with cyan glows. Putting those images in a dark band is what makes them read as part of the page rather than as dark rectangles dropped onto it. A third band, the teal accent, is reserved for a call to action.",
    points: [
      "The accent band (.adflex-accent) is a saturated brand teal, used once — the newsletter block that closes the home page. It follows the dark Pilot section, and a second dark band there would read as a tail on the pilot rather than a separate call to action.",
      "It inverts two tokens: primary becomes white and surface becomes the teal, which turns .adflex-cta into a white button with teal text without needing a variant.",
      "There is one set of semantic token names. The .adflex-deep class rebinds them to dark-band values, so a component written with var(--adflex-color-surface) inverts automatically with no extra CSS and no conditional class.",
      "Build components against the semantic tokens — never a literal colour — and they will work in both bands for free.",
      "A few things must stay fixed regardless of band: the header, the footer and the partner cards keep a light surface, because the ADFLEX logo and the partner logos have opaque light backgrounds. The pilot asset icon tiles stay dark for the opposite reason — their artwork is drawn to glow.",
      "The partner cards carry .adflex-light, which rebinds the whole palette back to the light values. That guards them if the consortium section ever becomes a deep band — pinning only the background would leave deep-band text on a white ground.",
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
      hex: "#BCCECB",
      usage: "Tag outlines, empty-state edges and secondary buttons.",
    },
  ],

  deepColours: [
    {
      token: "--adflex-deep-background",
      name: "Deep background",
      hex: "#071523",
      usage: "The dark band itself. Taken from the supplied imagery.",
    },
    {
      token: "--adflex-deep-surface",
      name: "Deep surface",
      hex: "#0E2134",
      usage: "Cards sitting on the dark band.",
    },
    {
      token: "--adflex-deep-surface-soft",
      name: "Deep soft surface",
      hex: "#143049",
      usage: "Tags and secondary fills on the dark band.",
    },
    {
      token: "--adflex-deep-border",
      name: "Deep border",
      hex: "#1E3B54",
      usage: "Card and divider edges on the dark band.",
    },
    {
      token: "--adflex-deep-border-strong",
      name: "Deep strong border",
      hex: "#2C5271",
      usage: "Tag outlines on the dark band.",
    },
    {
      token: "--adflex-deep-ink",
      name: "Deep ink",
      hex: "#F4FAFD",
      usage: "Headings on the dark band.",
    },
    {
      token: "--adflex-deep-text",
      name: "Deep text",
      hex: "#DAE8F1",
      usage: "Body copy on the dark band. Roughly 14:1 on the deep background.",
    },
    {
      token: "--adflex-deep-muted",
      name: "Deep muted",
      hex: "#9CB4C6",
      usage: "Supporting copy on the dark band. Roughly 8:1 on the deep background.",
    },
    {
      token: "--adflex-deep-primary",
      name: "Cyan accent",
      hex: "#4FD1E8",
      usage:
        "Buttons, links, eyebrows and focus rings on the dark band. Taken from the glow in the imagery. Dark bands only — it has nowhere near enough contrast on white.",
    },
    {
      token: "--adflex-deep-primary-hover",
      name: "Cyan accent (hover)",
      hex: "#8CE3F2",
      usage: "Hover state for cyan interactive elements.",
    },
  ],

  typefaces: {
    lead: "Two faces, both self-hosted by next/font at build time — no external requests, no CDN and no runtime dependency. Each stack falls back to a system face if the font files fail to load.",
    faces: [
      {
        token: "--adflex-font-display",
        name: "Sora",
        usage:
          "Headings only. A geometric display face chosen to echo the weight of the ADFLEX wordmark. Weights 600 and 700 are loaded; nothing else.",
      },
      {
        token: "--adflex-font-sans",
        name: "Inter",
        usage:
          "Everything else. Carries the body copy, which runs long in the pilot and about sections.",
      },
    ],
  },

  typography: [
    {
      token: "--adflex-text-3xl",
      value: "clamp(2.25rem, 1.5rem + 3vw, 3.75rem)",
      usage: "h1 — one per page.",
    },
    {
      token: "--adflex-text-2xl",
      value: "clamp(1.75rem, 1.35rem + 1.2vw, 2.25rem)",
      usage: "h2 — section titles.",
    },
    { token: "--adflex-text-xl", value: "1.4375rem", usage: "Hero tagline, section leads, pilot subtitle." },
    { token: "--adflex-text-lg", value: "1.1875rem", usage: "h3 — card titles." },
    { token: "--adflex-text-base", value: "1.0625rem", usage: "Body copy." },
    { token: "--adflex-text-sm", value: "0.9375rem", usage: "Captions, labels, navigation." },
    { token: "--adflex-text-xs", value: "0.8125rem", usage: "Eyebrows, tags and the footer legal row." },
  ],

  spacing: [
    { token: "--adflex-space-1", value: "0.25rem", usage: "Icon and inline gaps." },
    { token: "--adflex-space-2", value: "0.5rem", usage: "Tight stacks, tag gaps." },
    { token: "--adflex-space-3", value: "0.75rem", usage: "Text to text." },
    { token: "--adflex-space-4", value: "1rem", usage: "Inside small blocks." },
    { token: "--adflex-space-5", value: "1.5rem", usage: "Grid gaps." },
    { token: "--adflex-space-6", value: "2.5rem", usage: "Card padding, blocks in a section." },
    { token: "--adflex-space-7", value: "4rem", usage: "Section head to content, sub-page rhythm." },
    { token: "--adflex-space-8", value: "6rem", usage: "Band vertical rhythm on the home page." },
  ],

  radii: [
    { token: "--adflex-radius-sm", value: "6px", usage: "Focus rings, nav links." },
    { token: "--adflex-radius-md", value: "12px", usage: "Buttons, icon tiles, mobile menu panel." },
    { token: "--adflex-radius-lg", value: "18px", usage: "Cards and panels." },
    { token: "--adflex-radius-xl", value: "26px", usage: "Full-width imagery: hero diagram, pilot banner." },
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
      "The diagram's labels are legible at desktop width but not at phone width, and they are not repeated as visible text. Its alt text therefore carries the full description on its own — treat that alt as required content, not decoration.",
      "Diagram red and blue keep their diagram meaning and are never reused as UI colours.",
      "Partner logos are third-party trademarks. Only use a file supplied by the partner or the project coordinator — never one taken from a web search, a logo aggregator, or traced by hand. Each is fitted into a shared box with object-fit: contain, so every lockup keeps its own aspect ratio.",
      "The technology card images and the pilot banner are illustrations, not project evidence. They are not photographs of the pilot and not diagrams of the ADFLEX architecture. Their alt text is empty because the surrounding heading and description already carry the meaning.",
      "Give image frames a fixed aspect-ratio so space is reserved before the image loads and the layout never shifts.",
      "The pilot asset icons sit in a fixed 56px tile with object-fit: contain, so each keeps its own aspect ratio and the rows align. The tile is dark because the icons are drawn as luminous marks that wash out on white. Two of them depict ESB Networks and Arden Energy but are illustrations, not those organisations' logos.",
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
        "Fixed order: tags, h1, tagline, primary call to action, then the full-width diagram and its caption.",
        "The tagline carries an inline glossary term — “flexumers” — that reveals its definition on hover, focus or tap.",
        "The call to action is a NavLink, so it works whether it points at a section anchor or at a route. It currently points at /outputs.",
        "The standalone logo is not repeated in the hero — it is already in the header and inside the diagram.",
        "The diagram's labels are not repeated as visible text, so its alt text is the only place its parts are named — keep that alt complete if the image changes.",
      ],
    },
    {
      title: "Sub-page opening",
      items: [
        "About, Contact and Project Outputs all open with PageHero — a deep band carrying the eyebrow, the page's h1 and an optional lead.",
        "Deep rather than light, so someone landing on a sub-page from search or a shared link arrives in the same site as the home page rather than on a plain white page.",
        "Shared rather than repeated per route, so the three cannot drift apart. Do not hand-roll a page heading.",
        "The design-system page is the exception: it has a sidebar, and a full-bleed band would fight it.",
      ],
    },
    {
      title: "Split section",
      items: [
        "SectionShell takes layout=\"split\", which sets the heading beside the content instead of above it.",
        "Used by the Objective section on the home page: it is a heading, one paragraph and a button, and stacked it left most of the width empty.",
        "Collapses to a single column below 900px.",
      ],
    },
    {
      title: "Image beside text",
      items: [
        "The pilot pairs its image with the narrative in a 1.3fr / 1fr split rather than running the image full width, which kept it to roughly half the height.",
        "The ratio is a balance, not a free choice: widening the image narrows the text column, which makes it taller. At the current copy length the two columns finish within about 24px of each other — re-check that if the copy changes.",
        "Below 900px the split collapses to one column and the ratio stops mattering.",
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
        "Each card has a fixed logo plate holding either the partner's official logo or decorative initials, so names stay on the same baseline whichever is in use. Initials are hidden from assistive technology.",
        "The plate is taller than the wordmarks need. The supplied logos range from 4.25:1 to 0.69:1, and constraining by width alone leaves the portrait crest at about a third of the others' visual area — the extra height is headroom only the crest uses.",
        "Names reserve two lines of height, so a partner whose name wraps does not push its card taller than the others. The grid goes three columns straight to one, because a two-column stage would strand the third partner on its own row.",
      ],
    },
    {
      title: "Sticky header",
      items: [
        "The header is position: sticky at top: 0 with z-index 50 on a white surface.",
        "Its height comes from --adflex-header-height, which is also what every anchored section uses for scroll-margin-top — change the token and both stay aligned.",
        "Below 1080px the navigation collapses behind a button with aria-expanded; above it, the full list is visible. That breakpoint is set by the item count — nine items wrap the header to double height by 1024px, so re-measure it if any are added.",
        "The link for the current route carries aria-current=\"page\" and is drawn with a teal underline. The state is announced as well as shown — colour and a rule alone would leave it invisible to a screen reader.",
        "Only route items are marked. The in-page anchors all live on the home page, so marking by pathname would flag four links at once; knowing which section is in view needs scroll tracking, which is a separate feature.",
        "Navigation items are either a section anchor on the home page or a route of their own. Pages resolve them with resolveNavigation() so anchors become /#section on every route except the home page.",
      ],
    },
    {
      title: "Responsive stacking",
      items: [
        "Breakpoints in use: 1080px (header navigation), 900px (three-column and pilot layouts) and 720px (everything to a single column).",
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
        "Home page sections carry stable ids that match the navigation ids in src/content/adflex.ts. Routes of their own, such as /about, /outputs and /contact, are declared in the same array.",
      ],
    },
    {
      title: "Keyboard and focus",
      items: [
        "The skip link is the first focusable element on both routes and targets #main-content.",
        "The mobile navigation is a real button with aria-expanded; it opens and closes with the keyboard, closes on Escape and closes after a link is chosen.",
        "Focus is always visible: a 3px --adflex-color-primary outline with a 2px offset.",
        "Interactive elements keep an internal target size of at least 44 × 44 CSS pixels. The inline glossary term in the hero is the one exception — a word inside a sentence cannot be padded without breaking the line, which is the recognised inline exception to the rule.",
        "Nothing important is hover-only. The inline glossary term opens on hover, on focus and on tap, closes on Escape, and keeps its definition in the accessibility tree at all times, so it works without a mouse and on a touch screen.",
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
      "Where a page shows a shortened version of longer copy — such as the About glimpse on the home page — the short version is a verbatim extract, cut but never rewritten, so no paraphrased project wording exists on the site.",
      "There is no statistics block, deliberately. Numbers are picked out typographically where they already occur in supplied sentences, which highlights approved copy rather than creating a slot that invites invented impact metrics.",
        "No fake links, empty downloads or placeholder publications. Where content does not exist yet, the EmptyState component says so.",
      "Routes that exist without content — News, Events and the three legal pages — show a visible empty state rather than sample entries. A specimen privacy policy or an invented event date reads as real to whoever lands on it.",
      "Controls that cannot work yet are disabled, not decorative. The contact form and the newsletter button would otherwise accept input and silently discard it, which loses real enquiries without anyone noticing.",
      ],
    },
  ],

  scopeNote:
    "This page has been checked against the rules above during development. That is an implementation guardrail, not a formal WCAG audit — no independent accessibility audit has been carried out on this release.",
} as const;
