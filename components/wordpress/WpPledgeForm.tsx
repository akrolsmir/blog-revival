"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMyProfile } from "@/lib/hooks";
import { startCheckout, confirmCheckoutSession, pledgeWithCredit } from "@/lib/actions";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState("25");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const confirmedRef = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || confirmedRef.current) return;
    confirmedRef.current = true;
    confirmCheckoutSession(sessionId).then(() => {
      posthog.capture("pledge_confirmed", {
        blogger_id: bloggerId,
        blogger_name: bloggerName,
        skin: "wordpress",
      });
      setConfirmed(true);
      router.replace(`/b/${bloggerSlug}`, { scroll: false });
    });
  }, [searchParams, bloggerSlug, router]);

  const cents = Math.round(Number(amount) * 100);
  const valid = Number.isFinite(cents) && cents >= 100;
  const { addedMatchCents } = valid
    ? marginalMatch(pledgesByBlogger, poolCents, liveThresholdCents, bloggerId, cents)
    : { addedMatchCents: 0 };

  async function pledge() {
    if (!profile || !valid) return;
    setBusy(true);
    setError(null);
    posthog.capture("pledge_initiated", {
      blogger_id: bloggerId,
      blogger_name: bloggerName,
      amount_cents: cents,
      estimated_match_cents: addedMatchCents,
      skin: "wordpress",
    });
    const res = await startCheckout({
      bloggerId,
      bloggerName,
      bloggerSlug,
      profileId: profile.id,
      amountCents: cents,
    });
    if (res.url) window.location.href = res.url;
    else {
      setError(res.error ?? "Something went wrong starting checkout.");
      setBusy(false);
    }
  }

  const creditCents = profile?.creditCents ?? 0;

  async function payWithCredit() {
    if (!profile || !valid) return;
    setBusy(true);
    setError(null);
    posthog.capture("pledge_initiated", {
      blogger_id: bloggerId,
      blogger_name: bloggerName,
      amount_cents: cents,
      estimated_match_cents: addedMatchCents,
      skin: "wordpress",
      method: "credit",
    });
    const res = await pledgeWithCredit(bloggerId, cents);
    setBusy(false);
    if (res?.error) setError(res.error);
    else setConfirmed(true);
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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {creditCents > 0 && (
            <button
              type="button"
              onClick={payWithCredit}
              disabled={busy || !valid || cents > creditCents}
            >
              {busy
                ? "Pledging…"
                : `Pledge ${valid ? dollars(cents, { round: true }) : ""} with credit`}
            </button>
          )}
          <button
            type="button"
            onClick={pledge}
            disabled={busy || !valid}
            className={creditCents > 0 ? "!bg-none !font-normal !text-wplink underline" : ""}
          >
            {busy && creditCents === 0
              ? "Opening checkout…"
              : creditCents > 0
                ? "or pay by card"
                : `Pledge ${valid ? dollars(cents, { round: true }) : ""} →`}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[12.5px]">
          <Link href={user ? `/account?next=/b/${bloggerSlug}` : `/signin?next=/b/${bloggerSlug}`}>
            {user ? "Finish your patron profile to pledge" : "Sign in to pledge"}
          </Link>
        </p>
      )}
      {creditCents > 0 && (
        <p className="wp-meta mt-1.5">{dollars(creditCents, { round: true })} credit available.</p>
      )}
      {error && <p className="mt-2 text-[12.5px] text-red-700">{error}</p>}
      <p className="wp-meta mt-2">tax-deductible · Manifund 501(c)(3) · card payments via Stripe</p>
    </div>
  );
}
