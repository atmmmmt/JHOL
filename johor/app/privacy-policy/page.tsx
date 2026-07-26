import { buildLegalPageMetadata, renderLegalPage } from "../legal-page-utils";

export async function generateMetadata() {
  return buildLegalPageMetadata("privacy_policy");
}

export default async function PrivacyPolicyPage() {
  return renderLegalPage("privacy_policy");
}
