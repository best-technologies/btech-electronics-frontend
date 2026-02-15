import { HeroSection } from "@/landing-page/sections/hero/HeroSection";
import { TrustBarSection } from "@/landing-page/sections/trust-bar/TrustBarSection";
import { WhoWeAreSection } from "@/landing-page/sections/who-we-are/WhoWeAreSection";
import { CategoriesSection } from "@/landing-page/sections/categories/CategoriesSection";
import { WhyPartnerSection } from "@/landing-page/sections/why-partner/WhyPartnerSection";
import { HowItWorksSection } from "@/landing-page/sections/how-it-works/HowItWorksSection";
import { LocationSection } from "@/landing-page/sections/location/LocationSection";
import { FinalCtaSection } from "@/landing-page/sections/final-cta/FinalCtaSection";

export default function Home() {
  return (
    <main>
        <HeroSection />
        <TrustBarSection />
        <CategoriesSection />
        <WhoWeAreSection />
        <WhyPartnerSection />
        <HowItWorksSection />
        <LocationSection />
        <FinalCtaSection />
      </main>
  );
}
