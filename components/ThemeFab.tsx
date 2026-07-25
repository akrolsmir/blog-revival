"use client";

import { useSkin, useTheme } from "@/lib/theme";

// The theme switcher: fixed corner toggle, identical position in both skins.
// Rendered outside the .gy/.wp wrappers, so styled purely inline.
export function ThemeFab() {
  const skin = useSkin();
  const { setTheme } = useTheme();
  if (!skin) return null;
  return skin === "gy" ? (
    <button
      onClick={() => setTheme("light")}
      aria-label="Switch to light mode"
      title="Return to daylight (light mode)"
      className="fixed bottom-5 right-5 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gold/50 bg-night/90 text-lg text-candle shadow-[0_0_20px_rgba(230,184,92,.25)] hover:bg-gold/10"
    >
      <span aria-hidden="true">☀</span>
    </button>
  ) : (
    <button
      onClick={() => setTheme("dark")}
      aria-label="Switch to dark mode"
      title="Visit the graveyard (dark mode)"
      className="fixed bottom-5 right-5 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#9b9b95] bg-gradient-to-b from-[#fbfbfa] to-[#dcdcd7] text-lg shadow-md hover:from-white hover:to-[#e6e6e1]"
    >
      <span aria-hidden="true">🌙</span>
    </button>
  );
}
