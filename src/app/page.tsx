import { About } from "@/components/About";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Process } from "@/components/Process";
import { Reviews } from "@/components/Reviews";
import { Services } from "@/components/Services";
import { SlideOver } from "@/components/SlideOver";
import { Studio } from "@/components/Studio";
import { WhyUs } from "@/components/WhyUs";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main>
        <Hero />
        {/* The Studio banner rises over the bottom of About (desktop) */}
        <SlideOver under={<About />}>
          <Studio />
        </SlideOver>
        <WhyUs />
        <Services />
        <Process />
        <Faq />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
