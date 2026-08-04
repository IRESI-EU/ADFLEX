import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import { AwaitingContent } from "@/components/AwaitingContent";
import { NewsList } from "@/components/PublishedList";
import listStyles from "@/components/PublishedList.module.css";
import newsStyles from "./news.module.css";
import { listPublishedNews } from "@/lib/repo";

const { brand, navigation, news, contact } = adflexContent;

export const metadata: Metadata = {
  title: `${news.title} — ADFLEX`,
  description: news.pageDescription,
};

/**
 * News & Events.
 *
 * One route, not two. News and Events were separate pages until 30 July 2026;
 * both were empty, so the navigation offered a visitor two dead ends instead of
 * one.
 *
 * Editor-managed since 31 July 2026. `AwaitingContent` is still here and still
 * the default: the read goes through `safeRead`, so a missing database, an
 * unreachable one, or nothing published yet all show the same honest empty
 * state. **It must stay that way** — the standing rule on this route is that a
 * placeholder post or an invented event date reads as real the moment someone
 * lands on it, and on a publicly funded project site that is a false statement
 * rather than a design detail.
 */
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const nav = resolveNavigation(navigation, { onHome: false });
  const items = await listPublishedNews();

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow={news.eyebrow} title={news.title} />

        {items.length > 0 ? (
          <div className={newsStyles.body}>
            <div className={`adflex-container ${listStyles.sectionList}`}>
              <h2 className="adflex-visually-hidden">Published news and events</h2>
              <NewsList items={items} />
            </div>
          </div>
        ) : (
          <AwaitingContent page={news} contact={contact} />
        )}
      </main>
      <AdflexFooter logo={brand.logo} />
    </>
  );
}

