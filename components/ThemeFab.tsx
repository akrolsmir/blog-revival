"use client";

import { useSkin, useTheme } from "@/lib/theme";

// The theme switcher: fixed corner toggle, identical position in both skins.
// Rendered outside the .gy/.wp wrappers, so styled purely inline.
//
// Position lives in one shared string so the button can't drift between skins,
// and `bottom` is set twice on purpose: the utility is the floor, and the
// inline max() lifts the button clear of the iOS home indicator where there is
// one. env() carries an explicit 0px fallback — without it the whole
// declaration is invalid where the variable is unset, which drops the button
// out of its fixed corner entirely.
const POSITION =
  "fixed bottom-5 right-5 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-lg";
const OFFSET = { bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" };

export function ThemeFab() {
  const skin = useSkin();
  const { setTheme } = useTheme();
  if (!skin) return null;
  return skin === "gy" ? (
    <button
      onClick={() => setTheme("light")}
      aria-label="Switch to light mode"
      title="Return to daylight (light mode)"
      style={OFFSET}
      className={`${POSITION} border border-gold/50 bg-night/90 text-candle shadow-[0_0_20px_rgba(230,184,92,.25)] hover:bg-gold/10`}
    >
      <span aria-hidden="true">☀</span>
    </button>
  ) : (
    <button
      onClick={() => setTheme("dark")}
      aria-label="Switch to dark mode"
      title="Visit the graveyard (dark mode)"
      style={OFFSET}
      className={`${POSITION} border border-[#9b9b95] bg-gradient-to-b from-[#fbfbfa] to-[#dcdcd7] shadow-md hover:from-white hover:to-[#e6e6e1]`}
    >
      <span aria-hidden="true">🌙</span>
    </button>
  );
}
