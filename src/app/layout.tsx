import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { adflexContent } from "@/content/adflex";
import { siteUrl } from "@/lib/site";
import { MotionScript } from "@/components/MotionScript";
import { RevealObserver } from "@/components/RevealObserver";
import "@/styles/adflex-tokens.css";
import "./globals.css";

/**
 * Both faces are self-hosted by next/font at build time — no external requests,
 * no CDN, no runtime dependency.
 *
 * Sora is a geometric display face that echoes the weight of the ADFLEX
 * wordmark; Inter carries the body copy, which is long-form in places.
 */
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Site-wide metadata.
 *
 * `title.template` is what every other route's `title` is slotted into, so a
 * page sets `title: "About ADFLEX"` and gets "About ADFLEX — ADFLEX". Each page
 * used to spell out the `— ADFLEX` suffix itself, in eight separate files, and
 * changing the site's name meant finding all eight. `title.default` is the home
 * page, which has no suffix because its title already ends in the project name.
 *
 * `metadataBase` is only set when a site URL has been configured — see
 * `siteUrl()` for why an invented domain is worse than none.
 *
 * ---------------------------------------------------------------------------
 * TWO THINGS DELIBERATELY NOT SET HERE
 * ---------------------------------------------------------------------------
 * **No `alternates.canonical`.** Metadata is merged shallowly from the root
 * down, so a canonical set here becomes the canonical of every route that does
 * not override it — which had `/design-system` and the 404 page both declaring
 * the home page as their canonical address. Each page names its own with
 * `canonical()`; a page with none is a page that should not have one.
 *
 * **No `openGraph.url`.** A page that defines `openGraph` *replaces* this whole
 * object rather than merging into it, so giving each page its own `og:url`
 * would cost it `og:site_name`, `og:type` and `og:locale`. One shared `og:url`
 * pointing at the home page from every route is worse than none at all, and
 * `og:url` is optional — a reader that needs the address already has it.
 */
const base = siteUrl();

export const metadata: Metadata = {
  ...(base ? { metadataBase: base } : {}),
  title: {
    default: adflexContent.meta.title,
    template: "%s — ADFLEX",
  },
  description: adflexContent.meta.description,
  applicationName: "ADFLEX",
  openGraph: {
    type: "website",
    siteName: "ADFLEX",
    locale: "en_IE",
    title: adflexContent.meta.title,
    description: adflexContent.meta.description,
  },
  /*
   * No `openGraph.images`. A share card is a designed asset and none has been
   * supplied; pointing this at the wordmark would produce a 1200x630 card that
   * is mostly white space. Recorded in docs/OPEN-ITEMS.md as artwork still
   * needed from the project team.
   */
};


/**
 * The `.adflex-scope` wrapper carries every ADFLEX design token, so every route
 * is styled from one scoped source and nothing leaks to `:root`.
 * The skip link lives here so it is the first focusable element on every route.
 *
 * `suppressHydrationWarning` is on `<html>` because `MotionScript` adds the
 * `adflex-js` class to that element before React hydrates. The server cannot
 * know whether JavaScript will run, so that class legitimately differs between
 * the server markup and the DOM. It is scoped to this one element and does not
 * extend to any children.
 *
 * `data-scroll-behavior="smooth"` is **not decorative**. globals.css sets
 * `scroll-behavior: smooth` on `<html>` so anchor jumps animate, and without
 * this attribute Next cannot suspend that during a route change — so moving
 * from one page to another scrolled the whole document instead of jumping,
 * which reads as the new page sliding or lagging into place. The attribute is
 * how Next is told it may switch smooth scrolling off for the transition and
 * back on afterwards.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <MotionScript />
      </head>
      <body>
        <div className="adflex-scope">
          <a className="adflex-skip-link" href="#main-content">
            {adflexContent.meta.skipLinkLabel}
          </a>
          {children}
        </div>
        <RevealObserver />
      </body>
    </html>
  );
}
