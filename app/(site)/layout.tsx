"use client";

import { useSkin } from "@/lib/theme";
import { GyShell } from "@/components/graveyard/Shell";
import { WpShell } from "@/components/wordpress/Shell";
import { ThemeFab } from "@/components/ThemeFab";

// One route tree, two skins: dark mode gets the graveyard, light mode gets
// the 2005 WordPress pastiche. Until the theme resolves client-side we render
// nothing — html.skin-* (set pre-paint) keeps the background correct.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const skin = useSkin();
  if (!skin) return null;
  return (
    <>
      {skin === "gy" ? (
        <GyShell>{children}</GyShell>
      ) : (
        <WpShell>{children}</WpShell>
      )}
      <ThemeFab />
    </>
  );
}
