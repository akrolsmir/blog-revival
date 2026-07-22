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

export default function WpClaimPage() {
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
    <div>
      <h2 className="text-[22px] font-bold">For bloggers: claim your bounty</h2>
      <div className="mt-3 space-y-3 text-[13.5px] leading-relaxed">
        <p>
          If you&rsquo;re on our blogroll, readers have pledged real money for
          one more post. The deal: publish{" "}
          <strong>one substantive post (~1,000 words)</strong> anywhere you
          like, link it here, and the bounty is yours.
        </p>
        <p>
          You can withdraw it via Stripe, redirect it to revive another
          blogger, or donate it to charity. We verify every claim by hand
          before paying out — pseudonymous bloggers welcome.
        </p>
      </div>

      {!user && (
        <p className="mt-4">
          <Link href="/wordpress/signin?next=/wordpress/claim">
            Sign in to get started →
          </Link>
        </p>
      )}
      {user && !profile && !isLoading && (
        <p className="mt-4">
          First,{" "}
          <Link href="/wordpress/account?next=/wordpress/claim">
            create your profile
          </Link>
          . (Patrons and bloggers share accounts — you can be both.)
        </p>
      )}

      {mine.map((b) => {
        const revived = b.status === "revived" || b.status === "paid";
        return (
          <section
            key={b.id}
            className="mt-6 rounded border border-wpblue/40 bg-[#f4f8fc] p-5"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-[17px] font-bold">{b.name}</h3>
              <span className="wp-meta">
                {b.claimVerified ? "✓ claim verified" : "verification pending"}
              </span>
            </div>
            <p className="mt-1 text-[13px]">
              Bounty:{" "}
              <strong className="text-wpgreen">
                {dollars(b.math.totalCents, { round: true })}
              </strong>{" "}
              {b.math.isLive
                ? "· LIVE"
                : `· needs ${dollars(liveThresholdCents - b.math.totalCents, { round: true })} more to go live`}
            </p>

            {b.status === "paid" ? (
              <p className="mt-3 text-[13px]">
                Bounty claimed
                {b.bountyDirection === "redirect"
                  ? " and redirected to a fellow blogger. Thanks twice."
                  : b.bountyDirection === "charity"
                    ? ` and donated${b.bountyDirectionDetail ? ` to ${b.bountyDirectionDetail}` : ""}.`
                    : ". Welcome back."}
              </p>
            ) : (
              <>
                <div className="mt-4">
                  <h4 className="text-[13px] font-bold">
                    Step 1 — link your new post
                  </h4>
                  {revived ? (
                    <p className="mt-1 text-[13px]">
                      <a
                        href={b.revivalPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {b.revivalPostTitle ?? b.revivalPostUrl}
                      </a>{" "}
                      ✓
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <input
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Post title"
                        className="flex-1"
                      />
                      <input
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                        placeholder="https://…"
                        className="flex-1"
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
                          }, "Post linked!")
                        }
                      >
                        Link post
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="text-[13px] font-bold">
                    Step 2 — direct the bounty
                  </h4>
                  <p className="wp-meta">
                    Requires a verified claim and a linked post.
                  </p>
                  <div className="mt-2 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(() => startConnectOnboarding(b.id, "wordpress"))
                        }
                      >
                        {b.stripeAccountId
                          ? "Update Stripe details"
                          : "Set up Stripe payout"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || !b.stripeAccountId}
                        onClick={() =>
                          run(
                            () => withdrawBounty(b.id),
                            "Transfer sent — check your Stripe dashboard."
                          )
                        }
                      >
                        Withdraw {dollars(b.math.totalCents, { round: true })}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={redirectTarget}
                        onChange={(e) => setRedirectTarget(e.target.value)}
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
                            "Redirected — two revivals for the price of one."
                          )
                        }
                      >
                        Redirect
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={charity}
                        onChange={(e) => setCharity(e.target.value)}
                        placeholder="or: name a charity…"
                      />
                      <button
                        type="button"
                        disabled={busy || !charity.trim()}
                        onClick={() =>
                          run(
                            () => donateBounty(b.id, charity.trim()),
                            "Donated — Manifund will regrant it."
                          )
                        }
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        );
      })}

      {user && profile && (
        <section className="mt-6">
          <h3 className="text-[15px] font-bold">Find yourself on the blogroll</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
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
                  "Claimed! We'll verify and email you shortly."
                )
              }
            >
              Claim profile
            </button>
          </div>
          <p className="wp-meta mt-2">
            Not listed?{" "}
            <a href="mailto:austin@manifund.org?subject=Add me to the blogroll">
              Email us to get added.
            </a>
          </p>
        </section>
      )}

      {msg && <p className="mt-4 text-[13px] text-wpgreen">{msg}</p>}
      {error && <p className="mt-4 text-[13px] text-red-700">{error}</p>}
    </div>
  );
}
