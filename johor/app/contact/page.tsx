import { getSeoDescriptions, getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import ContactPage from "../../src/page-components/contact-page";

const CONTACT_DESCRIPTION =
  "تواصل مع جهور لمناقشة هدفك وميزانيتك الإعلانية، وإطلاق حملة تصل إلى الجمهور المناسب مع متابعة وتحسين وقياس واضح للنتائج.";

export async function generateMetadata() {
  const [site, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);

  return buildPageMetadata({
    description: seoDescs["/contact"]?.trim() || CONTACT_DESCRIPTION,
    image: {
      alt: site.global.header.logo.alt,
      url: site.global.header.logo.image,
    },
    path: "/contact",
    title: "تواصل معنا | جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <ContactPage
      form={site.pages.contact.form}
      hero={site.pages.contact.hero}
    />
  );
}
