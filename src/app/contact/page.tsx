import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { ContactBlock } from "@/components/ContactBlock";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import styles from "./contact.module.css";

const { brand, navigation, contact, contactForm } = adflexContent;

export const metadata: Metadata = {
  title: `${contact.title} â€” ADFLEX`,
  description: contact.pageDescription,
};

/**
 * Contact details on their own route.
 *
 * Section anchors in the navigation only resolve on the home page, so they are
 * resolved here with `onHome: false`.
 */
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
            <ContactForm form={contactForm} />
          </div>
        </div>
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}

