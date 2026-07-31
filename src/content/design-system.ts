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
    lead: "The palette is white, mild grey and the green taken from the logo. Reading sections sit on white; emphasis bands shift one step in tone to give the page rhythm; and a single saturated green band is reserved for a call to action. The site is light-only — there is no dark mode.",
    points: [
      "There is one set of semantic token names. Two things rebind them and nothing else should: the emphasis band (.adflex-band) and the forced-light island (.adflex-light).",
      "A component written with var(--adflex-color-surface) therefore works in all three with no extra CSS and no conditional class. Build against the semantic tokens — never a literal colour — and this comes for free.",
      "The emphasis band is a soft green-grey tint rather than a dark block. In a light design a band earns its separation by shifting tone slightly, not by inverting.",
      "There was a third, .adflex-accent — a saturated green call-to-action band. It existed only for the newsletter block, which was removed on 30 July 2026, so the band went with it rather than staying as an unused palette.",
      "A few things must stay fixed regardless of the band around them, because the supplied artwork is fixed. The ADFLEX logo file is opaque and has no alpha channel at all, so it is always given a white plate. The partner logos are drawn for a light ground, so their cards carry .adflex-light. The pilot icons are dark navy line art, so their tiles are pinned light for the same reason.",
      ".adflex-light pins the whole palette to the fixed --adflex-l-* values rather than the semantic ones, so no enclosing band can reach into it. Pinning only the background would leave band text colours on a white ground.",
    ],
  },

  colours: [
    {
      token: "--adflex-color-ink",
      name: "Ink",
      hex: "#0D1A18",
      usage: "Headings. Near-black with a green cast rather than a blue one.",
    },
    {
      token: "--adflex-color-text",
      name: "Text",
      hex: "#1F2B29",
      usage: "Body copy. Roughly 14.6:1 on white.",
    },
    {
      token: "--adflex-color-muted",
      name: "Muted text",
      hex: "#54625F",
      usage: "Supporting copy, captions and labels. Roughly 6.4:1 on white.",
    },
    {
      token: "--adflex-color-primary",
      name: "Interaction green",
      hex: "#046B60",
      usage:
        "Buttons, links and focus rings. Darker than the logo green so white text on it reaches roughly 6.4:1.",
    },
    {
      token: "--adflex-color-primary-hover",
      name: "Interaction green (hover)",
      hex: "#03554C",
      usage: "Hover and active states for primary actions.",
    },
    {
      token: "--adflex-color-brand",
      name: "Logo green",
      hex: "#08867A",
      usage:
        "The dominant colour of the logo mark, sampled from the file itself. Decorative rules and numeric marks. 4.47:1 on white, so it is never used for body text.",
    },
    {
      token: "--adflex-color-brand-soft",
      name: "Pale blue-grey",
      hex: "#8AA4BC",
      usage:
        "From the logo tagline. Decorative only — never used for body text.",
    },
    {
      token: "--adflex-color-accent",
      name: "Energy yellow",
      hex: "#FEC003",
      usage:
        "From the logo bolt. 1.65:1 on white, so it is decorative only and never small text on a light ground.",
    },
    {
      token: "--adflex-color-background",
      name: "Page background",
      hex: "#F6F8F7",
      usage: "Default page background. A mild grey, barely off white.",
    },
    {
      token: "--adflex-color-surface",
      name: "Surface",
      hex: "#FFFFFF",
      usage: "Cards, header and footer.",
    },
    {
      token: "--adflex-color-surface-soft",
      name: "Soft surface",
      hex: "#EEF1F0",
      usage: "Secondary fills and tags.",
    },
    {
      token: "--adflex-color-border",
      name: "Border",
      hex: "#E0E5E3",
      usage: "Card and divider hairlines.",
    },
    {
      token: "--adflex-color-border-strong",
      name: "Strong border",
      hex: "#8D9C98",
      usage:
        "Tag outlines, empty-state edges and secondary buttons. Roughly 2.9:1 on white, so controls that use it keep a text label as well.",
    },
  ],

  bandColours: [
    {
      token: "--adflex-band-background",
      name: "Band background",
      hex: "#E9F2F0",
      usage: "The emphasis band itself. A soft green-grey tint of the page.",
    },
    {
      token: "--adflex-band-surface",
      name: "Band surface",
      hex: "#FFFFFF",
      usage: "Cards sitting on the band.",
    },
    {
      token: "--adflex-band-surface-soft",
      name: "Band soft surface",
      hex: "#DFECE9",
      usage: "Tags and secondary fills on the band.",
    },
    {
      token: "--adflex-band-border",
      name: "Band border",
      hex: "#CADEDB",
      usage: "Card and divider edges on the band.",
    },
    {
      token: "--adflex-band-border-strong",
      name: "Band strong border",
      hex: "#8FB3AD",
      usage: "Tag outlines on the band.",
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
      "Do not place it directly on a dark colour. The file is opaque, so it is always given a white plate — in dark mode that plate is what stops it reading as a stray white rectangle.",
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
      "The pilot assets are cards with a 3:2 illustration above the label, not glyphs beside it. The supplied files are 1536 by 1024 artworks on their own opaque grounds, and a square glyph tile letterboxed them into an unreadable sliver. Two of them depict ESB Networks and Arden Energy but are illustrations, not those organisations' logos.",
      "The system diagram is supplied on its own pale ground, which is close in tone to the band behind it. It therefore carries a hairline border and a radius, so it reads as a deliberate figure rather than as a patch of slightly different background.",
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
        "About, Contact and Project Outputs all open with PageHero — an emphasis band carrying the eyebrow, the page's h1 and an optional lead.",
        "A band rather than the plain page colour, so someone landing on a sub-page from search or a shared link arrives in the same site as the home page rather than on a blank white page.",
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
      title: "Motion",
      items: [
        "Content lifts 16px and fades in as it enters the viewport, over 420ms. Groups stagger 60 to 110ms apart so a section reads as heading-then-detail rather than everything landing at once.",
        "One IntersectionObserver handles the whole document. Server components add a data-reveal attribute — a string in the markup — so no part of the page tree has to become client-rendered in order to animate.",
        "Elements are revealed once and then unobserved. Content that has already been read should not fade out again on the way back up.",
        "The hidden state is gated on an adflex-js class that an inline script adds during head parse. Without JavaScript nothing is ever hidden, so the page is a normal static page rather than a blank one; with it, the pre-reveal state is already correct on the first frame, so nothing flashes visible and then jumps.",
        "The hero illustration is decorative inline SVG with CSS-only motion: dashes crawl along the data and energy flows, a band scans down the twin, and the spine hub pulses. It is aria-hidden and states nothing the copy and the supplied diagram do not.",
        "The twin's massing is the same <use> of the same <g> as the physical building, so the two silhouettes cannot drift apart. Maintaining them as separate drawings would let the picture quietly start telling a lie about what a digital twin is.",
        "Hover responses are around 150 to 200ms; card artwork zooms under 4%, which is the point past which the illustrations start losing their edges.",
        "Everything above is inside prefers-reduced-motion: no-preference, and the observer also checks the query directly so no work is scheduled at all when reduced motion is on.",
      ],
    },
    {
      title: "Sticky header",
      items: [
        "The header is position: sticky at top: 0 with z-index 50. The logo inside it always keeps its own white plate, because the logo file is opaque.",
        "Once the page has scrolled past 8px the bar tightens by 12px and gains a shadow. At the very top it sits flush on the hero band and needs no edge; with content running underneath, it does. The scroll listener is passive and reads through requestAnimationFrame, so it never does layout work in the scroll handler itself.",
        "Its height comes from --adflex-header-height, which is also what every anchored section uses for scroll-margin-top — change the token and both stay aligned.",
        "Below 1080px the navigation collapses behind a button with aria-expanded; above it, the full list is visible. That breakpoint is set by the item count — nine items wrap the header to double height by 1024px, so re-measure it if any are added.",
        "The link for the current route carries aria-current=\"page\" and is drawn with a green underline. The state is announced as well as shown — colour and a rule alone would leave it invisible to a screen reader.",
        "The theme control sits outside the nav landmark: switching theme is not navigation and should not read as one more menu item. Below 420px its word is dropped and the glyph carries it, with the aria-label keeping the control named.",
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
        "Every foreground and background pair was checked against WCAG AA in both themes before the palette was committed; the interaction green is darker than the logo green for exactly this reason.",
        "Yellow and pale blue-grey are decorative only and never carry small text on a light ground.",
        "Nothing is communicated by colour alone: the diagram's red and blue arrow meanings are written out, and the empty state says so in words as well as with a dashed edge.",
        "Every animation on the site sits inside prefers-reduced-motion: no-preference — smooth scrolling, the scroll reveals, the hero network, the card hovers and the header's condense. Switch reduced motion on and the site is entirely still.",
        "Motion never carries meaning. Everything it does is decorative, so nothing is lost when it is off.",
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
      "A route that exists without content — News & Events — shows a visible empty state rather than sample entries. An invented event date reads as real to whoever lands on it.",
      "The three legal pages carry the supplied draft wording verbatim, held as structured blocks rather than markup so it can be checked against the source line by line. Each states above the text that it is a draft, and square-bracketed placeholders are shown as supplied — never linked, and never filled in with a guess.",
      "Controls that cannot work yet are disabled, not decorative. The contact form would otherwise accept input and silently discard it, which loses real enquiries without anyone noticing.",
      ],
    },
  ],

  scopeNote:
    "This page has been checked against the rules above during development. That is an implementation guardrail, not a formal WCAG audit — no independent accessibility audit has been carried out on this release.",
} as const;
