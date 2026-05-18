// Bare-bones wrapper for print/brochure routes.
// This does NOT include the HTML shell — the root layout provides that.
// We just suppress the navbar/footer/promo via CSS here.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
