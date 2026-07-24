"use client";

import Link from "next/link";
import { useBounties } from "@/lib/hooks";
import { dollars } from "@/lib/format";

export function WpSidebar() {
  const { bloggers, poolCents, poolUsedCents } = useBounties();

  // How the matching pool is currently allocated across bloggers, plus the
  // unspent remainder. poolUsedCents is exactly the sum of every match.
  const allocated = bloggers
    .filter((b) => b.math.matchCents > 0)
    .sort((a, b) => b.math.matchCents - a.math.matchCents);
  const leftoverCents = Math.max(0, poolCents - poolUsedCents);

  return (
    <aside className="space-y-8">
      <section>
        <h2 className="wp-widget-title">Blogroll</h2>
        <ul className="mt-2 space-y-1.5">
          {bloggers.map((b) => (
            <li key={b.id} className="flex items-baseline justify-between gap-2">
              <Link href={`/b/${b.slug}`}>{b.name}</Link>
              <span
                className={`text-right text-[12px] font-bold ${
                  b.math.isLive ? "text-wpgreen" : "text-wpmeta"
                }`}
              >
                {dollars(b.math.totalCents, { round: true })}
              </span>
            </li>
          ))}
        </ul>
        <p className="wp-meta mt-2 italic">total pledged so far, including match</p>
      </section>

      <section>
        <h2 className="wp-widget-title">Where the pool goes</h2>
        <table className="mt-2 w-full text-[12.5px]">
          <tbody>
            {allocated.map((b) => (
              <tr key={b.id} className="border-b border-dotted border-wpborder">
                <td className="py-1 pr-2">
                  <Link href={`/b/${b.slug}`}>{b.name}</Link>
                </td>
                <td className="py-1 text-right font-bold text-wpgreen">
                  {dollars(b.math.matchCents, { round: true })}
                </td>
              </tr>
            ))}
            <tr className="border-b border-dotted border-wpborder">
              <td className="py-1 pr-2 italic wp-meta">Leftover (unspent)</td>
              <td className="py-1 text-right font-bold wp-meta">
                {dollars(leftoverCents, { round: true })}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-2 font-bold">Total pool</td>
              <td className="py-1 text-right font-bold">{dollars(poolCents, { round: true })}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </aside>
  );
}
