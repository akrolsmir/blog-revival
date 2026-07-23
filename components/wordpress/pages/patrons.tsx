"use client";

import Link from "next/link";
import { usePatrons } from "@/lib/hooks";
import { dollars } from "@/lib/format";

export default function WpPatronsPage() {
  const { isLoading, patrons } = usePatrons();

  return (
    <div>
      <h2 className="text-[22px] font-bold">Patrons</h2>
      {isLoading && <p className="wp-meta mt-2 italic">Loading…</p>}
      <ul className="mt-4 divide-y divide-dotted divide-wpborder">
        {patrons.map((p) => (
          <li key={p.id} className="py-2.5">
            <Link href={`/p/${p.handle}`} className="font-bold">
              {p.displayName}
            </Link>{" "}
            <span className="wp-meta text-[12.5px]">@{p.handle}</span>
            <p className="wp-meta text-[12.5px]">
              {dollars(p.totalCents, { round: true })} across {p.pledgeCount}{" "}
              bount{p.pledgeCount === 1 ? "y" : "ies"}
            </p>
          </li>
        ))}
      </ul>
      {!isLoading && patrons.length === 0 && (
        <p className="wp-meta mt-4 italic">No patrons yet.</p>
      )}
    </div>
  );
}
