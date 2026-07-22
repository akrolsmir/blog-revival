"use client";

import Link from "next/link";
import type { BloggerRow } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { dollars } from "@/lib/format";

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

  return (
    <Link
      href={`/graveyard/b/${blogger.slug}`}
      className={`gy-stone gy-rise group flex flex-col px-7 pb-6 pt-12 text-center transition-transform duration-300 hover:-translate-y-1.5 ${
        isLive ? "gy-stone-live" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="gy-label text-mist/80">{eyebrowFor(blogger.slug)}</div>
      <h3 className="gy-caps mt-2 text-2xl leading-snug text-moon">
        {blogger.name}
      </h3>
      <div className="gy-label mt-2 text-mist/70">
        silent {silent.toLocaleString()} days
      </div>
      {blogger.epitaph && (
        <p className="mt-4 flex-1 text-[15px] italic leading-relaxed text-moon/70">
          {blogger.epitaph}
        </p>
      )}
      {revived ? (
        <div className="gy-label mt-5 text-candle">
          revived — the candle did its work
        </div>
      ) : (
        <div className="mt-5">
          <div className="gy-progress h-1.5 w-full">
            <div style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-moon/90">
              {dollars(math.totalCents, { round: true })} of $1,000
            </span>
            {isLive ? (
              <span className="gy-label flex items-center gap-2 text-candle">
                live
                <span className="gy-candle !h-4 !w-1.5">
                  <span className="gy-flame !-top-2 !h-2 !w-1.5" />
                </span>
              </span>
            ) : (
              <span className="gy-label text-mist/70">{pct}% funded</span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
