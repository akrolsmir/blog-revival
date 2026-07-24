"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMyProfile } from "@/lib/hooks";
import { startCheckout, confirmCheckoutSession, pledgeWithCredit } from "@/lib/actions";
import { marginalMatch, type PledgeLike } from "@/lib/qf";
import { dollars } from "@/lib/format";
import posthog from "posthog-js";

const PRESETS = [1000, 2500, 5000, 10000];

export function PledgeBox({
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
  const [amountCents, setAmountCents] = useState(2500);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const confirmedRef = useRef(false);

  // Returning from Stripe Checkout: verify the session server-side.
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || confirmedRef.current) return;
    confirmedRef.current = true;
    confirmCheckoutSession(sessionId).then(() => {
      posthog.capture("pledge_confirmed", {
        blogger_id: bloggerId,
        blogger_name: bloggerName,
        skin: "graveyard",
      });
      setConfirmed(true);
      router.replace(`/b/${bloggerSlug}`, { scroll: false });
    });
  }, [searchParams, bloggerSlug, router]);

  const effective = custom ? Math.round(Number(custom) * 100) : amountCents;
  const valid = Number.isFinite(effective) && effective >= 100;
  const { addedMatchCents } = valid
    ? marginalMatch(pledgesByBlogger, poolCents, liveThresholdCents, bloggerId, effective)
    : { addedMatchCents: 0 };

  async function pledge() {
    if (!profile || !valid) return;
    setBusy(true);
    setError(null);
    posthog.capture("pledge_initiated", {
      blogger_id: bloggerId,
      blogger_name: bloggerName,
      amount_cents: effective,
      estimated_match_cents: addedMatchCents,
      skin: "graveyard",
    });
    const res = await startCheckout({
      bloggerId,
      bloggerName,
      bloggerSlug,
      profileId: profile.id,
      amountCents: effective,
    });
    if (res.url) {
      window.location.href = res.url;
    } else {
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
      amount_cents: effective,
      estimated_match_cents: addedMatchCents,
      skin: "graveyard",
      method: "credit",
    });
    const res = await pledgeWithCredit(bloggerId, effective);
    setBusy(false);
    if (res?.error) setError(res.error);
    else setConfirmed(true);
  }

  return (
    <div className="rounded-md border border-moon/15 p-6">
      <h3 className="gy-caps text-xl text-moon">light a candle</h3>
      {confirmed && (
        <p className="mt-3 rounded-sm border border-candle/40 bg-candle/10 px-4 py-3 text-sm text-candle">
          Your candle is lit. {bloggerName} will see your pledge.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((cents) => (
          <button
            key={cents}
            type="button"
            onClick={() => {
              setAmountCents(cents);
              setCustom("");
            }}
            className={`rounded-sm border px-4 py-2 text-sm transition ${
              !custom && amountCents === cents
                ? "border-candle bg-candle/15 text-candle"
                : "border-moon/25 text-moon/80 hover:border-moon/50"
            }`}
          >
            {dollars(cents, { round: true })}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm text-mist">
          <span className="sr-only">Custom amount in dollars</span>
          <input
            type="number"
            min={1}
            placeholder="other"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-24 rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon placeholder:text-mist/60"
          />
        </label>
      </div>
      {valid && (
        <p className="mt-3 text-sm text-mist">
          {dollars(effective, { round: true })} direct{" "}
          <span className="text-candle">
            +{dollars(addedMatchCents, { round: true })} estimated match
          </span>{" "}
          from the pool.
        </p>
      )}
      {profile ? (
        creditCents > 0 ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={payWithCredit}
              disabled={busy || !valid || effective > creditCents}
              className="w-full rounded-sm bg-candle px-6 py-3 font-medium text-night transition hover:bg-candle/90 disabled:opacity-50"
            >
              {busy
                ? "lighting…"
                : `Pledge ${valid ? dollars(effective, { round: true }) : ""} with credit`}
            </button>
            <div className="mt-2 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={pledge}
                disabled={busy || !valid}
                className="text-mist underline underline-offset-4 hover:text-moon disabled:opacity-50"
              >
                or pay by card
              </button>
              <span className="gy-label text-mist">
                {dollars(creditCents, { round: true })} credit left
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={pledge}
            disabled={busy || !valid}
            className="mt-4 w-full rounded-sm bg-candle px-6 py-3 font-medium text-night transition hover:bg-candle/90 disabled:opacity-50"
          >
            {busy
              ? "Opening checkout…"
              : `Pledge ${valid ? dollars(effective, { round: true }) : ""} — tax-deductible`}
          </button>
        )
      ) : (
        <Link
          href={user ? `/account?next=/b/${bloggerSlug}` : `/signin?next=/b/${bloggerSlug}`}
          className="mt-4 block rounded-sm bg-candle px-6 py-3 text-center font-medium text-night transition hover:bg-candle/90"
        >
          {user ? "Finish your patron profile to pledge" : "Sign in to pledge"}
        </Link>
      )}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <p className="mt-3 text-center text-xs text-mist/70">
        Card payments via Stripe. Manifund is a 501(c)(3); pledges are tax-deductible.
      </p>
    </div>
  );
}
