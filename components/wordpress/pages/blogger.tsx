"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useBounties, useMyProfile } from "@/lib/hooks";
import { WpPledgeForm } from "@/components/wordpress/WpPledgeForm";
import { daysSilent } from "@/lib/qf";
import { dollars, bloggerIcon } from "@/lib/format";

export default function WpBloggerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { isLoading, bloggers, pledgesByBlogger, poolCents, liveThresholdCents } = useBounties();
  const { data: commentData } = db.useQuery({
    comments: { $: { where: { "blogger.slug": slug } }, author: {} },
  });
  const { profile } = useMyProfile();
  const [commentText, setCommentText] = useState("");

  const blogger = bloggers.find((b) => b.slug === slug);
  if (isLoading) return <p className="wp-meta italic">Loading…</p>;
  if (!blogger) {
    return (
      <div>
        <h2 className="text-[22px] font-bold">404 — Not Found</h2>
        <p className="mt-2">
          No bounty here. <Link href="/">← Back to the front page</Link>
        </p>
      </div>
    );
  }

  const silent = blogger.lastPostAt != null ? daysSilent(blogger.lastPostAt) : null;
  const revived = blogger.status === "revived" || blogger.status === "paid";
  const comments = (commentData?.comments ?? []).sort(
    (a: any, b: any) => a.createdAt - b.createdAt,
  );
  const pledges = (blogger.pledges ?? [])
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  async function addComment() {
    if (!profile || !commentText.trim() || !blogger) return;
    await db.transact(
      db.tx.comments[id()]
        .update({ text: commentText.trim(), createdAt: Date.now() })
        .link({ author: profile.id, blogger: blogger.id }),
    );
    setCommentText("");
  }

  return (
    <article>
      <h2 className="flex items-center gap-3 text-[26px] font-bold leading-snug">
        <img
          src={bloggerIcon(blogger.blogUrl, blogger.photoUrl)}
          alt=""
          width={36}
          height={36}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-9 w-9 flex-none rounded border border-wpborder bg-white object-contain"
        />
        {blogger.blogName ?? blogger.name}
      </h2>
      <p className="mt-1 text-[13px]">
        {dollars(blogger.math.directCents, { round: true })} direct +{" "}
        <span className="font-bold text-wpgreen">
          {dollars(blogger.math.matchCents, { round: true })} match
        </span>{" "}
        = <strong>{dollars(blogger.math.totalCents, { round: true })}</strong> /{" "}
        {dollars(liveThresholdCents, { round: true })} ·{" "}
        {revived ? (
          <span className="font-bold text-wpgreen">REVIVED</span>
        ) : blogger.math.isLive ? (
          <span className="font-bold text-wpgreen">LIVE</span>
        ) : (
          <span className="font-bold text-wpmeta">FUNDING</span>
        )}
      </p>
      <p className="wp-meta mt-0.5">
        by <strong>{blogger.name}</strong>
        {blogger.pseudonymous ? " (pseudonymous)" : ""} ·{" "}
        <a href={blogger.blogUrl} target="_blank" rel="noopener noreferrer">
          {blogger.blogUrl.replace(/^https?:\/\/(www\.)?/, "")}
        </a>{" "}
        {silent != null && (
          <>
            · last post <em>{silent.toLocaleString()}</em> days ago{" "}
          </>
        )}
        · {blogger.supporterCount} patron
        {blogger.supporterCount === 1 ? "" : "s"} ·{" "}
        <a href="#comments">{comments.length} comments</a>
      </p>

      {revived && (
        <div className="mt-4 rounded border border-wpgreen/50 bg-green-50 px-4 py-3">
          <p className="text-[13px]">
            <strong className="text-wpgreen">Update:</strong> {blogger.name} posted again
            {blogger.revivalPostUrl ? (
              <>
                {" — "}
                <a href={blogger.revivalPostUrl} target="_blank" rel="noopener noreferrer">
                  {blogger.revivalPostTitle ?? "read the new post"}
                </a>
              </>
            ) : (
              "."
            )}
          </p>
        </div>
      )}

      {blogger.recentPosts && blogger.recentPosts.length > 0 && (
        <section className="mt-6">
          <h3 className="text-[15px] font-bold">Notable posts</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[13px]">
            {blogger.recentPosts.map((post) => (
              <li key={post.url}>
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <Suspense>
          <WpPledgeForm
            bloggerId={blogger.id}
            bloggerName={blogger.name}
            bloggerSlug={blogger.slug}
            pledgesByBlogger={pledgesByBlogger}
            poolCents={poolCents}
            liveThresholdCents={liveThresholdCents}
          />
        </Suspense>
        <p className="wp-meta mt-2">
          Are you {blogger.name}? <Link href="/claim">Claim this profile</Link> to direct the
          bounty.
        </p>
      </section>

      {/* Pledge ledger */}
      <section className="mt-8">
        <h3 className="text-[15px] font-bold">The ledger</h3>
        <table className="mt-2 w-full text-[12.5px]">
          <tbody>
            {pledges.slice(0, 10).map((p: any) => (
              <tr key={p.id} className="border-b border-dotted border-wpborder">
                <td className="py-1.5 pr-2">
                  {p.patron ? (
                    <Link href={`/p/${p.patron.handle}`}>{p.patron.displayName}</Link>
                  ) : (
                    "Anonymous"
                  )}
                </td>
                <td className="py-1.5 text-right font-bold">
                  {dollars(p.amountCents, { round: true })}
                </td>
              </tr>
            ))}
            {pledges.length === 0 && (
              <tr>
                <td className="wp-meta py-1.5 italic">No pledges yet. Start the ledger.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Comments */}
      <section id="comments" className="mt-8">
        <h3 className="text-[15px] font-bold">
          {comments.length} Response{comments.length === 1 ? "" : "s"} to{" "}
          <em>&ldquo;{blogger.blogName ?? blogger.name}&rdquo;</em>
        </h3>
        <ol className="mt-3 space-y-4">
          {comments.map((c: any, i: number) => (
            <li
              key={c.id}
              className={`rounded border border-wpborder px-4 py-3 ${
                i % 2 === 0 ? "bg-[#fafaf8]" : "bg-white"
              }`}
            >
              <p className="text-[12px] font-bold">
                {c.author ? (
                  <Link href={`/p/${c.author.handle}`}>{c.author.displayName}</Link>
                ) : (
                  "Anonymous"
                )}{" "}
                <span className="wp-meta font-normal">says:</span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed">{c.text}</p>
            </li>
          ))}
        </ol>
        {profile ? (
          <div className="mt-5">
            <h4 className="text-[13px] font-bold">Leave a Reply</h4>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="mt-2 w-full"
            />
            <button
              type="button"
              onClick={addComment}
              disabled={!commentText.trim()}
              className="mt-2"
            >
              Submit Comment
            </button>
          </div>
        ) : (
          <p className="mt-5 text-[12.5px]">
            <Link href={`/signin?next=/b/${blogger.slug}`}>Sign in</Link> to leave a comment.
          </p>
        )}
      </section>

      <p className="mt-8">
        <Link href="/">« Back to all bounties</Link>
      </p>
    </article>
  );
}
