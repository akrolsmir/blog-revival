"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type Skin = "gy" | "wp";

// Dark mode → graveyard skin, light mode → WordPress skin. next-themes puts
// skin-gy / skin-wp on <html> before first paint (see globals.css) and tracks
// system preference until the user explicitly picks a side.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" value={{ dark: "skin-gy", light: "skin-wp" }}>
      {children}
    </NextThemesProvider>
  );
}

// undefined until mounted: the server prerenders without knowing the visitor's
// theme, so skinned trees must not render during hydration.
export function useSkin(): Skin | undefined {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return undefined;
  return resolvedTheme === "dark" ? "gy" : "wp";
}

export { useTheme };
