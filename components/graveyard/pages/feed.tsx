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

// Each kind gets a tone; the gutter dot inherits it via bg-current.
const TONE: Record<FeedKind, string> = {
  signup: "text-mist",
  nomination: "text-[#9fb2d0]",
  bounty: "text-candle",
  pledge: "text-gold",
  comment: "text-moon/55",
  claim: "text-[#ffc45e]",
  revival: "text-[#ffc45e]",
};

function Ref({ r }: { r: FeedRef }) {
  const link = "underline decoration-moon/25 underline-offset-4 hover:decoration-candle";
  if (r.kind === "patron") {
    return (
      <Link href={`/p/${r.handle}`} className={`text-moon/90 ${link}`}>
        {r.name}
      </Link>
    );
  }
  if (r.kind === "blogger") {
    return (
      <Link href={`/b/${r.slug}`} className={`font-semibold text-moon ${link}`}>
        {r.name}
      </Link>
    );
  }
  if (r.kind === "external") {
    return (
      <a href={r.url} target="_blank" rel="noreferrer" className={`text-moon/90 ${link}`}>
        {r.name}
      </a>
    );
  }
  return <span className="text-mist">{r.name}</span>;
}

export default function GraveyardFeedPage() {
  const { events, isLoading, error } = useFeed();

  if (isLoading) {
    return <p className="gy-label py-32 text-center text-mist">listening…</p>;
  }

  const days = groupByDay(events);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-5xl">Activity</h1>

      {error && <p className="gy-label mt-10 text-mist">{error}</p>}
      {!error && events.length === 0 && (
        <p className="gy-label mt-10 text-mist">Nothing has happened yet.</p>
      )}

      {days.map((day) => (
        <section key={day.key} className="mt-10">
          <h2 className="gy-label text-mist">{day.label}</h2>
          <ul className="mt-3 border-l border-moon/10">
            {day.events.map((e) => {
              const line = feedLine(e);
              return (
                <li
                  key={e.id}
                  className="relative flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 pl-6 text-[16px]"
                >
                  <span
                    className={`absolute -left-[3.5px] top-[13px] h-1.5 w-1.5 rounded-full bg-current ${TONE[e.kind]}`}
                    aria-hidden
                  />
                  <span className={`gy-label w-[6.5rem] shrink-0 ${TONE[e.kind]}`}>
                    {FEED_LABELS[e.kind]}
                  </span>
                  <span className="min-w-0 flex-1 text-[#c9d2e4]">
                    <Ref r={line.subject} /> {line.verb}
                    {line.object && (
                      <>
                        {" "}
                        <Ref r={line.object} />
                      </>
                    )}
                  </span>
                  <time
                    className="gy-label shrink-0 text-mist/70"
                    dateTime={new Date(e.at).toISOString()}
                  >
                    {timeAgo(e.at)}
                  </time>
                  {line.quote && (
                    <p className="w-full text-[15px] italic text-mist">“{line.quote}”</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
