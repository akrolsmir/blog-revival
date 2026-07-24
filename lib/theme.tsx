"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

export type Skin = "gy" | "wp";

const SkinContext = createContext<Skin | undefined>(undefined);

// Dark mode → graveyard skin, light mode → WordPress skin. next-themes puts
// skin-gy / skin-wp on <html> before first paint (see globals.css) and tracks
// system preference until the user explicitly picks a side.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" value={{ dark: "skin-gy", light: "skin-wp" }}>
      <SkinGate>{children}</SkinGate>
    </NextThemesProvider>
  );
}

// The single "have we mounted yet?" gate for the whole app. It has to live here,
// above the router, rather than inside useSkin(): a component with its own
// mounted state renders null on its first render, and a page that renders null
// on the render right after a navigation defeats Next's scroll-to-top (its
// layout-router finds no DOM node for the new segment and silently skips the
// segment, leaving you at the old page's scroll offset). Mounted here once, the
// value is already resolved for every page that mounts later.
function SkinGate({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const skin: Skin | undefined = !mounted ? undefined : resolvedTheme === "dark" ? "gy" : "wp";
  return <SkinContext.Provider value={skin}>{children}</SkinContext.Provider>;
}

// undefined until mounted: the server prerenders without knowing the visitor's
// theme, so skinned trees must not render during hydration. After the first
// mount it never goes back to undefined.
export function useSkin(): Skin | undefined {
  return useContext(SkinContext);
}

export { useTheme };
