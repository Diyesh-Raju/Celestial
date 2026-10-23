import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Marquee } from "@/components/Marquee";
import { Notebook } from "@/components/Notebook";
import { Process } from "@/components/Process";
import { Reviews } from "@/components/Reviews";
import { Services } from "@/components/Services";
import { Standards } from "@/components/Standards";
import { Work } from "@/components/Work";
import { WhyUs } from "@/components/WhyUs";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main>
        <Hero />
        <Notebook />
        <Marquee />
        <Services />
        <WhyUs />
        <Process />
        <Faq />
        <Standards />
        <Reviews />
        <Work blend />
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
}
