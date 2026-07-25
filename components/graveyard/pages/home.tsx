"use client";

import { useState } from "react";
import Link from "next/link";
import { useBounties, usePendingNominations } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { GraveyardHero } from "@/components/graveyard/GraveyardHero";
import { Headstone } from "@/components/graveyard/Headstone";
import { MatchSlider } from "@/components/graveyard/MatchSlider";
import { GraveyardFaq } from "@/components/graveyard/Faq";
import { linkify } from "@/components/Linkify";
import { LAUNCH_PARAGRAPHS, LAUNCH_SIGNATURE } from "@/lib/content";
import { dollars } from "@/lib/format";

export default function GraveyardHome() {
  const { isLoading, bloggers, pledgesByBlogger, poolCents, poolUsedCents, liveThresholdCents } =
    useBounties();
  const { nominations: pending } = usePendingNominations();

  // Default to the highest-funded blogger (top of the sorted list); the
  // dropdown lets you switch.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sliderTarget = bloggers.find((b) => b.id === selectedId) ?? bloggers[0];

  return (
    <main>
      <GraveyardHero bloggers={bloggers} liveThresholdCents={liveThresholdCents} />

      {/* Launch post */}
      <section id="about" className="bg-parchment px-6 py-24 text-[#2a3040] md:px-12">
        <div className="mx-auto max-w-[680px]">
          <h2 className="text-4xl text-[#232838] md:text-[42px]">Why revive blogs?</h2>
          <div className="mt-8 space-y-5 text-[17px] leading-[1.7] text-[#3a4152]">
            {LAUNCH_PARAGRAPHS.map((p, i) => (
              <p key={i} className="[text-wrap:pretty]">
                {linkify(
                  p,
                  "font-medium text-[#8a5a1c] underline underline-offset-2 hover:text-[#6d4715]",
                )}
              </p>
            ))}
            <p className="gy-caps pt-1 text-[15px] tracking-[0.14em] text-[#6b6242]">
              {LAUNCH_SIGNATURE}
            </p>
          </div>
        </div>
      </section>

      {/* Match math demo */}
      <section id="match" className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-4xl">Try the match math</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-[#a9b3c8]">
              <p>
                The actual funding allocated to a bounty is the sum of the square roots of each
                individual pledge, squared.
              </p>
              <p>
                For instance, if ten people each donate $1, then the sum-of-square-roots is $10, and
                the square of that is $100, so $10 worth of donations will get matched with $90 from
                the pool.
              </p>
              <p>
                If the total match amount exceeds the money in the pool, the pool will be divided
                proportionally between bounties.
              </p>
            </div>
            <p className="gy-caps mt-6 text-[13px] tracking-[0.2em] text-mist">
              pool committed so far:{" "}
              <span className="text-gold">{dollars(poolUsedCents, { round: true })}</span> of{" "}
              {dollars(poolCents, { round: true })}
            </p>
          </div>
          {sliderTarget && (
            <div>
              <label className="block">
                <span className="gy-label text-mist">blogger</span>
                <select
                  value={sliderTarget.id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mt-2 w-full rounded-sm border border-moon/25 bg-night px-3 py-2 text-[15px] text-moon"
                >
                  {bloggers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3">
                <MatchSlider
                  pledgesByBlogger={pledgesByBlogger}
                  poolCents={poolCents}
                  liveThresholdCents={liveThresholdCents}
                  bloggerId={sliderTarget.id}
                  bloggerName={sliderTarget.name}
                  patronCount={sliderTarget.supporterCount}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Blogroll */}
      <section id="blogroll" className="px-6 pb-28 pt-16 md:px-12">
        {isLoading ? (
          <p className="gy-caps text-center tracking-[0.2em] text-mist">raising the dead…</p>
        ) : (
          <>
            <div className="mx-auto grid max-w-[1160px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bloggers.map((b, i) => (
                <Headstone key={b.id} blogger={b} index={i} />
              ))}
            </div>

            {/* Reader nominations still awaiting review. Deliberately plainer
                than a headstone — an unreviewed suggestion hasn't earned a
                grave or a bounty yet, and shouldn't read as though it has. */}
            {pending.length > 0 && (
              <div className="mx-auto mt-16 max-w-[1160px] border-t border-moon/10 pt-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h3 className="gy-label text-mist">awaiting a headstone</h3>
                  <Link href="/nominate" className="gy-label text-mist hover:text-moon">
                    nominate a blog
                  </Link>
                </div>
                <p className="mt-2 max-w-[62ch] text-[15px] text-[#8b96ad]">
                  Suggested by readers, not yet reviewed. Approved nominations get a grave and a
                  bounty of their own.
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {pending.map((n) => {
                    const silent = n.lastPostAt != null ? daysSilent(n.lastPostAt) : null;
                    return (
                      <li
                        key={n.id}
                        className="rounded-[3px] border border-dashed border-moon/15 bg-[#0e1626]/60 px-4 py-3"
                      >
                        <a
                          href={n.blogUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[16px] text-moon/90 underline decoration-moon/20 underline-offset-4 hover:decoration-candle"
                        >
                          {n.blogName || n.authorName}
                        </a>
                        <p className="gy-label mt-1 text-mist/80">
                          {n.blogName && n.blogName !== n.authorName && <>{n.authorName}</>}
                          {n.blogName && n.blogName !== n.authorName && silent != null && " · "}
                          {silent != null && <>silent {silent.toLocaleString()} days</>}
                        </p>
                        {n.submitter && (
                          <p className="mt-1 text-[13px] text-mist">
                            nominated by{" "}
                            <Link
                              href={`/p/${n.submitter.handle}`}
                              className="underline decoration-moon/20 underline-offset-4 hover:decoration-candle"
                            >
                              {n.submitter.displayName}
                            </Link>
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#141d30] px-6 pb-28 pt-20 md:px-12">
        <div className="mx-auto max-w-[720px]">
          <p className="gy-label text-mist">answers</p>
          <h2 className="mt-3 text-4xl md:text-[46px]">FAQ</h2>
          <div className="mt-10">
            <GraveyardFaq />
          </div>
        </div>
      </section>
    </main>
  );
}
