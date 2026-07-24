"use client";

import { useState } from "react";
import { useBounties } from "@/lib/hooks";
import { GraveyardHero } from "@/components/graveyard/GraveyardHero";
import { MatchSlider } from "@/components/graveyard/MatchSlider";
import { dollars } from "@/lib/format";

export default function GraveyardHome() {
  const { bloggers, pledgesByBlogger, poolCents, poolUsedCents, liveThresholdCents } =
    useBounties();

  // Default to the highest-funded blogger (top of the sorted list); the
  // dropdown lets you switch.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sliderTarget = bloggers.find((b) => b.id === selectedId) ?? bloggers[0];

  return (
    <main>
      <GraveyardHero bloggers={bloggers} liveThresholdCents={liveThresholdCents} />

      {/* Mechanism */}
      <section id="how" className="bg-parchment px-6 py-24 text-[#2a3040] md:px-12">
        <div className="mx-auto max-w-[1060px]">
          <div className="mb-16 text-center">
            <p className="gy-caps text-[13px] tracking-[0.32em] text-[#8a7f5f]">the mechanism</p>
            <h2 className="mt-3 text-4xl text-[#232838] md:text-[46px]">How a revival works</h2>
          </div>
          <div className="grid gap-11 md:grid-cols-3">
            {[
              {
                numeral: "I",
                title: "Leave a pledge",
                body: "Pick a blogger you miss and pledge any amount.",
              },
              {
                numeral: "II",
                title: "Your pledge gets matched",
                body: "Quadratic matching from the pool adds more money the more people pledge.",
              },
              {
                numeral: "III",
                title: "At $1,000, it goes live",
                body: "If the blogger writes the post and links it here, they can claim the bounty.",
              },
            ].map((step) => (
              <div key={step.numeral} className="flex flex-col gap-3.5">
                <div className="gy-caps flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#b8ac88] text-[19px] text-[#8a7f5f]">
                  {step.numeral}
                </div>
                <h3 className="text-[25px] font-semibold text-[#232838]">{step.title}</h3>
                <p className="leading-[1.6] text-[#565c70] [text-wrap:pretty]">{step.body}</p>
              </div>
            ))}
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
                      {b.blogName ?? b.name}
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
    </main>
  );
}
