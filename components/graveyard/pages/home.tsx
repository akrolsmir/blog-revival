"use client";

import { useState } from "react";
import { useBounties } from "@/lib/hooks";
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
          <h2 className="text-4xl text-[#232838] md:text-[42px]">What is this?</h2>
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
          <div className="mx-auto grid max-w-[1160px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bloggers.map((b, i) => (
              <Headstone key={b.id} blogger={b} index={i} />
            ))}
          </div>
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
