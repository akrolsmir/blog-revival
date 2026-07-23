"use client";

import { useState } from "react";
import { marginalMatch, type PledgeLike } from "@/lib/qf";
import { dollars } from "@/lib/format";

const STOPS = [500, 1000, 2500, 5000, 10000, 15000, 20000, 25000, 50000];

export function MatchSlider({
  pledgesByBlogger,
  poolCents,
  liveThresholdCents,
  bloggerId,
  bloggerName,
  patronCount,
  dark = true,
}: {
  pledgesByBlogger: Map<string, PledgeLike[]>;
  poolCents: number;
  liveThresholdCents: number;
  bloggerId: string;
  bloggerName: string;
  patronCount: number;
  dark?: boolean;
}) {
  const [stop, setStop] = useState(3); // $50

  const amountCents = STOPS[stop];
  const { addedMatchCents } = marginalMatch(
    pledgesByBlogger,
    poolCents,
    liveThresholdCents,
    bloggerId,
    amountCents,
  );
  const multiple = (amountCents + addedMatchCents) / amountCents;

  const line = dark ? "border-moon/15 text-moon" : "border-wpborder text-wpink";
  const dim = dark ? "text-mist" : "text-wpmeta";
  const accent = dark ? "text-candle" : "text-wpgreen";

  return (
    <div className={`rounded-md border ${line} p-5`}>
      <p className={`text-sm ${dim}`}>
        Pledge to <strong className={dark ? "text-moon" : ""}>{bloggerName}</strong> ({patronCount}{" "}
        patron{patronCount === 1 ? "" : "s"} so far) and watch quadratic funding multiply it:
      </p>
      <input
        type="range"
        min={0}
        max={STOPS.length - 1}
        step={1}
        value={stop}
        onChange={(e) => setStop(Number(e.target.value))}
        className="mt-4 w-full"
        aria-label={`Hypothetical pledge amount: ${dollars(amountCents)}`}
      />
      <dl className="mt-4 space-y-2 text-[15px]">
        <div className="flex justify-between">
          <dt className={dim}>your pledge</dt>
          <dd className="font-semibold">{dollars(amountCents, { round: true })}</dd>
        </div>
        <div className="flex justify-between">
          <dt className={dim}>pool match</dt>
          <dd className={`font-semibold ${accent}`}>
            +{dollars(addedMatchCents, { round: true })}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className={`${dim} flex-none`}>effect</dt>
          <dd className={`${accent} min-w-0 text-right`}>
            <span className="whitespace-nowrap">{multiple.toFixed(1)}×</span> your dollars
          </dd>
        </div>
      </dl>
    </div>
  );
}
