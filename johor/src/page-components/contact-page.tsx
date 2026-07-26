"use client";

import type { ContactFormContent, ContactHeroContent } from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import ContactContentSections from "../components/sections/contact-sections/contact-content-sections";
import ContactDirectInfoSection from "../components/sections/contact-sections/contact-direct-info-section";
import ContactHeroSection from "../components/sections/contact-sections/contact-hero";
import FormContact from "../components/sections/contact-sections/form-contact";

type ContactPageProps = {
  form: ContactFormContent;
  hero: ContactHeroContent;
};

function ContactPage({ form, hero }: ContactPageProps) {
  return (
    <>
      <ContactHeroSection content={hero} />
      <ContactContentSections content={hero} />
      <ContactDirectInfoSection />
      <FormContact content={form} />
      <AboutStartJourneySection
        content={hero}
        journey={hero.startToday}
        sectionKey="contact_hero"
        journeyKey="startToday"
      />
    </>
  );
}

export default ContactPage;
