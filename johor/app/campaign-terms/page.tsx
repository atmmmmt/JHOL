import { buildLegalPageMetadata, renderLegalPage } from "../legal-page-utils";

export async function generateMetadata() {
  return buildLegalPageMetadata("campaign_terms_conditions");
}

export default async function CampaignTermsPage() {
  return renderLegalPage("campaign_terms_conditions");
}
