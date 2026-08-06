import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { canonical } from "@/lib/site";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import { LegalDocument } from "@/components/LegalDocument";

const { brand, navigation, legal } = adflexContent;

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
    title: page.title,
    description: page.pageDescription,
    ...canonical(`/legal/${page.slug}`),
  };
}

/**
 * Privacy, cookies and terms.
 *
 * The wording is the supplied draft, reproduced verbatim from
 * `ADFLEX_Legal_Pages_Draft_v2.docx` and held as structured blocks in
 * `src/content/adflex.ts`. It is not ours to edit, shorten or tidy — including
 * the square-bracketed placeholders still in it, which are shown as supplied
 * rather than filled in with a guess.
 *
 * Each page states above the text that it is a draft, so a reader is never left
 * to assume they are looking at settled policy.
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
        <LegalDocument status={page.status} blocks={page.blocks} />
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}
