import Hero from "../components/hero";
import Features from "../components/features";
import HowItWorks from "../components/how-it-works";
import SmartMobility from "../components/smart-mobility";
import FAQ from "../components/faq";
import FinalCTA from "../components/final-cta";

export default function Home() {
  return (
    <main className="rides flex-1">
      <Hero />
      <Features />
      <HowItWorks />
      <SmartMobility />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
