"use client";

import Link from "next/link";
import { useBounties } from "@/lib/hooks";
import { dollars } from "@/lib/format";

export default function WpBlogsPage() {
  const { isLoading, bloggers } = useBounties();
  return (
    <div>
      <h2 className="text-[22px] font-bold">Blogs</h2>
      {isLoading && <p className="wp-meta mt-2 italic">Loading…</p>}
      <ul className="mt-4 divide-y divide-dotted divide-wpborder">
        {bloggers.map((b) => (
          <li key={b.id} className="flex items-baseline justify-between gap-2 py-2">
            <Link href={`/b/${b.slug}`} className="font-bold">
              {b.blogName ?? b.name}
            </Link>
            <span
              className={`text-[12.5px] font-bold ${b.math.isLive ? "text-wpgreen" : "text-wpmeta"}`}
            >
              {dollars(b.math.totalCents, { round: true })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
