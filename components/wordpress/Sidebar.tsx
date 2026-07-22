"use client";

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

  const sliderTarget =
    bloggers.find((b) => !b.math.isLive && b.status === "funding") ??
    bloggers[0];

  return (
    <aside className="space-y-8">
      <section>
        <h2 className="wp-widget-title">Blogroll</h2>
        <ul className="mt-2 space-y-1.5">
          {bloggers.slice(0, 8).map((b) => (
            <li key={b.id} className="flex items-baseline justify-between gap-2">
              <Link href={`/wordpress/b/${b.slug}`}>
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
          <p className="wp-meta mt-2">
            matching pool: {dollars(poolUsedCents, { round: true })} committed
            of {dollars(poolCents, { round: true })}
          </p>
        </section>
      )}

      <section>
        <h2 className="wp-widget-title">Meta</h2>
        <ul className="mt-2 space-y-1.5">
          {user && profile ? (
            <>
              <li>
                <Link href="/wordpress/account">
                  Howdy, {profile.displayName}
                </Link>
              </li>
              <li>
                <Link href={`/wordpress/p/${profile.handle}`}>
                  Your public profile
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/wordpress/signin">Sign in</Link>
              </li>
              <li>
                <Link href={user ? "/wordpress/account" : "/wordpress/signin"}>
                  Become a patron
                </Link>
              </li>
            </>
          )}
          <li>
            <Link href="/wordpress/claim">Claim your blogger profile</Link>
          </li>
          <li>
            <a href="mailto:austin@manifund.org?subject=Nominate a dormant blog">
              Nominate a dormant blog
            </a>
          </li>
          <li>
            <Link href="/graveyard">The other demo (spooky)</Link>
          </li>
        </ul>
      </section>
    </aside>
  );
}
