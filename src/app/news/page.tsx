import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import { AwaitingContent } from "@/components/AwaitingContent";

const { brand, navigation, news, contact } = adflexContent;

export const metadata: Metadata = {
  title: `${news.title} â€” ADFLEX`,
  description: news.pageDescription,
};

/**
 * News & Updates.
 *
 * The route and layout exist so the team can review them; there is nothing to
 * publish yet, so the page says so rather than showing sample posts.
 */
export default function NewsPage() {
  const nav = resolveNavigation(navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow={news.eyebrow} title={news.title} />
        <AwaitingContent page={news} contact={contact} />
      </main>
      <AdflexFooter logo={brand.logo} />
    </>
  );
}

