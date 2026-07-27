"use client";

import Link from "next/link";
import { topPatrons, type BloggerRow } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { bloggerIcon, dollars } from "@/lib/format";
import { eyebrowFor } from "@/lib/graveyard";

export function Headstone({ blogger, index = 0 }: { blogger: BloggerRow; index?: number }) {
  const silent = blogger.lastPostAt != null ? daysSilent(blogger.lastPostAt) : null;
  const { math } = blogger;
  const isLive = math.isLive;
  const pct = Math.min(100, Math.round((math.totalCents / 1000_00) * 100));
  const revived = blogger.status === "revived" || blogger.status === "paid";
  const top = topPatrons(blogger);

  const rise = { animationDelay: `${Math.min(index, 8) * 70}ms` };

  return (
    <>
      {/* Phones get a plaque row instead of the arch. A headstone stretched to
          the full width of a phone is a squat box — the shape only reads at
          the ~280px the grid gives it from sm up — and six of them stacked is
          a lot of scrolling for a list you mostly scan. The row keeps the
          engraved name and the same funding line, in list form. */}
      <Link
        href={`/b/${blogger.slug}`}
        style={rise}
        className="gy-rise flex items-center gap-3.5 border-t border-moon/10 px-1 py-4 sm:hidden"
      >
        <div className="gy-cameo flex-none">
          <img
            src={bloggerIcon(blogger.blogUrl, blogger.photoUrl)}
            alt=""
            width={38}
            height={38}
            onError={(e) => {
              e.currentTarget.parentElement!.style.display = "none";
            }}
            className="h-[38px] w-[38px]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            {/* wraps rather than truncates: a long name is the whole point of
                the row, and an ellipsis mid-name reads as a rendering bug */}
            <h3 className="gy-caps gy-grave min-w-0 text-[17px] leading-tight tracking-[0.05em] text-[#d3dae8]">
              {blogger.name}
            </h3>
            <span
              className={`flex-none text-[14px] ${isLive ? "text-gold" : "text-[#a9b3c8]"}`}
              // tabular so the column of amounts lines up down the list
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {dollars(math.totalCents, { round: true })}
            </span>
          </div>
          <p className="gy-label mt-0.5 text-mist">
            {silent != null && <>silent {silent.toLocaleString()} days</>}
            {silent != null && blogger.supporterCount > 0 && " · "}
            {blogger.supporterCount > 0 && (
              <>
                {blogger.supporterCount} patron{blogger.supporterCount === 1 ? "" : "s"}
              </>
            )}
          </p>
          {revived ? (
            <p className="gy-caps mt-1.5 text-[12px] tracking-[0.14em] text-gold">
              revived — the bounty did its work
            </p>
          ) : (
            <div className="mt-2 flex items-center gap-2.5">
              <div
                className={`gy-progress h-1.5 flex-1 ${
                  isLive ? "shadow-[0_0_10px_rgba(230,184,92,.6)]" : ""
                }`}
              >
                <div style={{ width: `${pct}%` }} />
              </div>
              <span
                className={`gy-caps w-[46px] flex-none text-right text-[11px] tracking-[0.1em] ${
                  isLive ? "text-gold" : "text-mist"
                }`}
              >
                {isLive ? "live" : `${pct}%`}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div
        className={`gy-stone gy-rise group relative hidden flex-col px-6 pb-6 pt-10 text-center transition-transform duration-300 hover:-translate-y-1.5 sm:flex ${
          isLive ? "gy-stone-live" : ""
        }`}
        style={rise}
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
        <div className="gy-caps gy-grave text-[11px] tracking-[0.3em] text-[#8e9ab2]">
          {eyebrowFor(blogger.slug)}
        </div>
        <h3 className="gy-caps gy-grave mt-2 text-[22px] leading-[1.15] tracking-[0.08em] text-[#d3dae8] [text-shadow:0_-1px_1px_rgba(4,8,16,.9),0_1px_0_rgba(255,255,255,.07)]">
          {blogger.name}
        </h3>
        {silent != null && (
          <div className="gy-caps gy-grave mt-1 text-xs tracking-[0.18em] text-[#7e8aa3]">
            silent {silent.toLocaleString()} days
          </div>
        )}
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
            revived — the bounty did its work
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
    </>
  );
}
