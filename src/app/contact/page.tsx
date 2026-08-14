import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { canonical } from "@/lib/site";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { ContactBlock } from "@/components/ContactBlock";
import { PageHero } from "@/components/PageHero";
import styles from "./contact.module.css";

const { brand, navigation, contact } = adflexContent;

export const metadata: Metadata = {
  title: contact.title,
  description: contact.pageDescription,
  ...canonical("/contact"),
};

/** Static contact details; enquiries use the published mailto address. */
export default function ContactPage() {
  const nav = resolveNavigation(navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero
          eyebrow="Get in touch"
          title={contact.title}
          lead={contact.intro}
        />

        <div className={styles.body}>
          <div className={`adflex-container ${styles.layout}`}>
            <ContactBlock contact={contact} showIntro={false} />
          </div>
        </div>
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}