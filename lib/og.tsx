// The social-sharing card: the graveyard hero, restaged for 1200×630.
//
// Rendered by next/og (Satori), which is NOT a browser — it lays out a subset
// of CSS via flexbox and knows nothing about Tailwind, our globals.css, or
// @font-face. So the scene is rebuilt here with inline styles and the two
// fonts are handed over as raw TTF buffers. Keep it in sync with
// components/graveyard/GraveyardHero.tsx by eye; shared *data* (star field,
// tree path, epitaphs) comes from lib/graveyard.ts so at least that can't
// drift.
//
// Satori gotchas hit while building this: no `background` shorthand for
// gradients (use backgroundImage), no elliptical `/` border-radius syntax, no
// animations, and any element with more than one child needs an explicit
// display/flexDirection.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { adminDb } from "@/lib/admin";
import {
  computeQf,
  DEFAULT_LIVE_THRESHOLD_CENTS,
  DEFAULT_POOL_CENTS,
  daysSilent,
  type PledgeLike,
} from "@/lib/qf";
import { eyebrowFor, starField, TREE_PATH } from "@/lib/graveyard";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "Blog Revival Project — bounties to bring dormant blogs back";
export const OG_CONTENT_TYPE = "image/png";

type Stone = {
  slug: string;
  name: string;
  lastPostAt?: number;
  pct: number;
  lit: boolean;
};

// Scene slots, biggest first — the top-funded bounty lands on the front stone.
// Laid out for a wide, short frame: the hero stacks its plot vertically, which
// there isn't room for here, so these fan out sideways instead.
const SLOTS = [
  {
    x: 428,
    w: 216,
    h: 234,
    bottom: 52,
    c1: "#3d4a66",
    c2: "#2a3550",
    r: "108px 108px 5px 5px",
    ri: "94px 94px 3px 3px",
    name: 27,
    epi: 12,
    gap: 9,
    silent: true,
  },
  {
    x: 668,
    w: 206,
    h: 222,
    bottom: 58,
    c1: "#3a4763",
    c2: "#28334d",
    r: "103px 103px 5px 5px",
    ri: "89px 89px 3px 3px",
    name: 26,
    epi: 12,
    gap: 9,
    silent: true,
  },
  {
    x: 218,
    w: 172,
    h: 196,
    bottom: 68,
    c1: "#33405a",
    c2: "#242f47",
    r: "86px 86px 4px 4px",
    ri: "74px 74px 2px 2px",
    name: 20,
    epi: 10,
    gap: 7,
    silent: true,
  },
  {
    x: 898,
    w: 164,
    h: 188,
    bottom: 64,
    c1: "#2c374e",
    c2: "#202a3f",
    r: "82px 82px 4px 4px",
    ri: "70px 70px 2px 2px",
    name: 19,
    epi: 10,
    gap: 7,
    silent: true,
  },
  {
    x: 76,
    w: 134,
    h: 154,
    bottom: 80,
    c1: "#2a3449",
    c2: "#1e2739",
    r: "67px 67px 4px 4px",
    ri: "56px 56px 2px 2px",
    name: 15,
    epi: 9,
    gap: 5,
    silent: false,
  },
  {
    x: 1058,
    w: 126,
    h: 146,
    bottom: 76,
    c1: "#2a3449",
    c2: "#1e2739",
    r: "63px 63px 4px 4px",
    ri: "52px 52px 2px 2px",
    name: 15,
    epi: 9,
    gap: 5,
    silent: false,
  },
];

const STARS = starField(44);

const CARVE = "0 -1px 1px rgba(4,8,16,.85), 0 1px 0 rgba(255,255,255,.06)";

// Satori renders <img> data URIs reliably; inline <svg> children are shakier.
function treeUri(flip: boolean): string {
  const t = flip ? ' transform="scale(-1,1) translate(-200,0)"' : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 420" width="200" height="420"><path d="${TREE_PATH}" fill="#060b15"${t}/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Same shrink-to-fit rule as the hero: Marcellus SC caps run wide, and the
// carved frame plus padding eats ~30px of the stone.
function nameSize(base: number, stoneWidth: number, name: string): number {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length), 1);
  return Math.min(base, Math.floor((stoneWidth - 30) / (longest * 0.8)));
}

/** Top bounties for the scene, live ones first — the homepage ordering. */
async function topStones(limit: number): Promise<Stone[]> {
  const db = adminDb();
  const data = await db.query({ bloggers: { pledges: { patron: {} } }, settings: {} });

  const config = data.settings?.find((s: any) => s.key === "main");
  const poolCents = config?.matchingPoolCents ?? DEFAULT_POOL_CENTS;
  const liveThresholdCents = config?.liveThresholdCents ?? DEFAULT_LIVE_THRESHOLD_CENTS;

  const byBlogger = new Map<string, PledgeLike[]>();
  for (const b of data.bloggers ?? []) {
    byBlogger.set(
      b.id,
      (b.pledges ?? []).map((p: any) => ({
        amountCents: p.amountCents,
        source: p.source,
        status: p.status,
        patronId: p.patron?.id,
      })),
    );
  }
  const qf = computeQf(byBlogger, poolCents, liveThresholdCents);

  return (data.bloggers ?? [])
    .map((b: any) => {
      const math = qf.perBlogger.get(b.id);
      return {
        slug: b.slug as string,
        name: b.name as string,
        lastPostAt: b.lastPostAt as number | undefined,
        pct: Math.round(((math?.totalCents ?? 0) / liveThresholdCents) * 100),
        lit: math?.isLive ?? false,
        total: math?.totalCents ?? 0,
      };
    })
    .sort((a, b) => (a.lit !== b.lit ? (a.lit ? -1 : 1) : b.total - a.total))
    .slice(0, limit);
}

// A candle burning in front of a stone. Wax height and glow scale with
// funding, exactly as on the site; unlit stones get bare wax.
function Candle({ pct, lit }: { pct: number; lit: boolean }) {
  const capped = Math.min(pct, 130);
  const waxH = Math.round(10 + capped * 0.16);
  // Tighter and dimmer than the site's glow: on a page it pools at the foot of
  // a tall stone, but at this scale the same numbers flood the inscription.
  const glowSize = Math.round(48 + capped * 0.5);
  const glowOp = 0.3 + (capped / 130) * 0.35;
  return (
    <div
      style={{
        position: "absolute",
        bottom: -6,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {lit && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            marginLeft: -glowSize / 2,
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize,
            opacity: glowOp,
            backgroundImage:
              "radial-gradient(circle, rgba(255,196,94,.5) 0%, rgba(255,196,94,0) 68%)",
          }}
        />
      )}
      {lit && (
        <div
          style={{
            width: 9,
            height: 13,
            borderRadius: "50% 50% 45% 45%",
            backgroundImage:
              "radial-gradient(circle at 50% 78%, #fff3cf 0%, #ffc45e 55%, #f08b2e 100%)",
            boxShadow: "0 0 14px 4px rgba(255,196,94,.55)",
          }}
        />
      )}
      <div
        style={{
          width: 11,
          height: waxH,
          borderRadius: "3px 3px 2px 2px",
          backgroundImage: "linear-gradient(90deg,#cfc7ae,#efe9d4 45%,#b9b096)",
          boxShadow: "0 2px 4px rgba(0,0,0,.5)",
        }}
      />
    </div>
  );
}

function Scene({ stones }: { stones: Stone[] }) {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        position: "relative",
        backgroundImage:
          "linear-gradient(180deg, #0b1120 0%, #0e1728 48%, #131e34 78%, #16223a 100%)",
      }}
    >
      {/* stars — frozen mid-twinkle */}
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (s.left / 100) * OG_SIZE.width,
            top: (s.top / 100) * OG_SIZE.height,
            width: s.size + 0.5,
            height: s.size + 0.5,
            borderRadius: 4,
            backgroundColor: "#dfe4ee",
            opacity: s.opacity,
          }}
        />
      ))}

      {/* drifting clouds, parked */}
      <div
        style={{
          position: "absolute",
          left: -70,
          top: 22,
          width: 660,
          height: 104,
          borderRadius: 999,
          backgroundColor: "#0a1322",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 150,
          width: 520,
          height: 66,
          borderRadius: 999,
          backgroundColor: "#0c1526",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -90,
          top: -14,
          width: 450,
          height: 78,
          borderRadius: 999,
          backgroundColor: "#0a1322",
          opacity: 0.8,
        }}
      />

      {/* moon + craters */}
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 54,
          width: 84,
          height: 84,
          borderRadius: 84,
          backgroundImage:
            "radial-gradient(circle at 38% 34%, #fffdf4 0%, #f2efe1 45%, #ddd6bd 100%)",
          boxShadow:
            "0 0 60px 16px rgba(255,250,224,.38), 0 0 130px 48px rgba(240,236,214,.24), 0 0 240px 110px rgba(220,224,240,.13)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 128,
          top: 102,
          width: 13,
          height: 13,
          borderRadius: 13,
          backgroundColor: "#e2ded0",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 108,
          top: 76,
          width: 9,
          height: 9,
          borderRadius: 9,
          backgroundColor: "#e2ded0",
          opacity: 0.4,
        }}
      />

      {/* hills + ground: percentage radii give each band an elliptical crown */}
      <div
        style={{
          position: "absolute",
          bottom: 92,
          left: -150,
          right: -150,
          height: 250,
          borderRadius: "50% 50% 0 0",
          backgroundColor: "#0f1728",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: -220,
          right: -220,
          height: 210,
          borderRadius: "50% 50% 0 0",
          backgroundColor: "#0b1322",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: -130,
          right: -130,
          height: 110,
          borderRadius: "50% 50% 0 0",
          backgroundColor: "#060b15",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          backgroundColor: "#060b15",
        }}
      />

      {/* Bare trees, up on the hillside behind the stones. They're the same
          near-black as the foreground, so they have to be rooted above where
          the abyss-colored hill starts (~y450) or the trunks disappear into it
          and only the branches read, floating. */}
      <img
        src={treeUri(false)}
        width={150}
        height={314}
        style={{ position: "absolute", left: -30, bottom: 172 }}
      />
      <img
        src={treeUri(true)}
        width={132}
        height={276}
        style={{ position: "absolute", right: -34, bottom: 186 }}
      />

      {/* headstones */}
      {stones.map((b, i) => {
        const s = SLOTS[i];
        const silent = b.lastPostAt != null ? daysSilent(b.lastPostAt) : null;
        return (
          <div
            key={b.slug}
            style={{
              position: "absolute",
              left: s.x,
              bottom: s.bottom,
              width: s.w,
              display: "flex",
            }}
          >
            {/* grave mound */}
            <div
              style={{
                position: "absolute",
                bottom: -11,
                left: -0.12 * s.w,
                width: s.w * 1.24,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#060b15",
              }}
            />
            <div
              style={{
                position: "relative",
                width: s.w,
                height: s.h,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: s.gap,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: s.r,
                // Third stop stands in for the site's `inset 0 -26px 40px`
                // shading, which Satori drops — without it the stones come out
                // milky and barely separate from the sky.
                backgroundImage: `linear-gradient(175deg, ${s.c1} 0%, ${s.c2} 55%, #1a2336 100%)`,
                boxShadow: "0 6px 0 rgba(4,7,14,.6)",
              }}
            >
              {/* carved frame */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                  borderRadius: s.ri,
                  border: "1px solid rgba(8,12,22,.5)",
                  boxShadow: "0 1px 0 rgba(255,255,255,.05), inset 0 1px 2px rgba(4,8,16,.4)",
                }}
              />
              <div
                style={{
                  fontFamily: "Marcellus SC",
                  fontSize: s.epi,
                  letterSpacing: s.epi * 0.3,
                  color: "#8e9ab2",
                  textShadow: CARVE,
                }}
              >
                {eyebrowFor(b.slug)}
              </div>
              <div
                style={{
                  fontFamily: "Marcellus SC",
                  fontSize: nameSize(s.name, s.w, b.name),
                  lineHeight: 1.12,
                  letterSpacing: 1.6,
                  textAlign: "center",
                  color: "#d3dae8",
                  textShadow: CARVE,
                }}
              >
                {b.name}
              </div>
              {/* Interpolated into one string on purpose: `silent {n} days`
                  would be three children, and Satori throws on any element
                  with more than one child that hasn't declared a display. */}
              {s.silent && silent != null && (
                <div
                  style={{
                    fontFamily: "Marcellus SC",
                    fontSize: s.epi,
                    letterSpacing: s.epi * 0.22,
                    color: "#7e8aa3",
                    textShadow: CARVE,
                  }}
                >
                  {`silent ${silent.toLocaleString("en-US")} days`}
                </div>
              )}
            </div>
            <Candle pct={b.pct} lit={b.lit} />
          </div>
        );
      })}

      {/* title */}
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Crimson Pro",
            fontSize: 82,
            color: "#f0f2f7",
            textShadow: "0 4px 40px rgba(6,11,21,.85)",
          }}
        >
          Blog Revival Project
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: "Crimson Pro",
            fontSize: 34,
            letterSpacing: 5,
            color: "#e6b85c",
            textShadow: "0 2px 24px rgba(6,11,21,.9)",
          }}
        >
          revive.blog
        </div>
      </div>
    </div>
  );
}

/**
 * Build the 1200×630 PNG. Both app/opengraph-image.tsx and
 * app/twitter-image.tsx call this, so the two cards can never diverge.
 *
 * Fonts are read off disk (next/font can't hand out buffers) — see
 * next.config.ts, which forces them into the serverless bundle.
 */
export async function renderOgImage(): Promise<ImageResponse> {
  const fontDir = join(process.cwd(), "assets", "fonts");
  const [crimson, marcellus, stones] = await Promise.all([
    readFile(join(fontDir, "CrimsonPro-Medium.ttf")),
    readFile(join(fontDir, "MarcellusSC-Regular.ttf")),
    // An empty plot still makes a valid card, so never fail the image over a
    // database hiccup — social crawlers don't retry.
    topStones(SLOTS.length).catch(() => [] as Stone[]),
  ]);

  return new ImageResponse(<Scene stones={stones} />, {
    ...OG_SIZE,
    fonts: [
      { name: "Crimson Pro", data: crimson, weight: 500, style: "normal" },
      { name: "Marcellus SC", data: marcellus, weight: 400, style: "normal" },
    ],
  });
}
