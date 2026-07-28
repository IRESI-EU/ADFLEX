import type { Metadata } from "next";
import { adflexContent } from "@/content/adflex";
import "@/styles/adflex-tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: adflexContent.meta.title,
  description: adflexContent.meta.description,
};

/**
 * The `.adflex-scope` wrapper carries every ADFLEX design token, so both
 * routes are styled from one scoped source and nothing leaks to `:root`.
 * The skip link lives here so it is the first focusable element on both routes.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="adflex-scope">
          <a className="adflex-skip-link" href="#main-content">
            {adflexContent.meta.skipLinkLabel}
          </a>
          {children}
        </div>
      </body>
    </html>
  );
}
