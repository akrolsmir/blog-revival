"use client";

import { useState } from "react";
import Link from "next/link";
import { useBounties, useMyProfile } from "@/lib/hooks";
import { MatchSlider } from "@/components/graveyard/MatchSlider";
import { dollars } from "@/lib/format";

export function WpSidebar() {
  const {
    bloggers,
    pledgesByBlogger,
    poolCents,
    poolUsedCents,
    liveThresholdCents,
  } = useBounties();
  const { user, profile } = useMyProfile();

  // Which blogger's math the slider shows. Defaults to the top blog in the
  // Blogroll (bloggers[0], same ordering the Blogroll renders); the dropdown
  // lets you switch. Falls back to the default if the id disappears.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const defaultTarget = bloggers[0];
  const sliderTarget =
    bloggers.find((b) => b.id === selectedId) ?? defaultTarget;

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
          {bloggers.slice(0, 8).map((b) => (
            <li key={b.id} className="flex items-baseline justify-between gap-2">
              <Link href={`/b/${b.slug}`}>
                {b.blogName ?? b.name}
              </Link>
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
        <p className="wp-meta mt-2 italic">
          total pledged so far, incl. match
        </p>
      </section>

      {sliderTarget && (
        <section>
          <h2 className="wp-widget-title">Try the Match Math</h2>
          <label className="mt-2 block text-[12.5px] wp-meta">
            Blogger:{" "}
            <select
              value={sliderTarget.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-1 w-full rounded border border-wpborder bg-white px-2 py-1 text-[12.5px] text-wpink"
            >
              {bloggers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.blogName ?? b.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-2 rounded border border-wpborder bg-[#fafafa]">
            <MatchSlider
              pledgesByBlogger={pledgesByBlogger}
              poolCents={poolCents}
              liveThresholdCents={liveThresholdCents}
              bloggerId={sliderTarget.id}
              bloggerName={sliderTarget.blogName ?? sliderTarget.name}
              patronCount={sliderTarget.supporterCount}
              dark={false}
            />
          </div>
          <h3 className="wp-widget-title mt-3">Where the pool goes</h3>
          <table className="mt-1 w-full text-[12.5px]">
            <tbody>
              {allocated.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-dotted border-wpborder"
                >
                  <td className="py-1 pr-2">
                    <Link href={`/b/${b.slug}`}>
                      {b.blogName ?? b.name}
                    </Link>
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
                <td className="py-1 text-right font-bold">
                  {dollars(poolCents, { round: true })}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      <section>
        <h2 className="wp-widget-title">Meta</h2>
        <ul className="mt-2 space-y-1.5">
          {user && profile ? (
            <>
              <li>
                <Link href="/account">
                  Howdy, {profile.displayName}
                </Link>
              </li>
              <li>
                <Link href={`/p/${profile.handle}`}>
                  Your public profile
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/signin">Sign in</Link>
              </li>
              <li>
                <Link href={user ? "/account" : "/signin"}>
                  Become a patron
                </Link>
              </li>
            </>
          )}
          <li>
            <Link href="/patrons">Browse patrons</Link>
          </li>
          <li>
            <Link href="/claim">Claim your blogger profile</Link>
          </li>
          <li>
            <a href="mailto:austin@manifund.org?subject=Nominate a dormant blog">
              Nominate a dormant blog
            </a>
          </li>
        </ul>
      </section>
    </aside>
  );
}
