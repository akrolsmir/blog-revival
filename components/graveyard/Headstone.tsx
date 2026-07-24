"use client";

import Link from "next/link";
import { topPatrons, type BloggerRow } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { bloggerIcon, dollars } from "@/lib/format";

const EYEBROWS = [
  "here lies",
  "in memory of",
  "gone too soon",
  "rest in drafts",
  "r.i.p.",
  "sadly missed",
];

export function eyebrowFor(slug: string): string {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return EYEBROWS[h % EYEBROWS.length];
}

export function Headstone({ blogger, index = 0 }: { blogger: BloggerRow; index?: number }) {
  const silent = daysSilent(blogger.lastPostAt);
  const { math } = blogger;
  const isLive = math.isLive;
  const pct = Math.min(100, Math.round((math.totalCents / 1000_00) * 100));
  const revived = blogger.status === "revived" || blogger.status === "paid";
  const top = topPatrons(blogger);

  return (
    <div
      className={`gy-stone gy-rise group relative flex flex-col px-6 pb-6 pt-10 text-center transition-transform duration-300 hover:-translate-y-1.5 ${
        isLive ? "gy-stone-live" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      {/* stretched overlay: the whole card links to the blog, leaving the
          inner patron names free to be their own links */}
      <Link
        href={`/b/${blogger.slug}`}
        aria-label={`${blogger.name} bounty`}
        className="absolute inset-0 z-0"
      />
      <div className="gy-cameo mb-3 flex-none self-center">
        <img
          src={bloggerIcon(blogger.blogUrl, blogger.photoUrl)}
          alt=""
          width={44}
          height={44}
          onError={(e) => {
            e.currentTarget.parentElement!.style.display = "none";
          }}
          className="h-11 w-11"
        />
      </div>
      <div className="gy-caps text-[11px] tracking-[0.3em] text-[#8e9ab2]">
        {eyebrowFor(blogger.slug)}
      </div>
      <h3 className="gy-caps mt-2 text-[22px] font-semibold leading-[1.15] tracking-[0.08em] text-[#d3dae8] [text-shadow:0_-1px_1px_rgba(4,8,16,.9),0_1px_0_rgba(255,255,255,.07)]">
        {blogger.name}
      </h3>
      <div className="gy-caps mt-1 text-xs tracking-[0.18em] text-[#7e8aa3]">
        silent {silent.toLocaleString()} days
      </div>
      <div className="mt-3.5 flex-1" />
      {top.length > 0 && (
        <p className="relative z-10 mt-2 text-[11.5px] leading-snug text-[#7e8aa3] [text-wrap:pretty]">
          Funded by{" "}
          {top.map((t, i) => (
            <span key={t.id}>
              {i > 0 && ", "}
              <Link href={`/p/${t.handle}`} className="text-[#a9b3c8] hover:text-moon">
                {t.displayName}
              </Link>
            </span>
          ))}
        </p>
      )}
      {revived ? (
        <div className="gy-caps mt-4 text-xs tracking-[0.14em] text-gold">
          revived — the candle did its work
        </div>
      ) : (
        <div className="mt-4">
          <div
            className={`gy-progress h-2 w-full ${
              isLive ? "shadow-[0_0_10px_rgba(230,184,92,.6)]" : ""
            }`}
          >
            <div style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <span className="whitespace-nowrap text-sm text-[#a9b3c8]">
              {dollars(math.totalCents, { round: true })} of $1,000
            </span>
            <span
              className={`gy-caps whitespace-nowrap text-[11px] tracking-[0.12em] ${
                isLive ? "text-gold" : "text-mist"
              }`}
            >
              {isLive ? "live" : `${pct}% funded`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
