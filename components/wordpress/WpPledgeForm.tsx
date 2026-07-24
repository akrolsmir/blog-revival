"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyProfile } from "@/lib/hooks";
import { pledgeWithCredit } from "@/lib/actions";
import { marginalMatch, type PledgeLike } from "@/lib/qf";
import { dollars } from "@/lib/format";
import posthog from "posthog-js";

export function WpPledgeForm({
  bloggerId,
  bloggerName,
  bloggerSlug,
  pledgesByBlogger,
  poolCents,
  liveThresholdCents,
}: {
  bloggerId: string;
  bloggerName: string;
  bloggerSlug: string;
  pledgesByBlogger: Map<string, PledgeLike[]>;
  poolCents: number;
  liveThresholdCents: number;
}) {
  const { user, profile } = useMyProfile();
  const [amount, setAmount] = useState("25");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const cents = Math.round(Number(amount) * 100);
  const valid = Number.isFinite(cents) && cents >= 100;
  const balance = profile?.creditCents ?? 0;
  const { addedMatchCents } = valid
    ? marginalMatch(pledgesByBlogger, poolCents, liveThresholdCents, bloggerId, cents)
    : { addedMatchCents: 0 };

  async function pledge() {
    if (!profile || !valid) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    posthog.capture("pledge_initiated", {
      blogger_id: bloggerId,
      blogger_name: bloggerName,
      amount_cents: cents,
      estimated_match_cents: addedMatchCents,
      skin: "wordpress",
    });
    const res = await pledgeWithCredit(bloggerId, cents);
    setBusy(false);
    if (res?.error) setError(res.error);
    else setConfirmed(true);
  }

  function deposit() {
    setNotice("Adding funds by card isn’t available yet — coming soon.");
  }

  return (
    <div className="rounded border border-wpborder bg-[#f4f8fc] p-5">
      <h3 className="wp-widget-title">Fund this bounty</h3>
      {confirmed && (
        <p className="mt-2 rounded border border-wpgreen/40 bg-green-50 px-3 py-2 text-[12.5px] text-wpgreen">
          Pledge received — thank you! It&rsquo;s on the ledger below.
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <label className="wp-meta" htmlFor="wp-amount">
          Amount ($)
        </label>
        <input
          id="wp-amount"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24"
        />
        {valid && (
          <span className="text-[12px]">
            → est. match{" "}
            <strong className="text-wpgreen">+{dollars(addedMatchCents, { round: true })}</strong>
          </span>
        )}
      </div>
      {profile ? (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={pledge} disabled={busy || !valid || cents > balance}>
              {busy ? "Pledging…" : `Pledge ${valid ? dollars(cents, { round: true }) : ""}`}
            </button>
            <button
              type="button"
              onClick={deposit}
              className="!bg-none !font-normal !text-wplink underline"
            >
              Deposit funds
            </button>
          </div>
          <p className="wp-meta mt-1.5">Balance: {dollars(balance, { round: true })}</p>
          {valid && cents > balance && (
            <p className="wp-meta">Not enough balance — deposits aren&rsquo;t available yet.</p>
          )}
        </>
      ) : (
        <p className="mt-3 text-[12.5px]">
          <Link href={user ? `/account?next=/b/${bloggerSlug}` : `/signin?next=/b/${bloggerSlug}`}>
            {user ? "Finish your patron profile to pledge" : "Sign in to pledge"}
          </Link>
        </p>
      )}
      {notice && <p className="wp-meta mt-2">{notice}</p>}
      {error && <p className="mt-2 text-[12.5px] text-red-700">{error}</p>}
      <p className="wp-meta mt-2">tax-deductible · Manifund 501(c)(3)</p>
    </div>
  );
}
