export const dynamic = "force-static";
import BriefPageClient from "../../../src/page-components/brief-page";

export default function Page() {
  return <BriefPageClient />;
}

// Static export: generate one catch-all shell; token is read client-side
export function generateStaticParams() {
  return [{ token: "__shell__" }];
}
