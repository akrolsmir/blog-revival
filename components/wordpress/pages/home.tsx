"use client";

import Link from "next/link";
import { useBounties, topPatrons } from "@/lib/hooks";
import { daysSilent } from "@/lib/qf";
import { dollars, bloggerIcon } from "@/lib/format";
import { WpMatchMath } from "@/components/wordpress/MatchMath";
import { WpFaq } from "@/components/wordpress/Faq";
import { linkify } from "@/components/Linkify";
import { LAUNCH_PARAGRAPHS } from "@/lib/content";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function WordpressHome() {
  const { isLoading, bloggers } = useBounties();

  return (
    <div className="space-y-10">
      {/* Launch post */}
      <article>
        <h2 className="text-[26px] font-bold leading-snug">
          A lot of great bloggers have stopped blogging. Let&rsquo;s offer them bounties to start
          again!
        </h2>
        <p className="wp-meta mt-1">Posted by Carol and Austin · {fmtDate(new Date())}</p>
        <div className="mt-4 space-y-4 text-[13.5px] leading-relaxed">
          {LAUNCH_PARAGRAPHS.map((p, i) => (
            <p key={i}>{linkify(p)}</p>
          ))}
        </div>
        <p className="mt-4">
          <Link href="/signin?next=/account" className="font-bold">
            Sign up now
          </Link>{" "}
          ·{" "}
          <a href="#bounties" className="font-bold">
            Read the bounties ↓
          </a>{" "}
          · <a href="#faq">FAQ ↓</a>
        </p>
      </article>

      <hr className="border-t border-dotted border-wpborder" />

      {/* Quadratic funding post */}
      <article>
        <h2 className="text-[26px] font-bold leading-snug">Quadratic funding</h2>
        <p className="wp-meta mt-1">{fmtDate(new Date())}</p>
        <div className="mt-4 grid gap-6 min-[1180px]:grid-cols-[1fr_248px]">
          <div className="min-w-0">
            <div className="space-y-4 text-[13.5px] leading-relaxed">
              <p>
                The actual funding allocated to a bounty is the sum of the square roots of each
                individual pledge, squared.
              </p>
            </div>
            <div
              id="math"
              className="mt-5 overflow-x-auto rounded border border-wpborder bg-[#fafaf8] px-4 py-5 text-center text-[clamp(15px,1.8vw,20px)]"
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
          const others = Math.max(0, b.supporterCount - top.length);
          const blogLabel =
            b.blogName && b.blogName !== b.name
              ? b.blogName
              : b.blogUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
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
              <p className="wp-meta mt-0.5 italic">
                <a href={b.blogUrl} target="_blank" rel="noopener noreferrer">
                  {blogLabel}
                </a>
                {silent != null && <> · last post {silent.toLocaleString()} days ago</>}
              </p>
              <p className="mt-1.5 text-[12.5px]">
                {dollars(b.math.directCents, { round: true })} +{" "}
                {dollars(b.math.matchCents, { round: true })} match ={" "}
                <strong className={b.math.isLive ? "text-wpgreen" : undefined}>
                  {dollars(b.math.totalCents, { round: true })}
                </strong>
                {!b.math.isLive && " / $1,000"}
                {revived && (
                  <>
                    {" · "}
                    <span className="font-bold text-wpgreen">REVIVED</span>
                  </>
                )}
              </p>
              {top.length > 0 && (
                <p className="wp-meta mt-0.5">
                  Funded by{" "}
                  {top.map((t, i) => (
                    <span key={t.id}>
                      {i > 0 && (i === top.length - 1 && others === 0 ? " and " : ", ")}
                      <Link href={`/p/${t.handle}`}>{t.displayName}</Link>
                    </span>
                  ))}
                  {others > 0 && ` and ${others} other${others === 1 ? "" : "s"}`}
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

      <hr className="border-t border-dotted border-wpborder" />

      {/* FAQ post */}
      <article id="faq">
        <h2 className="text-[26px] font-bold leading-snug">Frequently asked questions</h2>
        <div className="mt-4">
          <WpFaq />
        </div>
      </article>
    </div>
  );
}
