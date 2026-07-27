// Scenery shared by the graveyard skin and the OG image. Everything here is
// plain data — no "use client", so the server-rendered OG route can import it
// without pulling a client module across the boundary.

const EYEBROWS = [
  "here lies",
  "in memory of",
  "gone too soon",
  "rest in drafts",
  "r.i.p.",
  "sadly missed",
];

/** The engraved line above a name. Hashed off the slug so a blogger keeps the
 * same one everywhere: card, hero, blogger page, OG image. */
export function eyebrowFor(slug: string): string {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return EYEBROWS[h % EYEBROWS.length];
}

export const TREE_PATH =
  "M96 420 L92 240 C60 210 20 190 10 120 L26 118 C40 168 70 190 92 205 L90 120 C70 96 58 60 60 18 L74 20 C76 60 86 92 98 112 L104 40 L116 42 L110 150 C130 130 152 120 186 122 L184 138 C150 140 128 156 112 180 L108 250 C130 235 158 230 178 236 L176 252 C150 248 126 258 110 278 L104 420 Z";

export const GRASS_PATH =
  "M4 24 C6 14 4 8 0 2 C8 6 10 14 10 20 C13 10 12 6 16 0 C18 8 16 16 15 24 Z M30 24 C32 15 30 9 26 4 C33 8 35 14 34 24 Z M50 24 C52 14 50 8 46 2 C54 7 56 15 55 24 Z";

export type Star = {
  left: number; // 0–100 (% of width)
  top: number; // 0–52 (% of height — keeps stars in the sky)
  size: number; // px
  delay: number; // ms, animation only
  duration: number; // ms, animation only
  opacity: number; // for still renders that can't twinkle
};

/** Deterministic star field: hash-based so SSR, client and the OG image all
 * agree on where the stars are. */
export function starField(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const h = (i * 2654435761) >>> 0;
    return {
      left: (h % 1000) / 10,
      top: ((h >>> 10) % 520) / 10,
      size: 1 + ((h >>> 20) % 3) / 2,
      delay: (h >>> 8) % 5000,
      duration: 3000 + ((h >>> 16) % 4000),
      // Frozen mid-twinkle at varying brightness, since a PNG can't animate.
      opacity: 0.15 + ((h >>> 4) % 55) / 100,
    };
  });
}
