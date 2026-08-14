import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { canonical } from "@/lib/site";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import { AwaitingContent } from "@/components/AwaitingContent";
import { NewsList } from "@/components/PublishedList";
import listStyles from "@/components/PublishedList.module.css";
import newsStyles from "./news.module.css";
import { isEvent, newsItems } from "@/content/published";

const { brand, navigation, news } = adflexContent;

export const metadata: Metadata = {
  title: news.title,
  description: news.pageDescription,
  ...canonical("/news"),
};

/** News and events published from the Git-backed content file. */
export default function NewsPage() {
  const nav = resolveNavigation(navigation, { onHome: false });
  const events = newsItems.filter((item) => isEvent(item.kind));
  const posts = newsItems.filter((item) => item.kind === "news");

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow={news.eyebrow} title={news.title} />

        {newsItems.length > 0 ? (
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