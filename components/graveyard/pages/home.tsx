"use client";

import Link from "next/link";
import { useBounties } from "@/lib/hooks";
import { Headstone } from "@/components/graveyard/Headstone";
import { GraveyardHero } from "@/components/graveyard/GraveyardHero";
import { MatchSlider } from "@/components/graveyard/MatchSlider";
import { dollars } from "@/lib/format";

export default function GraveyardHome() {
  const { isLoading, bloggers, pledgesByBlogger, poolCents, poolUsedCents, liveThresholdCents } =
    useBounties();

  // Slider demos the blogger closest to (but not past) the live threshold.
  const sliderTarget =
    bloggers.find((b) => !b.math.isLive && b.status === "funding") ?? bloggers[0];

  return (
    <main>
      <GraveyardHero bloggers={bloggers} liveThresholdCents={liveThresholdCents} />

      {/* Mechanism */}
      <section id="how" className="bg-parchment px-6 py-24 text-[#2a3040] md:px-12">
        <div className="mx-auto max-w-[1060px]">
          <div className="mb-16 text-center">
            <p className="gy-caps text-[13px] tracking-[0.32em] text-[#8a7f5f]">the mechanism</p>
            <h2 className="mt-3 text-4xl text-[#232838] md:text-[46px]">How a revival works</h2>
            <p className="mx-auto mt-4 max-w-[540px] text-lg text-[#5d6377] [text-wrap:pretty]">
              Quadratic funding, a {dollars(poolCents, { round: true })} matching pool, and one
              simple ask: a single substantive post, roughly a thousand words.
            </p>
          </div>
          <div className="grid gap-11 md:grid-cols-3">
            {[
              {
                numeral: "I",
                title: "Leave a pledge",
                body: "Pick a dormant blogger you miss and pledge any amount — five dollars counts. Pledges are tax-deductible through Manifund, a 501(c)(3). Leave a note about why you want them back; they'll read it.",
              },
              {
                numeral: "II",
                title: "The pool matches the crowd",
                body: "Quadratic matching from the pool rewards breadth: fifty readers at $10 pull far more matching than one patron at $500. The blogs people collectively miss most rise first.",
              },
              {
                numeral: "III",
                title: "At $1,000, it goes live",
                body: "Once pledges plus matching hit $1,000, the bounty is live. The blogger writes, links the post, and claims payment via Stripe — or redirects it to revive another blogger, or to charity.",
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
          <div className="mt-16 flex flex-wrap items-baseline justify-between gap-3 border-t border-[#d6cfb9] pt-6">
            <p className="text-[15.5px] italic text-[#6d7386]">
              &ldquo;The marginal thousand words from someone doing great work who never posts
              &gt;&gt; the marginal thousand from a daily poster.&rdquo;
            </p>
            <Link
              href="#blogroll"
              className="gy-caps border-b border-[#b8ac88] pb-1 text-sm tracking-[0.18em] text-[#7c6d3f]"
            >
              visit the graves ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Match math demo */}
      <section id="match" className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="gy-caps text-[13px] tracking-[0.32em] text-mist">the séance</p>
            <h2 className="mt-3 text-4xl">Try the match math</h2>
            <p className="mt-4 leading-relaxed text-[#a9b3c8]">
              Quadratic funding sounds like an incantation; it&rsquo;s really a square root. Each
              bounty&rsquo;s match is{" "}
              <em>(sum of the square roots of every pledge)² minus the pledges themselves</em>,
              scaled so all matches fit inside the pool. Move the slider — watch a small pledge
              summon real money.
            </p>
            <p className="gy-caps mt-6 text-[13px] tracking-[0.2em] text-mist">
              pool committed so far:{" "}
              <span className="text-gold">{dollars(poolUsedCents, { round: true })}</span> of{" "}
              {dollars(poolCents, { round: true })}
            </p>
          </div>
          {sliderTarget && (
            <MatchSlider
              pledgesByBlogger={pledgesByBlogger}
              poolCents={poolCents}
              liveThresholdCents={liveThresholdCents}
              bloggerId={sliderTarget.id}
              bloggerName={sliderTarget.name}
              patronCount={sliderTarget.supporterCount}
            />
          )}
        </div>
      </section>

      {/* Blogroll */}
      <section id="blogroll" className="px-6 pb-28 pt-6 md:px-12">
        <div className="text-center">
          <p className="gy-caps text-[13px] tracking-[0.32em] text-mist">the full plot</p>
          <h2 className="mt-3 text-4xl md:text-[46px]">The blogroll</h2>
          <p className="mx-auto mt-4 max-w-[520px] text-lg text-[#a9b3c8] [text-wrap:pretty]">
            Every grave we&rsquo;re tending. Pledge to the ones you miss — or{" "}
            <Link href="/nominate" className="text-[#e8c87a] hover:text-[#f6e0a8]">
              nominate a blogger
            </Link>{" "}
            we&rsquo;ve overlooked.
          </p>
        </div>
        {isLoading ? (
          <p className="gy-caps mt-16 text-center tracking-[0.2em] text-mist">raising the dead…</p>
        ) : (
          <div className="mx-auto mt-14 grid max-w-[1160px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bloggers.map((b, i) => (
              <Headstone key={b.id} blogger={b} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
