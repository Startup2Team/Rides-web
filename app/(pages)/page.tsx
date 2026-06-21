import Hero from "../components/hero";
import HowItWorks from "../components/landing/how-it-works";
import Vehicles from "../components/landing/vehicles";
import ForRiders from "../components/landing/for-riders";
import Safety from "../components/landing/safety";
import CTA from "../components/landing/cta";
import Footer from "../components/footer";

export default function Home() {
  return (
    <main className="rides flex-1">
      <Hero />
      <HowItWorks />
      <Vehicles />
      <ForRiders />
      <Safety />
      <CTA />
      <Footer />
    </main>
  );
}
