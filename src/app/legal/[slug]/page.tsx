import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import { AwaitingContent } from "@/components/AwaitingContent";

const { brand, navigation, legal, contact } = adflexContent;

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

/** One route for all three pages, so they cannot drift apart. */
export function generateStaticParams() {
  return legal.pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = legal.pages.find((item) => item.slug === slug);
  if (!page) return {};

  return {
    title: `${page.title} — ADFLEX`,
    description: page.pageDescription,
  };
}

/**
 * Privacy, cookies and terms.
 *
 * Every one is deliberately empty. Legal text has to be written or approved by
 * whoever carries the liability for it — publishing specimen wording on an
 * EU-funded project site would be worse than publishing nothing, because a
 * reader has no way to tell it is not the real policy.
 */
export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = legal.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const nav = resolveNavigation(navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow={page.eyebrow} title={page.title} />
        <AwaitingContent page={page} contact={contact} />
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}
