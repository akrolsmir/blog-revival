"use client";

import Link from "next/link";
import { useBounties, topPatrons } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { dollars, bloggerIcon } from "@/lib/format";
import { WpMatchMath } from "@/components/wordpress/MatchMath";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function WordpressHome() {
  const { isLoading, bloggers, poolCents } = useBounties();

  return (
    <div className="space-y-10">
      {/* Intro post */}
      <article>
        <h2 className="text-[26px] font-bold leading-snug">
          A lot of great bloggers have stopped blogging. Let&rsquo;s offer them bounties to start
          again!
        </h2>
        <p className="wp-meta mt-1">{fmtDate(new Date())}</p>
        <div className="mt-4 space-y-4 text-[13.5px] leading-relaxed">
          <p>
            Some of the bloggers that most shaped our thinking — Holden Karnofsky, Paul Christiano,
            Sam Altman, and many others — aren't blogging anymore. Many blogs are victims of their
            own success, and over time more important context ends up stuck in the heads of people
            who are too busy to blog.
          </p>
          <p>
            Substack is great, but the platform economics reward frequent posting to build an
            audience. The marginal post from someone who rarely blogs is worth a lot more than the
            marginal post from even a good substacker.
          </p>
          <p>
            To address this, the Blog Revival Project coordinates bounties. Patrons pledge toward a
            specific blogger and the blogger can write one new post of at least 1000 words to claim
            the funds. Pledges are matched from a {dollars(poolCents, { round: true })}{" "}
            <a
              href="https://vitalik.eth.limo/general/2019/12/07/quadratic.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              quadratic funding
            </a>{" "}
            pool, so many small pledges beat one big one.
          </p>
          <p className="font-bold">
            <Link href="/signin?next=/account">Sign up now</Link>! The first 100 patrons will get
            $25 of credit to pledge to the bloggers of their choice.
          </p>
        </div>
        <p className="mt-4">
          <a href="#bounties" className="font-bold">
            Read the bounties ↓
          </a>{" "}
          · <Link href="/account">Become a patron</Link> ·{" "}
          <Link href="/claim">Claim your blogger profile</Link>
        </p>
      </article>

      <hr className="border-t border-dotted border-wpborder" />

      {/* Quadratic funding post */}
      <article>
        <h2 className="text-[26px] font-bold leading-snug">Quadratic funding</h2>
        <p className="wp-meta mt-1">{fmtDate(new Date())}</p>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_248px]">
          <div className="min-w-0">
            <div className="space-y-4 text-[13.5px] leading-relaxed">
              <p>
                The actual funding allocated to a bounty is the sum of the square roots of each
                individual pledge, squared.
              </p>
            </div>
            <div
              id="math"
              className="mt-5 overflow-x-auto rounded border border-wpborder bg-[#fafaf8] px-6 py-5 text-center text-[20px]"
              dangerouslySetInnerHTML={{
                __html:
                  "<math><mrow><mi>funding</mi><mo>=</mo><msup><mrow><mo>(</mo>" +
                  "<msqrt><msub><mi>p</mi><mn>1</mn></msub></msqrt><mo>+</mo>" +
                  "<msqrt><msub><mi>p</mi><mn>2</mn></msub></msqrt><mo>+</mo><mo>⋯</mo><mo>+</mo>" +
                  "<msqrt><msub><mi>p</mi><mi>n</mi></msub></msqrt><mo>)</mo></mrow><mn>2</mn></msup>" +
                  "</mrow></math>",
              }}
            />
            <p className="mt-3 text-[13.5px] leading-relaxed">
              For instance, if ten people each donate $1, then the sum-of-square-roots is $10, and
              the square of that is $100, so $10 worth of donations will get matched with $90 from
              the pool.
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed">
              If the total match amount exceeds the money in the pool, the pool will be divided
              proportionally between bounties.
            </p>
          </div>
          <WpMatchMath />
        </div>
      </article>

      <hr className="border-t border-dotted border-wpborder" />

      {/* Bounties as posts */}
      <div id="bounties" className="grid gap-5 sm:grid-cols-2">
        {isLoading && <p className="wp-meta italic">Loading the bounties…</p>}
        {bloggers.map((b) => {
          const silent = b.lastPostAt != null ? daysSilent(b.lastPostAt) : null;
          const revived = b.status === "revived" || b.status === "paid";
          const top = topPatrons(b);
          return (
            <article
              key={b.id}
              className="flex flex-col rounded border border-wpborder bg-[#fafaf8] p-4"
            >
              <h2 className="flex items-center gap-2.5 text-[20px] font-bold">
                <img
                  src={bloggerIcon(b.blogUrl, b.photoUrl)}
                  alt=""
                  width={28}
                  height={28}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-7 w-7 flex-none rounded border border-wpborder bg-white object-contain"
                />
                <Link href={`/b/${b.slug}`} className="!text-wpink !no-underline hover:!underline">
                  {b.name}
                </Link>
              </h2>
              {b.blogName && b.blogName !== b.name && (
                <p className="wp-meta mt-0.5 italic">{b.blogName}</p>
              )}
              <p className="mt-1 text-[12.5px]">
                {dollars(b.math.directCents, { round: true })} direct +{" "}
                <span className="font-bold">
                  {dollars(b.math.matchCents, { round: true })} match
                </span>{" "}
                = <strong>{dollars(b.math.totalCents, { round: true })}</strong> / $1,000 ·{" "}
                {revived ? (
                  <span className="font-bold text-wpgreen">REVIVED</span>
                ) : b.math.isLive ? (
                  <span className="font-bold text-wpgreen">LIVE</span>
                ) : (
                  <span className="font-bold text-wpmeta">FUNDING</span>
                )}
              </p>
              <p className="wp-meta mt-0.5">
                <a href={b.blogUrl} target="_blank" rel="noopener noreferrer" className="italic">
                  {b.blogUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </a>{" "}
                {silent != null && (
                  <>
                    · last post <em>{silent.toLocaleString()}</em> days ago{" "}
                  </>
                )}
                · {b.supporterCount} patron
                {b.supporterCount === 1 ? "" : "s"}
              </p>
              {top.length > 0 && (
                <p className="wp-meta mt-0.5">
                  Funded by{" "}
                  {top.map((t, i) => (
                    <span key={t.id}>
                      {i > 0 && ", "}
                      <Link href={`/p/${t.handle}`}>{t.displayName}</Link>
                    </span>
                  ))}
                </p>
              )}
              <p className="mt-auto pt-3">
                <Link href={`/b/${b.slug}`} className="font-bold">
                  Fund this bounty →
                </Link>
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
