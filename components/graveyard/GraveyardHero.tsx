"use client";

import Link from "next/link";
import type { BloggerRow } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { dollars } from "@/lib/format";
import { eyebrowFor, starField, GRASS_PATH, TREE_PATH } from "@/lib/graveyard";

// Fixed scene slots from prototypes/design-graveyard.html, ordered by visual
// prominence so the top-sorted bounty lands on the biggest stone.
// r = outer arch radius, ri = inner (carved frame) radius, kept ~11px tighter
// so the engraved frame sits concentric inside the stone edge.
const SLOTS = [
  {
    x: 17.5,
    y: 40,
    w: 210,
    h: 250,
    z: 5,
    c1: "#3d4a66",
    c2: "#2a3550",
    r: "105px 105px 5px 5px",
    ri: "92px 92px 3px 3px",
    name: 26,
    epi: 12,
    gap: 10,
  },
  {
    x: 52,
    y: 36,
    w: 205,
    h: 246,
    z: 5,
    c1: "#3a4763",
    c2: "#28334d",
    r: "50% 50% 5px 5px / 42% 42% 5px 5px",
    ri: "48% 48% 3px 3px / 40% 40% 3px 3px",
    name: 27,
    epi: 12,
    gap: 10,
  },
  {
    x: 81.5,
    y: 56,
    w: 160,
    h: 200,
    z: 4,
    c1: "#33405a",
    c2: "#242f47",
    r: "80px 80px 4px 4px",
    ri: "68px 68px 2px 2px",
    name: 18,
    epi: 10,
    gap: 7,
  },
  {
    x: 5,
    y: 118,
    w: 155,
    h: 190,
    z: 3,
    c1: "#2c374e",
    c2: "#202a3f",
    r: "78px 78px 4px 4px",
    ri: "66px 66px 2px 2px",
    name: 17,
    epi: 10,
    gap: 6,
  },
  {
    x: 40.5,
    y: 138,
    w: 118,
    h: 142,
    z: 2,
    c1: "#2a3449",
    c2: "#1e2739",
    r: "59px 59px 4px 4px",
    ri: "48px 48px 2px 2px",
    name: 14,
    epi: 9,
    gap: 4,
  },
  {
    x: 70,
    y: 128,
    w: 112,
    h: 134,
    z: 2,
    c1: "#2a3449",
    c2: "#1e2739",
    r: "56px 56px 4px 4px",
    ri: "46px 46px 2px 2px",
    name: 14,
    epi: 9,
    gap: 4,
  },
];

const STARS = starField(44);

// Burns steadily once the bounty is live; otherwise unlit until its headstone
// is hovered. Wax height, glow radius and glow strength all scale with funding.
function Candle({
  pct,
  lit = false,
  className = "",
}: {
  pct: number;
  lit?: boolean;
  className?: string;
}) {
  const capped = Math.min(pct, 130);
  const waxH = Math.round(12 + capped * 0.2);
  const glowSize = Math.round(70 + capped * 1.1);
  const glowOp = 0.35 + (capped / 130) * 0.6;
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`pointer-events-none absolute bottom-0 rounded-full transition-opacity duration-500 ${
          lit ? "[opacity:var(--glow)]" : "opacity-0 group-hover:[opacity:var(--glow)]"
        }`}
        style={{
          width: glowSize,
          height: glowSize,
          background: "radial-gradient(circle, rgba(255,196,94,.5) 0%, rgba(255,196,94,0) 68%)",
          ["--glow" as string]: glowOp,
        }}
      />
      <div
        className={`gy-scene-flame transition-opacity duration-500 ${
          lit ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
      <div
        style={{
          width: 12,
          height: waxH,
          background: "linear-gradient(90deg,#cfc7ae,#efe9d4 45%,#b9b096)",
          borderRadius: "3px 3px 2px 2px",
          boxShadow: "0 2px 4px rgba(0,0,0,.5)",
        }}
      />
    </div>
  );
}

// Shrink an engraved name so its longest word fits the stone. Marcellus SC
// caps run ~0.7em per glyph, +0.1em tracking; the carved frame and padding
// eat ~36px of the slot width. (Wider face than the Cormorant SC this was
// first tuned for, hence the bigger per-glyph factor.)
function nameSize(base: number, stoneWidth: number, name: string): number {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length), 1);
  return Math.min(base, Math.floor((stoneWidth - 36) / (longest * 0.8)));
}

// Sized in cqw (% of the stone's own width) rather than px, since the stones
// themselves are sized as a share of the viewport. Same ~0.8em per glyph as
// nameSize() above, plus tracking and the carved frame's inset, so a word of n
// glyphs needs about 95/n percent of the stone. Long names engrave small
// rather than breaking: a hyphenated name on a headstone reads as a mistake.
function nameCqw(name: string, base = 15): number {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length), 1);
  return Math.min(base, 95 / longest);
}

// The mobile plot: three stones overlapping in depth rather than a grid of
// six. Overlap is what buys the size — at 375px a row of three flat-packed
// stones is ~110px each and the names go illegible, whereas letting them
// crowd each other lets the front stone run wider than a third of the screen.
// Order is [second, first, third] so the best-funded bounty stands center and
// tallest, with the flanking pair set back (higher baseline, darker, behind).
const MOBILE_SLOTS = [
  { i: 1, w: "33%", ar: 0.66, z: 2, lift: 12, c1: "#313d55", c2: "#222c43", name: 13.5 },
  { i: 0, w: "37%", ar: 0.58, z: 4, lift: 0, c1: "#3d4a66", c2: "#2a3550", name: 15 },
  { i: 2, w: "32%", ar: 0.7, z: 3, lift: 18, c1: "#2e3a51", c2: "#20293e", name: 13 },
];

export function GraveyardHero({
  bloggers,
  liveThresholdCents,
}: {
  bloggers: BloggerRow[];
  liveThresholdCents: number;
}) {
  const stones = bloggers.slice(0, SLOTS.length);
  const carve = {
    textShadow: "0 -1px 1px rgba(4,8,16,.85), 0 1px 0 rgba(255,255,255,.06)",
  };

  return (
    <section
      id="top"
      className="gy-sky relative flex min-h-[100svh] flex-col md:block md:h-[calc(100vh-73px)] md:min-h-[720px] md:max-h-[960px]"
    >
      {/* moon + craters — outside the clipped backdrop and above the clouds
          (z-1) so nothing cuts a straight edge across the glow */}
      <div className="gy-moon absolute right-4 top-2 z-[1] h-12 w-12 rounded-full md:right-[13%] md:top-[13%] md:h-[92px] md:w-[92px]" />
      <div className="absolute right-[16.5%] top-[20%] z-[1] hidden h-3.5 w-3.5 rounded-full bg-[#e2ded0] opacity-50 md:block" />
      <div className="absolute right-[14.8%] top-[16%] z-[1] hidden h-[9px] w-[9px] rounded-full bg-[#e2ded0] opacity-40 md:block" />

      {/* clipped backdrop: stars, clouds, hills, trees all overflow the
          viewport and must be contained */}
      <div className="absolute inset-0 overflow-hidden">
        {/* twinkling stars */}
        {STARS.map((s, i) => (
          <div
            key={i}
            className="gy-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}ms`,
              animationDuration: `${s.duration}ms`,
            }}
          />
        ))}

        {/* drifting clouds */}
        <div className="gy-cloud left-[-6%] top-[4%] h-[120px] w-[56%] bg-[#0a1322] opacity-90 [animation-duration:90s]" />
        <div className="gy-cloud left-[30%] top-[26%] h-[76px] w-[44%] bg-[#0c1526] opacity-85 [animation-direction:alternate-reverse] [animation-duration:70s]" />
        <div className="gy-cloud right-[-8%] top-[-3%] h-[90px] w-[38%] bg-[#0a1322] opacity-80 [animation-duration:110s]" />

        {/* hills + ground */}
        <div className="gy-hill bottom-[96px] left-[-12%] right-[-12%] h-[280px] bg-[#0f1728]" />
        <div className="gy-hill bottom-[28px] left-[-18%] right-[-18%] h-[230px] bg-[#0b1322]" />
        <div className="absolute bottom-0 left-0 right-0 h-[110px] bg-abyss" />
        <div className="gy-hill bottom-[74px] left-[-10%] right-[-10%] h-[120px] bg-abyss" />

        {/* bare trees */}
        <svg
          viewBox="0 0 200 420"
          className="absolute bottom-9 left-[-24px] z-[1] hidden h-[460px] w-[220px] md:block"
          aria-hidden="true"
        >
          <path d={TREE_PATH} fill="#060b15" />
        </svg>
        <svg
          viewBox="0 0 200 420"
          className="absolute bottom-[60px] right-[-40px] z-[1] hidden h-[400px] w-[190px] -scale-x-100 md:block"
          aria-hidden="true"
        >
          <path d={TREE_PATH} fill="#060b15" />
        </svg>
        {/* one tree on phones, pushed to the edge so it frames the plot
            without stealing width from the stones */}
        <svg
          viewBox="0 0 200 420"
          className="absolute bottom-[86px] left-[-46px] z-[1] h-[280px] w-[134px] md:hidden"
          aria-hidden="true"
        >
          <path d={TREE_PATH} fill="#060b15" />
        </svg>
      </div>

      {/* hero copy */}
      {/* hero copy — on phones this is the top of the page (the header hides
          on the home route), so it carries the wordmark's job itself */}
      <div className="relative z-10 mx-auto max-w-[700px] px-6 pt-10 text-center md:pt-20">
        {/* <div className="gy-caps mb-4 text-[13px] tracking-[0.34em] text-[#93a0ba]">
          a manifund project &nbsp;·&nbsp; quadratic funding
        </div> */}
        <h1 className="mb-4 text-[36px] leading-[1.06] text-[#f0f2f7] text-balance md:mb-5 md:text-[50px]">
          Blog Revival Project
        </h1>
        <p className="mx-auto mb-3.5 max-w-[520px] text-[17px] leading-[1.5] text-[#a9b3c8] text-pretty md:mb-4 md:text-[19px] md:leading-[1.55]">
          Many of our favorite blogs have gone silent.{" "}
          {/* the break is a desktop line-length choice; on a phone it just
              leaves a short widow line */}
          <br className="hidden md:inline" />
          We're offering each $1000+ as a bounty to post again.
        </p>
        <p className="mx-auto mb-6 max-w-[520px] text-[15px] text-candle text-pretty md:mb-8 md:text-[16px]">
          The first 100 users to sign up get $25 of credit to pledge to bloggers.
        </p>
        {/* one button on phones; "how it works" drops to a text link so the
            fold isn't split between two equal-looking calls to action */}
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-4">
          <Link
            href="/signin?next=/account"
            className="gy-caps w-full max-w-[300px] rounded-[3px] bg-gold px-7 py-3 text-[18px] text-[#171208] shadow-[0_0_30px_rgba(230,184,92,.3)] transition hover:bg-gold/90 md:w-auto"
          >
            become a patron
          </Link>
          <Link
            href="#match"
            className="gy-caps px-7 py-1 text-[16px] text-[#cfd6e4] underline decoration-[#3c485f] underline-offset-[6px] transition hover:decoration-[#8b97ad] md:rounded-[3px] md:border md:border-[#3c485f] md:py-3 md:text-[18px] md:no-underline md:hover:border-[#5b6981]"
          >
            how it works
          </Link>
        </div>
      </div>

      {/* headstones — placed across the plot on desktop */}
      {stones.map((b, i) => {
        const s = SLOTS[i];
        const pct = Math.round((b.math.totalCents / liveThresholdCents) * 100);
        const lit = b.math.isLive;
        return (
          <div
            key={b.id}
            className="group absolute hidden transition-transform duration-300 hover:-translate-y-1.5 md:block"
            style={{ left: `${s.x}%`, bottom: s.y, width: s.w, zIndex: s.z }}
          >
            {/* funded chip */}
            <div className="gy-caps pointer-events-none absolute left-1/2 top-[-46px] z-20 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-gold px-3.5 py-1.5 text-xs tracking-[0.12em] text-[#1c150a] opacity-0 shadow-[0_4px_18px_rgba(0,0,0,.4)] transition-opacity duration-200 group-hover:opacity-100">
              {lit ? "bounty live! · " : ""}
              {pct}% funded · {dollars(b.math.totalCents, { round: true })} of{" "}
              {dollars(liveThresholdCents, { round: true })}
            </div>
            <Link href={`/b/${b.slug}`} className="relative block">
              <div
                className="relative flex flex-col items-center justify-center px-3.5 text-center"
                style={{
                  height: s.h,
                  gap: s.gap,
                  background: `linear-gradient(175deg, ${s.c1} 0%, ${s.c2} 100%)`,
                  borderRadius: s.r,
                  boxShadow:
                    "inset 0 3px 0 rgba(255,255,255,.08), inset 0 -26px 40px rgba(5,9,18,.55), 0 6px 0 rgba(4,7,14,.6)",
                }}
              >
                {/* carved engraved frame */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[11px]"
                  style={{
                    borderRadius: s.ri,
                    border: "1px solid rgba(8,12,22,.5)",
                    boxShadow: "0 1px 0 rgba(255,255,255,.05), inset 0 1px 2px rgba(4,8,16,.4)",
                  }}
                />
                <div
                  className="gy-caps gy-grave relative tracking-[0.3em] text-[#8e9ab2]"
                  style={{ fontSize: s.epi, ...carve }}
                >
                  {eyebrowFor(b.slug)}
                </div>
                <div
                  className="gy-caps gy-grave relative leading-[1.12] tracking-[0.1em] text-[#d3dae8]"
                  style={{ fontSize: nameSize(s.name, s.w, b.name), ...carve }}
                >
                  {b.name}
                </div>
                {b.lastPostAt != null && (
                  <div
                    className="gy-caps gy-grave relative tracking-[0.24em] text-[#7e8aa3]"
                    style={{ fontSize: s.epi, ...carve }}
                  >
                    silent {daysSilent(b.lastPostAt).toLocaleString()} days
                  </div>
                )}
              </div>
            </Link>
            {/* grave mound */}
            <div className="absolute -bottom-3 left-[-12%] right-[-12%] h-[22px] rounded-[50%] bg-abyss" />
            <Candle
              pct={pct}
              lit={lit}
              className="absolute -bottom-2 left-1/2 z-[6] -translate-x-1/2"
            />
          </div>
        );
      })}

      {/* mobile: three stones standing on the ground line at the foot of the
          scene. mt-auto pins them to the bottom of the min-h-screen section,
          so the plot sits on the hills no matter how tall the copy runs. */}
      <div className="relative z-[5] mt-auto flex items-end justify-center px-4 pb-[76px] md:hidden">
        {MOBILE_SLOTS.map((s, n) => {
          const b = stones[s.i];
          if (!b) return null;
          const pct = Math.round((b.math.totalCents / liveThresholdCents) * 100);
          return (
            <div
              key={b.id}
              className="group relative"
              style={{
                width: s.w,
                zIndex: s.z,
                marginBottom: s.lift,
                marginLeft: n === 0 ? 0 : -8,
              }}
            >
              <Link
                href={`/b/${b.slug}`}
                aria-label={`${b.name} bounty`}
                className="relative flex w-full flex-col items-center justify-center px-[9%] text-center"
                style={{
                  // its own container so the engraving can be sized in cqw
                  containerType: "inline-size",
                  aspectRatio: s.ar,
                  background: `linear-gradient(175deg, ${s.c1} 0%, ${s.c2} 100%)`,
                  borderRadius: "50% 50% 4px 4px / 40% 40% 3px 3px",
                  boxShadow:
                    "inset 0 3px 0 rgba(255,255,255,.08), inset 0 -22px 34px rgba(5,9,18,.55), 0 5px 0 rgba(4,7,14,.6)",
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[7px]"
                  style={{
                    borderRadius: "48% 48% 2px 2px / 38% 38% 2px 2px",
                    border: "1px solid rgba(8,12,22,.5)",
                    boxShadow: "0 1px 0 rgba(255,255,255,.05)",
                  }}
                />
                {/* name only: at this size the eyebrow and the days-silent
                    line engrave down to noise, and both are repeated on the
                    plaque rows further down the page */}
                <div
                  className="gy-caps gy-grave relative leading-[1.14] tracking-[0.06em] text-[#d3dae8]"
                  style={{ fontSize: `${nameCqw(b.name, s.name)}cqw`, ...carve }}
                >
                  {b.name}
                </div>
              </Link>
              <div className="absolute -bottom-2.5 left-[-10%] right-[-10%] h-[16px] rounded-[50%] bg-abyss" />
              <Candle
                pct={pct}
                lit={b.math.isLive}
                className="absolute -bottom-1.5 left-1/2 z-[6] -translate-x-1/2 scale-90"
              />
            </div>
          );
        })}
      </div>

      {/* foreground grass tufts */}
      <svg
        viewBox="0 0 60 24"
        className="absolute bottom-2.5 left-[12%] z-[8] w-16"
        aria-hidden="true"
      >
        <path d={GRASS_PATH} fill="#0a1120" />
      </svg>
      <svg
        viewBox="0 0 60 24"
        className="absolute bottom-1.5 right-[22%] z-[8] w-20"
        aria-hidden="true"
      >
        <path d={GRASS_PATH} fill="#0a1120" />
      </svg>
    </section>
  );
}
