"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useBounties, useMyProfile } from "@/lib/hooks";
import { eyebrowFor } from "@/components/graveyard/Headstone";
import { PledgeBox } from "@/components/graveyard/PledgeBox";
import { daysSilent } from "@/lib/qf";
import { dollars, daysAgoWords } from "@/lib/format";

export default function GraveyardBloggerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const {
    isLoading,
    bloggers,
    pledgesByBlogger,
    poolCents,
    liveThresholdCents,
  } = useBounties();
  const { data: commentData } = db.useQuery({
    comments: {
      $: { where: { "blogger.slug": slug } },
      author: {},
    },
  });
  const { profile } = useMyProfile();
  const [commentText, setCommentText] = useState("");

  const blogger = bloggers.find((b) => b.slug === slug);
  if (isLoading) {
    return (
      <p className="gy-label py-32 text-center text-mist">raising the dead…</p>
    );
  }
  if (!blogger) {
    return (
      <main className="px-6 py-32 text-center">
        <p className="gy-label text-mist">no grave here</p>
        <h1 className="mt-4 text-4xl">This plot is empty.</h1>
        <Link
          href="/graveyard#blogroll"
          className="gy-caps mt-6 inline-block text-candle underline underline-offset-4"
        >
          back to the blogroll
        </Link>
      </main>
    );
  }

  const { math } = blogger;
  const silent = daysSilent(blogger.lastPostAt);
  const pct = Math.min(100, Math.round((math.totalCents / liveThresholdCents) * 100));
  const comments = (commentData?.comments ?? []).sort(
    (a: any, b: any) => b.createdAt - a.createdAt
  );
  const revived = blogger.status === "revived" || blogger.status === "paid";

  async function addComment() {
    if (!profile || !commentText.trim() || !blogger) return;
    await db.transact(
      db.tx.comments[id()]
        .update({ text: commentText.trim(), createdAt: Date.now() })
        .link({ author: profile.id, blogger: blogger.id })
    );
    setCommentText("");
  }

  return (
    <main className="px-6 pb-24 md:px-12">
      {/* Headstone header */}
      <section className="mx-auto max-w-3xl pt-8 text-center">
        <div className="gy-stone mx-auto max-w-xl px-8 pb-8 pt-16">
          <p className="gy-label text-mist/80">{eyebrowFor(blogger.slug)}</p>
          <h1 className="gy-caps mt-3 text-4xl text-moon md:text-5xl">
            {blogger.name}
          </h1>
          {blogger.blogName && blogger.blogName !== blogger.name && (
            <p className="mt-2 italic text-moon/70">of {blogger.blogName}</p>
          )}
          <p className="gy-label mt-3 text-mist/70">
            silent {silent.toLocaleString()} days
          </p>
          {blogger.epitaph && (
            <p className="mt-5 italic leading-relaxed text-moon/80">
              {blogger.epitaph}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-6">
            <a
              href={blogger.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gy-caps text-sm text-candle underline underline-offset-4"
            >
              visit the blog ↗
            </a>
            {math.isLive && !revived && (
              <span className="gy-label flex items-center gap-2 text-candle">
                live — candle lit
                <span className="gy-candle !h-5 !w-2">
                  <span className="gy-flame" />
                </span>
              </span>
            )}
          </div>
        </div>

        {revived && (
          <div className="mx-auto mt-8 max-w-xl rounded-md border border-candle/50 bg-candle/10 px-6 py-5">
            <p className="gy-label text-candle">risen from the grave</p>
            <p className="mt-2 text-moon">
              {blogger.name} wrote again
              {blogger.revivalPostUrl ? (
                <>
                  :{" "}
                  <a
                    href={blogger.revivalPostUrl}
                    className="text-candle underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {blogger.revivalPostTitle ?? "read the revival post"}
                  </a>
                </>
              ) : (
                "."
              )}
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-[1fr_380px]">
        <div>
          {/* Funding state */}
          <div className="rounded-md border border-moon/15 p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="gy-caps text-xl text-moon">the bounty</h2>
              <span className="gy-label text-mist">{pct}% funded</span>
            </div>
            <div className="gy-progress mt-4 h-2 w-full">
              <div style={{ width: `${pct}%` }} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-[15px] sm:grid-cols-4">
              <div>
                <dt className="gy-label text-mist/70">direct</dt>
                <dd className="mt-1 font-semibold text-moon">
                  {dollars(math.patronCents, { round: true })}
                </dd>
              </div>
              <div>
                <dt className="gy-label text-mist/70">personal bounty</dt>
                <dd className="mt-1 font-semibold text-moon">
                  {dollars(math.personalCents, { round: true })}
                </dd>
              </div>
              <div>
                <dt className="gy-label text-mist/70">pool match</dt>
                <dd className="mt-1 font-semibold text-candle">
                  +{dollars(math.matchCents, { round: true })}
                </dd>
              </div>
              <div>
                <dt className="gy-label text-mist/70">patrons</dt>
                <dd className="mt-1 font-semibold text-moon">
                  {blogger.supporterCount}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-mist">
              {dollars(math.totalCents, { round: true })} of{" "}
              {dollars(liveThresholdCents, { round: true })} to go live. Direct
              pledges are fixed; the match can drift with the pool until the
              bounty is claimed.
            </p>
          </div>

          {/* Last words */}
          {blogger.recentPosts && blogger.recentPosts.length > 0 && (
            <div className="mt-8 rounded-md border border-moon/15 p-6">
              <h2 className="gy-caps text-xl text-moon">last words</h2>
              <ul className="mt-4 space-y-3">
                {blogger.recentPosts.map((post) => (
                  <li key={post.url} className="flex items-baseline justify-between gap-4">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] text-moon underline decoration-moon/30 underline-offset-4 hover:decoration-candle"
                    >
                      {post.title}
                    </a>
                    <span className="gy-label shrink-0 text-mist/60">
                      {post.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mourners' register */}
          <div className="mt-8 rounded-md border border-moon/15 p-6">
            <h2 className="gy-caps text-xl text-moon">
              mourners&rsquo; register
            </h2>
            <p className="mt-1 text-sm text-mist">
              Why we miss this blog — signed by the patrons.
            </p>
            <ul className="mt-5 space-y-5">
              {comments.map((c: any) => (
                <li key={c.id} className="border-l-2 border-moon/20 pl-4">
                  <p className="text-[15px] leading-relaxed text-moon/90">
                    {c.text}
                  </p>
                  <p className="gy-label mt-2 text-mist/70">
                    {c.author ? (
                      <Link
                        href={`/graveyard/p/${c.author.handle}`}
                        className="hover:text-moon"
                      >
                        — {c.author.displayName}
                      </Link>
                    ) : (
                      "— anonymous"
                    )}
                  </p>
                </li>
              ))}
              {comments.length === 0 && (
                <li className="text-sm italic text-mist">
                  No one has signed yet. Be the first mourner.
                </li>
              )}
            </ul>
            {profile ? (
              <div className="mt-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  placeholder="What did this blog change for you?"
                  className="w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-[15px] text-moon placeholder:text-mist/60"
                />
                <button
                  type="button"
                  onClick={addComment}
                  disabled={!commentText.trim()}
                  className="gy-caps mt-3 rounded-sm border border-candle/60 px-5 py-2 text-sm text-candle hover:bg-candle/10 disabled:opacity-40"
                >
                  sign the register
                </button>
              </div>
            ) : (
              <p className="mt-6 text-sm text-mist">
                <Link
                  href={`/graveyard/signin?next=/graveyard/b/${blogger.slug}`}
                  className="text-candle underline underline-offset-4"
                >
                  Sign in
                </Link>{" "}
                to sign the register.
              </p>
            )}
          </div>
        </div>

        <aside>
          <Suspense>
            <PledgeBox
              bloggerId={blogger.id}
              bloggerName={blogger.name}
              bloggerSlug={blogger.slug}
              pledgesByBlogger={pledgesByBlogger}
              poolCents={poolCents}
              liveThresholdCents={liveThresholdCents}
            />
          </Suspense>
          <p className="mt-6 text-center text-sm text-mist">
            Are you {blogger.name}?{" "}
            <Link
              href="/graveyard/claim"
              className="text-candle underline underline-offset-4"
            >
              Claim your grave
            </Link>
          </p>
          {/* Recent pledges */}
          <div className="mt-8 rounded-md border border-moon/15 p-6">
            <h3 className="gy-caps text-lg text-moon">candles lit</h3>
            <ul className="mt-3 space-y-3">
              {(blogger.pledges ?? [])
                .slice()
                .sort((a: any, b: any) => b.createdAt - a.createdAt)
                .slice(0, 8)
                .map((p: any) => (
                  <li key={p.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-moon/85">
                        {p.patron?.displayName ?? "Anonymous"}
                        {p.source !== "patron" && (
                          <span className="gy-label ml-2 text-candle/90">
                            {p.source === "redirect"
                              ? "redirected bounty"
                              : "personal bounty"}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-moon">
                        {dollars(p.amountCents, { round: true })}
                      </span>
                    </div>
                    {p.note && (
                      <p className="mt-1 text-[13px] italic leading-snug text-mist">
                        &ldquo;{p.note}&rdquo; ·{" "}
                        {daysAgoWords(daysSilent(p.createdAt))}
                      </p>
                    )}
                  </li>
                ))}
              {(blogger.pledges ?? []).length === 0 && (
                <li className="text-sm italic text-mist">
                  No candles yet. The grave is dark.
                </li>
              )}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
