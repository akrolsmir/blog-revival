"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useBounties, useMyProfile } from "@/lib/hooks";
import { claimBlogger } from "@/lib/actions";
import posthog from "posthog-js";
import { dollars } from "@/lib/format";

export default function GraveyardClaimPage() {
  const { user, profile, isLoading } = useMyProfile();
  const { bloggers, liveThresholdCents } = useBounties();
  const [selected, setSelected] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mine = bloggers.filter((b) => profile && b.claimedBy?.id === profile.id);
  const unclaimed = bloggers.filter((b) => !b.claimedBy);

  async function run(fn: () => Promise<any>, successMsg?: string) {
    setBusy(true);
    setError(null);
    setMsg(null);
    const res = await fn();
    if (res?.error) setError(res.error);
    else if (res?.url) window.location.href = res.url;
    else setMsg(successMsg ?? "Done.");
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="gy-label text-mist">for the resting</p>
      <h1 className="mt-3 text-5xl">Claim your grave</h1>
      <p className="mt-5 max-w-xl leading-relaxed text-moon/85">
        If you&rsquo;re one of the bloggers listed here, you can sign in to claim your profile.
        Publish a 1000-word post and link it here to receive the bounty. You can withdraw it to your
        bank account, redirect it to revive another blogger, or give it to charity via Manifund.
      </p>

      {!user && (
        <div className="mt-10 rounded-md border border-moon/15 p-6">
          <p className="text-moon/85">
            <Link href="/signin?next=/claim" className="text-candle underline underline-offset-4">
              Sign in
            </Link>{" "}
            to claim a profile.
          </p>
        </div>
      )}

      {user && !profile && !isLoading && (
        <div className="mt-10 rounded-md border border-moon/15 p-6">
          <p className="text-moon/85">
            First,{" "}
            <Link href="/account?next=/claim" className="text-candle underline underline-offset-4">
              create your profile
            </Link>
            . A user can be both patron and blogger.
          </p>
        </div>
      )}

      {/* My claimed graves */}
      {mine.map((b) => {
        const revived = b.status === "revived" || b.status === "paid";
        return (
          <section key={b.id} className="mt-10 rounded-md border border-candle/40 p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="gy-caps text-2xl text-moon">{b.name}</h2>
              <span className="gy-label text-mist">
                {b.claimVerified ? "claim verified" : "verification pending"}
              </span>
            </div>
            <p className="mt-2 text-sm text-mist">
              Bounty:{" "}
              <strong className="text-candle">{dollars(b.math.totalCents, { round: true })}</strong>{" "}
              (
              {b.math.isLive
                ? "live"
                : `not yet live — needs ${dollars(liveThresholdCents - b.math.totalCents, { round: true })} more`}
              )
            </p>

            {b.status === "paid" ? (
              <p className="mt-4 text-moon/85">
                Bounty claimed{" "}
                {b.bountyDirection === "redirect"
                  ? "and redirected to a fellow blogger. Thank you twice."
                  : b.bountyDirection === "charity"
                    ? `and donated${b.bountyDirectionDetail ? ` to ${b.bountyDirectionDetail}` : ""}. Thank you twice.`
                    : ". Welcome back."}
              </p>
            ) : (
              <>
                {/* Step 1: link the post */}
                <div className="mt-5">
                  <h3 className="gy-caps text-lg text-moon">
                    {revived ? "your revival post" : "link your revival post"}
                  </h3>
                  {revived ? (
                    <p className="mt-2 text-sm text-moon/80">
                      <a
                        href={b.revivalPostUrl}
                        className="text-candle underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {b.revivalPostTitle ?? b.revivalPostUrl}
                      </a>
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Post title"
                        className="rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon"
                      />
                      <input
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                        placeholder="https://…"
                        className="rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon"
                      />
                      <button
                        type="button"
                        disabled={busy || !postUrl.trim()}
                        onClick={() =>
                          run(async () => {
                            posthog.capture("revival_post_linked", {
                              blogger_id: b.id,
                              blogger_name: b.name,
                              skin: "graveyard",
                            });
                            await db.transact(
                              db.tx.bloggers[b.id].update({
                                revivalPostUrl: postUrl.trim(),
                                revivalPostTitle: postTitle.trim() || undefined,
                                status: "revived",
                              }),
                            );
                            return {};
                          }, "Post linked. One step closer to daylight.")
                        }
                        className="gy-caps rounded-sm border border-candle/60 px-4 py-2 text-sm text-candle hover:bg-candle/10 disabled:opacity-40"
                      >
                        link it
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-5 text-sm leading-relaxed text-moon/70">
                  Once your identity is confirmed, you can email us to arrange the payout.
                </p>
              </>
            )}
          </section>
        );
      })}

      {/* Claim a profile */}
      {user && profile && (
        <section className="mt-10 rounded-md border border-moon/15 p-6">
          <h2 className="gy-caps text-xl text-moon">find your headstone</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="min-w-56 rounded-sm border border-moon/25 bg-night px-3 py-2 text-moon"
            >
              <option value="">Choose your name…</option>
              {unclaimed.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !selected}
              onClick={() =>
                run(async () => {
                  posthog.capture("blogger_claimed", {
                    blogger_id: selected,
                    skin: "graveyard",
                  });
                  return claimBlogger(selected);
                }, "Claimed. We'll verify and email you shortly.")
              }
              className="gy-caps rounded-sm bg-candle px-6 py-2.5 font-medium text-night hover:bg-candle/90 disabled:opacity-40"
            >
              claim it
            </button>
          </div>
        </section>
      )}

      {msg && <p className="mt-6 text-candle">{msg}</p>}
      {error && <p className="mt-6 text-red-300">{error}</p>}
    </main>
  );
}
