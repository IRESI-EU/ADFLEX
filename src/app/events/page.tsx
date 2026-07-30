import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import { AwaitingContent } from "@/components/AwaitingContent";

const { brand, navigation, events, contact } = adflexContent;

export const metadata: Metadata = {
  title: `${events.title} â€” ADFLEX`,
  description: events.pageDescription,
};

/**
 * Events.
 *
 * The route and layout exist so the team can review them; nothing has been
 * scheduled and published yet, so the page says so rather than listing sample
 * events with invented dates.
 */
export default function EventsPage() {
  const nav = resolveNavigation(navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow={events.eyebrow} title={events.title} />
        <AwaitingContent page={events} contact={contact} />
      </main>
      <AdflexFooter logo={brand.logo} />
    </>
  );
}

