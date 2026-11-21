"use client";

import { Boxes, FingerprintPattern, Handshake, PenTool } from "lucide-react";
import { advantages } from "@/lib/data";
import { DeviceStory, type StoryStep } from "./capabilities/DeviceStory";
import { whyUsPalettes } from "./capabilities/theme";
import { SectionLabel } from "./Reveal";

const icons = {
  roof: Boxes,
  custom: FingerprintPattern,
  craft: PenTool,
  partner: Handshake,
};

const steps: StoryStep[] = advantages.map((a) => ({ ...a, Icon: icons[a.icon] }));

const loadScreens = () => import("./capabilities/whyScreens").then((m) => m.paintWhyScreen);

/** Why Celestial: four reasons, told on the laptop and phone in turn. */
export function WhyUsStory() {
  return (
    <DeviceStory
      heading={
        <>
          <SectionLabel tone="burgundy">Why Celestial</SectionLabel>
          {/* Full size only on tall screens: on short laptops three lines at 6xl crowd the closed MacBook */}
          <h2
            id="why-us-title"
            className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-5xl [@media(min-width:1024px)_and_(min-height:860px)]:text-6xl"
          >
            Your competitors hire vendors. You get an <span className="text-shine">unfair advantage.</span>
          </h2>
        </>
      }
      sub="Most agencies stop at a single deliverable. Working with us changes how your whole business runs, and that edge keeps growing long after launch."
      steps={steps}
      palettes={whyUsPalettes}
      stepLabel="Advantage"
      topbar={{ short: "Why us", long: "Your unfair advantage" }}
      loadScreens={loadScreens}
    />
  );
}
