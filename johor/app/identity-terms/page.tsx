import { buildLegalPageMetadata, renderLegalPage } from "../legal-page-utils";

export async function generateMetadata() {
  return buildLegalPageMetadata("identity_terms_conditions");
}

export default async function IdentityTermsPage() {
  return renderLegalPage("identity_terms_conditions");
}
