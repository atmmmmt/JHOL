"use client";

import type { ContactFormContent, ContactHeroContent } from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import ContactContentSections from "../components/sections/contact-sections/contact-content-sections";
import ContactDirectInfoSection from "../components/sections/contact-sections/contact-direct-info-section";
import ContactHeroSection from "../components/sections/contact-sections/contact-hero";
import FormContact from "../components/sections/contact-sections/form-contact";
import { reviseContentSection } from "../lib/client-content-revision";

type ContactPageProps = {
  form: ContactFormContent;
  hero: ContactHeroContent;
};

function ContactPage({ form, hero }: ContactPageProps) {
  const revisedForm = reviseContentSection("contact_form", form);
  const revisedHero = reviseContentSection("contact_hero", hero);

  return (
    <>
      <ContactHeroSection content={revisedHero} />
      <ContactContentSections content={revisedHero} />
      <ContactDirectInfoSection />
      <FormContact content={revisedForm} />
      <AboutStartJourneySection
        content={revisedHero}
        journey={revisedHero.startToday}
        sectionKey="contact_hero"
        journeyKey="startToday"
      />
    </>
  );
}

export default ContactPage;
