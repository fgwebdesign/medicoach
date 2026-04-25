import { SiteHeader } from "@/components/layout/site-header";
import { MarketingPageMain } from "@/components/layout/marketing-page-main";
import { LandingView } from "@/components/features/landing/landing-view";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <MarketingPageMain>
        <LandingView />
      </MarketingPageMain>
    </>
  );
}
