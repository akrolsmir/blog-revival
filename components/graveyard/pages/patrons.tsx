"use client";

import Link from "next/link";
import { usePatrons } from "@/lib/hooks";
import { dollars } from "@/lib/format";

export default function GraveyardPatronsPage() {
  const { isLoading, patrons } = usePatrons();

  if (isLoading) {
    return <p className="gy-label py-32 text-center text-mist">summoning…</p>;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="gy-label text-mist">keepers of candles</p>
      <h1 className="mt-3 text-5xl">Patrons</h1>
      <ul className="mt-10 divide-y divide-moon/10">
        {patrons.map((p) => (
          <li key={p.id} className="flex items-baseline justify-between gap-4 py-3">
            <Link
              href={`/p/${p.handle}`}
              className="text-lg text-moon/90 underline decoration-moon/30 underline-offset-4 hover:decoration-candle"
            >
              {p.displayName}
            </Link>
            <span className="gy-label whitespace-nowrap text-mist">
              {dollars(p.totalCents, { round: true })} · {p.pledgeCount} bount
              {p.pledgeCount === 1 ? "y" : "ies"}
            </span>
          </li>
        ))}
      </ul>
      {patrons.length === 0 && <p className="gy-label mt-10 text-mist">No patrons yet.</p>}
    </main>
  );
}
