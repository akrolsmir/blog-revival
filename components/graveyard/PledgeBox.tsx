"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyProfile } from "@/lib/hooks";
import { pledgeWithCredit } from "@/lib/actions";
import { marginalMatch, type PledgeLike } from "@/lib/qf";
import { dollars } from "@/lib/format";
import posthog from "posthog-js";

const PRESETS = [500, 1000, 2500, 10000];

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
  const [amountCents, setAmountCents] = useState(2500);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const effective = custom ? Math.round(Number(custom) * 100) : amountCents;
  const valid = Number.isFinite(effective) && effective >= 100;
  const balance = profile?.creditCents ?? 0;
  const { addedMatchCents } = valid
    ? marginalMatch(
        pledgesByBlogger,
        poolCents,
        liveThresholdCents,
        bloggerId,
        effective,
        profile?.id,
      )
    : { addedMatchCents: 0 };

  async function pledge() {
    if (!profile || !valid) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    posthog.capture("pledge_initiated", {
      blogger_id: bloggerId,
      blogger_name: bloggerName,
      amount_cents: effective,
      estimated_match_cents: addedMatchCents,
      skin: "graveyard",
    });
    const res = await pledgeWithCredit(bloggerId, effective);
    setBusy(false);
    if (res?.error) setError(res.error);
    else setConfirmed(true);
  }

  function deposit() {
    setNotice("Adding funds by card isn’t available yet.");
  }

  return (
    <div className="rounded-md border border-moon/15 p-6">
      <h3 className="gy-caps text-xl text-moon">make a pledge</h3>
      {confirmed && (
        <p className="mt-3 rounded-sm border border-candle/40 bg-candle/10 px-4 py-3 text-sm text-candle">
          Pledge received — thank you! It&rsquo;s on the ledger below.
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
        <div className="mt-4">
          <button
            type="button"
            onClick={pledge}
            disabled={busy || !valid || effective > balance}
            className="w-full rounded-sm bg-candle px-6 py-3 font-medium text-night transition hover:bg-candle/90 disabled:opacity-50"
          >
            {busy ? "pledging…" : `Pledge ${valid ? dollars(effective, { round: true }) : ""}`}
          </button>
          <div className="mt-2 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={deposit}
              className="text-mist underline underline-offset-4 hover:text-moon"
            >
              Deposit funds
            </button>
            <span className="gy-label text-mist">Balance: {dollars(balance, { round: true })}</span>
          </div>
          {valid && effective > balance && (
            <p className="mt-2 text-sm text-mist">
              Not enough balance — deposits aren&rsquo;t available yet.
            </p>
          )}
        </div>
      ) : (
        <Link
          href={user ? `/account?next=/b/${bloggerSlug}` : `/signin?next=/b/${bloggerSlug}`}
          className="mt-4 block rounded-sm bg-candle px-6 py-3 text-center font-medium text-night transition hover:bg-candle/90"
        >
          {user ? "Finish your patron profile to pledge" : "Sign in to pledge"}
        </Link>
      )}
      {notice && <p className="mt-3 text-sm text-mist">{notice}</p>}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}
