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
 * News & Events.
 *
 * One route, not two. News and Events were separate pages until 30 July 2026;
 * both were empty, so the navigation offered a visitor two dead ends instead of
 * one. The route and layout exist so the team can review them; there is nothing
 * to publish yet, so the page says so rather than showing sample entries.
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

