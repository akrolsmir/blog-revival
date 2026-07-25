"use client";

import { useEffect, useState } from "react";
import { dollars } from "@/lib/format";

// The activity feed. Events come from /api/feed rather than a live query:
// nominations are server-only in instant.perms.ts (view: "false"), so the
// admin SDK assembles and sanitizes the whole stream in one place. Everything
// here is presentation — the route owns what's public.

export type FeedKind =
  | "signup" // a patron profile appeared
  | "nomination" // someone suggested a dormant blog
  | "bounty" // a nomination was approved into a bounty
  | "pledge" // money toward a bounty
  | "comment" // a note on a blogger's page
  | "claim" // a blogger claimed their bounty
  | "revival"; // a revival post went up

/** Something a feed line points at. The skins render each kind their own way. */
export type FeedRef =
  | { kind: "patron"; name: string; handle: string }
  | { kind: "blogger"; name: string; slug: string }
  | { kind: "external"; name: string; url: string }
  | { kind: "plain"; name: string };

export type FeedEvent = {
  id: string;
  kind: FeedKind;
  at: number;
  subject: FeedRef;
  object?: FeedRef;
  amountCents?: number;
  source?: string; // pledges only: patron | austin | carol | redirect
  text?: string;
};

/** Short label for the kind column, in the log's left gutter. */
export const FEED_LABELS: Record<FeedKind, string> = {
  signup: "patron",
  nomination: "nominated",
  bounty: "new bounty",
  pledge: "pledge",
  comment: "note",
  claim: "claimed",
  revival: "revived",
};

export type FeedLine = {
  subject: FeedRef;
  verb: string;
  object?: FeedRef;
  quote?: string;
};

/**
 * One event as a sentence, in pieces: `subject verb object`, plus an optional
 * quoted body. Copy lives here so the two skins can't drift apart; only the
 * link markup differs between them.
 */
export function feedLine(e: FeedEvent): FeedLine {
  switch (e.kind) {
    case "signup":
      return { subject: e.subject, verb: "joined" };
    case "nomination":
      return { subject: e.subject, verb: "nominated", object: e.object };
    case "bounty":
      return { subject: e.subject, verb: "was approved" };
    case "pledge":
      // A redirect is a blogger passing their own bounty on, not a new pledge.
      return {
        subject: e.subject,
        verb: `${e.source === "redirect" ? "redirected" : "pledged"} ${dollars(
          e.amountCents ?? 0,
        )} to`,
        object: e.object,
      };
    case "comment":
      return { subject: e.subject, verb: "left a note for", object: e.object, quote: e.text };
    case "claim":
      return { subject: e.subject, verb: "claimed the bounty for", object: e.object };
    case "revival":
      return { subject: e.subject, verb: "published a revival post:", object: e.object };
  }
}

/** "3h ago". Only ever called after the fetch resolves, so no hydration risk. */
export function timeAgo(at: number, now: number = Date.now()): string {
  const secs = Math.max(0, Math.round((now - at) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export type FeedDay = { key: string; label: string; events: FeedEvent[] };

/** Split the stream into day sections, newest first. */
export function groupByDay(events: FeedEvent[], now: number = Date.now()): FeedDay[] {
  const today = new Date(now).toDateString();
  const yesterday = new Date(now - 86_400_000).toDateString();
  const days: FeedDay[] = [];
  for (const e of events) {
    const key = new Date(e.at).toDateString();
    let day = days[days.length - 1];
    if (!day || day.key !== key) {
      const label =
        key === today
          ? "Today"
          : key === yesterday
            ? "Yesterday"
            : new Date(e.at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
      day = { key, label, events: [] };
      days.push(day);
    }
    day.events.push(e);
  }
  return days;
}

/** The newest activity, fetched once on mount. */
export function useFeed(limit = 120) {
  const [events, setEvents] = useState<FeedEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/feed?limit=${limit}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (d?.error) setError(d.error);
        else setEvents(d.events ?? []);
      })
      .catch(() => {
        if (live) setError("Couldn't load the feed.");
      });
    return () => {
      live = false;
    };
  }, [limit]);

  return { events: events ?? [], isLoading: events === null && !error, error };
}
