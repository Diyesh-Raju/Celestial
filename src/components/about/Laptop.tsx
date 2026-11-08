import { CssText } from "./CssText";

/**
 * Inline laptop for the "What we do" heading, built from CSS planes so it sits in
 * the heading's 3D space: a keyboard deck lying flat toward the viewer, a lid
 * hinged on its back edge (aluminium behind, glass and a live website in front).
 * Sized in em, so it scales with the heading. Styles: "Laptop" in globals.css.
 */
export function Laptop() {
  return (
    <span aria-hidden className="w3d-icon lap">
      <span className="lap-base">
        <span className="lap-leaf lap-shadow" />
        <span className="lap-leaf lap-deck">
          <span className="lap-keys" />
          <span className="lap-pad" />
        </span>
        <span className="lap-leaf lap-lip" />
      </span>

      <span className="lap-lid">
        <span className="lap-leaf lap-back" />
        <span className="lap-leaf lap-front">
          <span className="lap-screen">
            <span className="site">
              <span className="site-nav">
                <span className="site-logo" />
                <CssText t="Celestial" className="site-brand" />
                <span className="site-links">
                  <span />
                  <span />
                  <span />
                </span>
                <CssText t="Start a project" className="site-cta" />
              </span>

              <span className="site-hero">
                <CssText t="● Booking Q1" className="site-tag" />
                <CssText t="Software that" className="site-h" />
                <CssText t="grows with you." className="site-h site-h-accent" />
                <span className="site-p" />
                <span className="site-p site-p-short" />
                <span className="site-btns">
                  <CssText t="Book a call" className="site-btn" />
                  <CssText t="Our work" className="site-btn site-btn-ghost" />
                </span>
              </span>

              <span className="site-orb">
                <span className="site-ring" />
              </span>
              <span className="site-stat">
                <CssText t="+182%" className="site-stat-n" />
                <CssText t="qualified leads" className="site-stat-l" />
              </span>

              <span className="site-logos">
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
            </span>
            <span className="lap-glare" />
            <span className="lap-off" />
          </span>
          <span className="lap-cam" />
        </span>
      </span>
    </span>
  );
}
