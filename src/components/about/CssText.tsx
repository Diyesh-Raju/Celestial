/**
 * Decorative text painted by CSS (`.css-text::before`, from `data-t`). The mock
 * website and sales card sit inside the "What we do" heading, and text drawn this
 * way stays out of the heading's text content for search engines and screen readers.
 */
export function CssText({ t, className = "" }: { t: string; className?: string }) {
  return <span data-t={t} className={`css-text ${className}`} />;
}
