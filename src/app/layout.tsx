import type { Metadata } from "next";
import { Anton, Inter, Montserrat } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

// Apple devices render the system font (SF Pro); Inter is the fallback
// everywhere else. See --font-sans / --font-display in globals.css.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Condensed display face for poster-style headlines (see --font-condensed)
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

// Wordmark face ("CELESTIAL CO."), see --font-brand
const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Celestial Corporation — Websites, CRMs & Growth Ads",
  description:
    "Celestial Corporation builds high-performance websites, custom CRMs and Meta & Google ad systems that turn scattered work into one connected growth engine.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${anton.variable} ${montserrat.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: enables scroll-reveal styles only when JS works,
            and reveals everything after 3s if the Reveal components never hydrate. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add("js");setTimeout(function(){if(!window.__revealReady)d.classList.add("reveal-all")},3000)})();`,
          }}
        />
      </head>
      <body className="grain min-h-full bg-paper font-sans text-ink">
        {/* Lives in the layout so the open menu survives page changes: menu links
            navigate underneath it, then it lifts to reveal the new page */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
