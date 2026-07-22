"use client";

import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useBounties, useMyProfile } from "@/lib/hooks";
import {
  claimBlogger,
  redirectBounty,
  donateBounty,
  startConnectOnboarding,
  withdrawBounty,
} from "@/lib/actions";
import { dollars } from "@/lib/format";

export default function GraveyardClaimPage() {
  const { user, profile, isLoading } = useMyProfile();
  const { bloggers, liveThresholdCents } = useBounties();
  const [selected, setSelected] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [redirectTarget, setRedirectTarget] = useState("");
  const [charity, setCharity] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mine = bloggers.filter(
    (b) => profile && b.claimedBy?.id === profile.id
  );
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
        If your name is on a headstone here: readers miss you enough to pay for
        one more post. Claim your profile, publish roughly a thousand
        substantive words anywhere you like, link the post, and the bounty is
        yours — via Stripe, redirected to revive a fellow blogger, or given to
        charity.
      </p>

      {!user && (
        <div className="mt-10 rounded-md border border-moon/15 p-6">
          <p className="text-moon/85">
            <Link
              href="/graveyard/signin?next=/graveyard/claim"
              className="text-candle underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            to claim a profile. We verify every claim by hand before paying
            out — pseudonymous bloggers included.
          </p>
        </div>
      )}

      {user && !profile && !isLoading && (
        <div className="mt-10 rounded-md border border-moon/15 p-6">
          <p className="text-moon/85">
            First,{" "}
            <Link
              href="/graveyard/account?next=/graveyard/claim"
              className="text-candle underline underline-offset-4"
            >
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
              <strong className="text-candle">
                {dollars(b.math.totalCents, { round: true })}
              </strong>{" "}
              ({b.math.isLive ? "live" : `not yet live — needs ${dollars(liveThresholdCents - b.math.totalCents, { round: true })} more`})
            </p>

            {!b.claimVerified && (
              <p className="mt-4 text-sm leading-relaxed text-moon/80">
                Manifund reviews each claim by hand (usually within a day) —
                we&rsquo;ll email you. Meanwhile you can line up your revival
                post.
              </p>
            )}

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
                    {revived ? "your revival post" : "1 · link your revival post"}
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
                            await db.transact(
                              db.tx.bloggers[b.id].update({
                                revivalPostUrl: postUrl.trim(),
                                revivalPostTitle: postTitle.trim() || undefined,
                                status: "revived",
                              })
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

                {/* Step 2: direct the bounty */}
                <div className="mt-6">
                  <h3 className="gy-caps text-lg text-moon">
                    2 · direct the bounty
                  </h3>
                  <p className="mt-1 text-xs text-mist">
                    Requires a verified claim and a linked post.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(() => startConnectOnboarding(b.id, "graveyard"))
                        }
                        className="gy-caps rounded-sm bg-candle px-5 py-2.5 text-sm font-medium text-night hover:bg-candle/90 disabled:opacity-40"
                      >
                        {b.stripeAccountId
                          ? "update stripe details"
                          : "set up stripe payout"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || !b.stripeAccountId}
                        onClick={() =>
                          run(
                            () => withdrawBounty(b.id),
                            "Transfer sent. Check your Stripe dashboard."
                          )
                        }
                        className="gy-caps rounded-sm border border-candle/60 px-5 py-2.5 text-sm text-candle hover:bg-candle/10 disabled:opacity-40"
                      >
                        withdraw {dollars(b.math.totalCents, { round: true })}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={redirectTarget}
                        onChange={(e) => setRedirectTarget(e.target.value)}
                        className="rounded-sm border border-moon/25 bg-night px-3 py-2 text-sm text-moon"
                      >
                        <option value="">
                          or: revive another blogger with it…
                        </option>
                        {bloggers
                          .filter((o) => o.id !== b.id && o.status === "funding")
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        disabled={busy || !redirectTarget}
                        onClick={() =>
                          run(
                            () => redirectBounty(b.id, redirectTarget),
                            "Redirected. Two revivals for the price of one."
                          )
                        }
                        className="gy-caps rounded-sm border border-moon/30 px-4 py-2 text-sm text-moon/85 hover:border-moon/60 disabled:opacity-40"
                      >
                        redirect
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={charity}
                        onChange={(e) => setCharity(e.target.value)}
                        placeholder="or: name a charity…"
                        className="rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-sm text-moon"
                      />
                      <button
                        type="button"
                        disabled={busy || !charity.trim()}
                        onClick={() =>
                          run(
                            () => donateBounty(b.id, charity.trim()),
                            "Donated. Manifund will regrant it."
                          )
                        }
                        className="gy-caps rounded-sm border border-moon/30 px-4 py-2 text-sm text-moon/85 hover:border-moon/60 disabled:opacity-40"
                      >
                        donate
                      </button>
                    </div>
                  </div>
                </div>
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
                run(
                  () => claimBlogger(selected),
                  "Claimed. We'll verify and email you shortly."
                )
              }
              className="gy-caps rounded-sm bg-candle px-6 py-2.5 font-medium text-night hover:bg-candle/90 disabled:opacity-40"
            >
              claim it
            </button>
          </div>
          <p className="mt-3 text-xs text-mist">
            Not on the list?{" "}
            <a
              href="mailto:austin@manifund.org?subject=Add me to the graveyard"
              className="text-candle underline underline-offset-4"
            >
              Ask for a headstone.
            </a>
          </p>
        </section>
      )}

      {msg && <p className="mt-6 text-candle">{msg}</p>}
      {error && <p className="mt-6 text-red-300">{error}</p>}
    </main>
  );
}
