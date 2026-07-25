"use client";

import Link from "next/link";
import {
  FEED_LABELS,
  feedLine,
  groupByDay,
  timeAgo,
  useFeed,
  type FeedKind,
  type FeedRef,
} from "@/lib/feed";

// A 2005-blog "recent activity" log: dated sections, dotted rules, a bracketed
// category in the gutter the way old sidebars tagged their entries.
const TONE: Record<FeedKind, string> = {
  signup: "text-wpmeta",
  nomination: "text-wpmeta",
  bounty: "text-wpgreen",
  pledge: "text-wpgreen",
  comment: "text-wpmeta",
  claim: "text-wplink",
  revival: "text-wplink",
};

function Ref({ r }: { r: FeedRef }) {
  if (r.kind === "patron") return <Link href={`/p/${r.handle}`}>{r.name}</Link>;
  if (r.kind === "blogger") {
    return (
      <Link href={`/b/${r.slug}`} className="font-bold">
        {r.name}
      </Link>
    );
  }
  if (r.kind === "external") {
    return (
      <a href={r.url} target="_blank" rel="noreferrer">
        {r.name}
      </a>
    );
  }
  return <span className="text-wpmeta">{r.name}</span>;
}

export default function WpFeedPage() {
  const { events, isLoading, error } = useFeed();
  const days = groupByDay(events);

  return (
    <div>
      <h2 className="text-[22px] font-bold">Recent activity</h2>
      <p className="wp-meta mt-1">
        Signups, nominations, pledges, and notes from around the site — newest first.
      </p>

      {isLoading && <p className="wp-meta mt-3 italic">Loading…</p>}
      {error && <p className="wp-meta mt-3 italic">{error}</p>}
      {!isLoading && !error && events.length === 0 && (
        <p className="wp-meta mt-3 italic">Nothing has happened yet.</p>
      )}

      {days.map((day) => (
        <section key={day.key} className="mt-5">
          <h3 className="wp-widget-title wp-dotted pb-1">{day.label}</h3>
          <ul className="mt-1.5 divide-y divide-dotted divide-wpborder">
            {day.events.map((e) => {
              const line = feedLine(e);
              return (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1.5">
                  <span
                    className={`w-[84px] shrink-0 whitespace-nowrap text-[10.5px] uppercase ${TONE[e.kind]}`}
                  >
                    [{FEED_LABELS[e.kind]}]
                  </span>
                  <span className="min-w-0 flex-1">
                    <Ref r={line.subject} /> {line.verb}
                    {line.object && (
                      <>
                        {" "}
                        <Ref r={line.object} />
                      </>
                    )}
                  </span>
                  <span className="wp-meta shrink-0">{timeAgo(e.at)}</span>
                  {line.quote && (
                    <p className="w-full pl-[92px] text-[12.5px] italic text-wpmeta">
                      “{line.quote}”
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
