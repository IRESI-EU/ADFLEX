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

const { brand, navigation, news } = adflexContent;

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

  /*
   * News and events are stored in one table and shown in two sections.
   *
   * They are genuinely different things to a reader — an event is something to
   * turn up to on a date, a news post is something that already happened — and
   * interleaving them by date buried the next event among older announcements.
   *
   * A section only appears when it has entries, so the page never shows an
   * "Events" heading above nothing.
   */
  const events = items.filter((item) => item.kind === "event");
  const posts = items.filter((item) => item.kind === "news");

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow={news.eyebrow} title={news.title} />

        {items.length > 0 ? (
          <div className={newsStyles.body}>
            <div className="adflex-container">
              {events.length > 0 ? (
                <section className={listStyles.section} aria-labelledby="events-heading">
                  <h2 id="events-heading" className={listStyles.sectionTitle}>
                    Events
                  </h2>
                  <div className={listStyles.sectionList}>
                    <NewsList items={events} />
                  </div>
                </section>
              ) : null}

              {posts.length > 0 ? (
                <section className={listStyles.section} aria-labelledby="news-heading">
                  <h2 id="news-heading" className={listStyles.sectionTitle}>
                    News
                  </h2>
                  <div className={listStyles.sectionList}>
                    <NewsList items={posts} />
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        ) : (
          <AwaitingContent page={news} />
        )}
      </main>
      <AdflexFooter logo={brand.logo} />
    </>
  );
}

