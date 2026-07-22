"use client";

import Link from "next/link";
import { useBounties } from "@/lib/hooks";
import { Headstone, eyebrowFor } from "@/components/graveyard/Headstone";
import { MatchSlider } from "@/components/graveyard/MatchSlider";
import { daysSilent } from "@/lib/qf";
import { dollars } from "@/lib/format";

export default function GraveyardHome() {
  const {
    isLoading,
    bloggers,
    pledgesByBlogger,
    poolCents,
    poolUsedCents,
    liveThresholdCents,
  } = useBounties();

  const heroStones = bloggers.slice(0, 6);
  // Slider demos the blogger closest to (but not past) the live threshold.
  const sliderTarget =
    bloggers.find((b) => !b.math.isLive && b.status === "funding") ??
    bloggers[0];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-10 pt-8 text-center md:px-12">
        <div className="gy-moon absolute right-[10%] top-6 hidden h-24 w-24 rounded-full md:block" />
        <p className="gy-label text-mist">
          a manifund project &nbsp;·&nbsp; quadratic funding
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-5xl leading-tight md:text-6xl">
          The best blogs on the internet aren&rsquo;t dead.{" "}
          <em>They&rsquo;re resting.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-moon/80">
          We pay bounties for beloved dormant bloggers to write one more post.
          Leave a pledge for a blogger you miss — we&rsquo;ll light a candle at
          their grave.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="#blogroll"
            className="gy-caps rounded-sm bg-candle px-7 py-3 font-medium text-night shadow-[0_0_30px_-6px_rgba(255,196,94,0.6)] transition hover:bg-candle/90"
          >
            fund a revival
          </Link>
          <Link
            href="#how"
            className="gy-caps rounded-sm border border-moon/30 px-7 py-3 text-moon/90 transition hover:border-moon/60"
          >
            how it works
          </Link>
        </div>
        <p className="mt-5 text-sm italic text-mist/80">
          Hover a headstone. Go on.
        </p>

        {/* Headstone row */}
        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-3 md:grid-cols-6">
            {heroStones.map((b, i) => (
              <Link
                key={b.id}
                href={`/graveyard/b/${b.slug}`}
                className={`gy-stone gy-rise group px-4 pb-5 text-center transition-transform duration-300 hover:-translate-y-2 ${
                  b.math.isLive ? "gy-stone-live" : ""
                } ${i % 2 === 0 ? "pt-10" : "pt-14"}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="gy-label text-[0.55rem] text-mist/70">
                  {eyebrowFor(b.slug)}
                </div>
                <div className="gy-caps mt-1.5 text-lg leading-tight text-moon">
                  {b.name}
                </div>
                <div className="gy-label mt-2 text-[0.55rem] text-mist/60">
                  silent {daysSilent(b.lastPostAt).toLocaleString()} days
                </div>
                <div className="mt-4 h-7">
                  {b.math.isLive && (
                    <span className="gy-candle inline-block">
                      <span className="gy-flame" />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="gy-ground pointer-events-none absolute -inset-x-6 -bottom-8 h-20" />
        </div>
      </section>

      {/* Mechanism */}
      <section id="how" className="bg-parchment px-6 py-20 text-night md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="gy-label text-center text-stone">the mechanism</p>
          <h2 className="mt-3 text-center text-4xl">How a revival works</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-stone-dark/80">
            Quadratic funding, a {dollars(poolCents, { round: true })} matching
            pool, and one simple ask: a single substantive post, roughly a
            thousand words.
          </p>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
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
              <div key={step.numeral} className="text-center md:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone/50 text-lg text-stone md:mx-0">
                  {step.numeral}
                </div>
                <h3 className="mt-5 text-2xl">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-stone-dark/90">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone/30 pt-6 md:flex-row">
            <p className="max-w-2xl text-sm italic text-stone-dark/80">
              &ldquo;The marginal thousand words from someone doing great work
              who never posts &gt;&gt; the marginal thousand from a daily
              poster.&rdquo;
            </p>
            <Link href="#blogroll" className="gy-caps text-sm text-stone underline underline-offset-4">
              visit the graves ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Match math demo */}
      <section id="match" className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="gy-label text-mist">the séance</p>
            <h2 className="mt-3 text-4xl">Try the match math</h2>
            <p className="mt-4 leading-relaxed text-moon/80">
              Quadratic funding sounds like an incantation; it&rsquo;s really a
              square root. Each bounty&rsquo;s match is{" "}
              <em>
                (sum of the square roots of every pledge)² minus the pledges
                themselves
              </em>
              , scaled so all matches fit inside the pool. Move the slider —
              watch a small pledge summon real money.
            </p>
            <p className="gy-label mt-6 text-mist/80">
              pool committed so far:{" "}
              <span className="text-candle">
                {dollars(poolUsedCents, { round: true })}
              </span>{" "}
              of {dollars(poolCents, { round: true })}
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
      <section id="blogroll" className="px-6 pb-24 pt-4 md:px-12">
        <p className="gy-label text-center text-mist">the full plot</p>
        <h2 className="mt-3 text-center text-4xl">The blogroll</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-moon/80">
          Every grave we&rsquo;re tending. Pledge to the ones you miss — or{" "}
          <a
            href="mailto:austin@manifund.org?subject=Nominate a dormant blog"
            className="text-candle underline underline-offset-4"
          >
            nominate a dormant blog
          </a>
          .
        </p>
        {isLoading ? (
          <p className="gy-label mt-16 text-center text-mist">
            raising the dead…
          </p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bloggers.map((b, i) => (
              <Headstone key={b.id} blogger={b} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
