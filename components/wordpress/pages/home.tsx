"use client";

import Link from "next/link";
import { useBounties } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { dollars, bloggerIcon } from "@/lib/format";

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
          A lot of great bloggers have stopped blogging. Let&rsquo;s offer them bounties to start again!
        </h2>
        <p className="wp-meta mt-1">{fmtDate(new Date())}</p>
        <div className="mt-4 space-y-4 text-[13.5px] leading-relaxed">
          <p>
            Some of the bloggers that most shaped our thinking — Holden
            Karnofsky, Paul Christiano, Sam Altman, and many others — aren't
            blogging anymore. Many blogs are victims of their own success, and
            over time more important context ends up stuck in the heads of
            people who are too busy to blog.
          </p>
          <p>
            Substack is great, but the platform economics reward frequent
            posting to build an audience. The marginal post from someone who
            rarely blogs is worth a lot more than the marginal post from even a
            good substacker.
          </p>
          <p>
            The Blog Revival Project coordinates bounties. Patrons pledge toward
            a specific blogger and the blogger can write one new post of at
            least 1000 words to claim the funds.
          </p>
          <p>
            Pledges are matched from a{" "}
            <strong>
              {dollars(poolCents, { round: true })}{" "}
              <a
                href="https://vitalik.eth.limo/general/2019/12/07/quadratic.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                quadratic funding
              </a>{" "}
              pool
            </strong>,
            so many small pledges beat one big one.
          </p>
        </div>
        <div
          id="math"
          className="mt-5 rounded border border-wpborder bg-[#fafaf8] px-6 py-5 text-center"
        >
          <p className="wp-serif text-[17px] italic">
            match<sub>b</sub> &nbsp;=&nbsp; pool ×{" "}
            <span className="whitespace-nowrap">
              (Σ<sub>i</sub> √p<sub>i,b</sub>)² &nbsp;/&nbsp; Σ<sub>b′</sub>(Σ
              <sub>i</sub> √p<sub>i,b′</sub>)²
            </span>
          </p>
          <p className="wp-meta mt-3">
            example: 12 patrons pledge $740 →{" "}
            <span className="font-bold text-wpgreen">+$312 match</span> ={" "}
            <strong>$1,052</strong> / $1,000 →{" "}
            <span className="font-bold text-wpgreen">LIVE</span>
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

      {/* Bounties as posts */}
      <div id="bounties" className="space-y-9">
        {isLoading && <p className="wp-meta italic">Loading the bounties…</p>}
        {bloggers.map((b) => {
          const silent = daysSilent(b.lastPostAt);
          const revived = b.status === "revived" || b.status === "paid";
          return (
            <article key={b.id}>
              <h2 className="flex items-center gap-2.5 text-[22px] font-bold">
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
                  {b.blogName ?? b.name}
                </Link>
              </h2>
              <p className="mt-1 text-[12.5px]">
                {dollars(b.math.directCents, { round: true })} direct +{" "}
                <span className="font-bold text-wpgreen">
                  {dollars(b.math.matchCents, { round: true })} match
                </span>{" "}
                = <strong>{dollars(b.math.totalCents, { round: true })}</strong>{" "}
                / $1,000 ·{" "}
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
                · last post <em>{silent.toLocaleString()}</em> days ago ·{" "}
                {b.supporterCount} patron{b.supporterCount === 1 ? "" : "s"}
              </p>
              <p className="mt-2">
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
