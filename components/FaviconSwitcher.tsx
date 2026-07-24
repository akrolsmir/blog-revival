"use client";

import { useSkin } from "@/lib/theme";

// Owns the tab icon. The skin is only known client-side (next-themes reads
// localStorage), so this renders the skin-neutral /icon-auto.svg during SSR and
// hydration — that file picks a mark from the OS color scheme, so it is already
// correct unless the visitor chose the skin opposing their system preference.
//
// The <link>s are rendered declaratively (React 19 hoists them into <head>)
// rather than by mutating the ones app/layout.tsx's metadata emits: rewriting a
// React-owned node makes React re-insert the original, leaving two competing
// rel="icon" links. Both rel="icon" links live here — and not in
// metadata.icons — so their relative order is guaranteed: browsers take the
// last icon whose format they support, so the SVG must follow the .ico.
export function FaviconSwitcher() {
  const skin = useSkin();

  return (
    <>
      <link rel="icon" href="/favicon.ico" sizes="48x48" />
      <link rel="icon" type="image/svg+xml" href={skin ? `/icon-${skin}.svg` : "/icon-auto.svg"} />
    </>
  );
}
