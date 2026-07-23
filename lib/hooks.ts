"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import { computeQf, emptyMath, type BountyMath, type PledgeLike } from "@/lib/qf";

export const DEFAULT_POOL_CENTS = 10_000_00;
export const DEFAULT_LIVE_THRESHOLD_CENTS = 1_000_00;

export type BloggerRow = {
  id: string;
  slug: string;
  name: string;
  pseudonymous?: boolean;
  blogName?: string;
  blogUrl: string;
  photoUrl?: string;
  epitaph?: string;
  lastPostAt: number;
  recentPosts?: { title: string; url: string; date: string }[];
  status: string;
  revivalPostUrl?: string;
  revivalPostTitle?: string;
  bountyDirection?: string;
  bountyDirectionDetail?: string;
  stripeAccountId?: string;
  claimVerified?: boolean;
  claimedBy?: { id: string; handle: string; displayName: string } | null;
  pledges?: any[];
  comments?: any[];
  math: BountyMath;
  // Everyone who put money in, including personal bounties and redirects
  // (math.patronCount only counts QF-eligible patrons).
  supporterCount: number;
};

/** Live data for the whole app: bloggers with QF math applied, pool state. */
export function useBounties() {
  const { data, isLoading, error } = db.useQuery({
    bloggers: {
      pledges: { patron: {} },
      claimedBy: {},
      redirectTo: {},
    },
    settings: {},
  });

  return useMemo(() => {
    const config = data?.settings?.find((s: any) => s.key === "main");
    const poolCents = config?.matchingPoolCents ?? DEFAULT_POOL_CENTS;
    const liveThresholdCents = config?.liveThresholdCents ?? DEFAULT_LIVE_THRESHOLD_CENTS;

    const pledgesByBlogger = new Map<string, PledgeLike[]>();
    for (const b of data?.bloggers ?? []) {
      pledgesByBlogger.set(
        b.id,
        (b.pledges ?? []).map((p: any) => ({
          amountCents: p.amountCents,
          source: p.source,
          status: p.status,
          patronId: p.patron?.id,
        })),
      );
    }
    const qf = computeQf(pledgesByBlogger, poolCents, liveThresholdCents);

    const bloggers: BloggerRow[] = (data?.bloggers ?? []).map((b: any) => ({
      ...b,
      math: qf.perBlogger.get(b.id) ?? emptyMath(liveThresholdCents),
      supporterCount: new Set((b.pledges ?? []).map((p: any) => p.patron?.id ?? p.id)).size,
    }));

    // Top bounties first: live before funding, then by total committed.
    bloggers.sort((a, b) => {
      if (a.math.isLive !== b.math.isLive) return a.math.isLive ? -1 : 1;
      return b.math.totalCents - a.math.totalCents;
    });

    return {
      isLoading,
      error,
      bloggers,
      pledgesByBlogger,
      poolCents,
      poolUsedCents: qf.poolUsedCents,
      liveThresholdCents,
    };
  }, [data, isLoading, error]);
}

export type PatronRow = {
  id: string;
  handle: string;
  displayName: string;
  bio?: string;
  pledgeCount: number;
  totalCents: number;
};

/** All patron profiles, most-generous first. */
export function usePatrons() {
  const { data, isLoading, error } = db.useQuery({
    profiles: { pledges: {} },
  });
  return useMemo(() => {
    const patrons: PatronRow[] = (data?.profiles ?? []).map((p: any) => {
      const pledges = p.pledges ?? [];
      return {
        id: p.id,
        handle: p.handle,
        displayName: p.displayName,
        bio: p.bio,
        pledgeCount: pledges.length,
        totalCents: pledges.reduce((a: number, x: any) => a + x.amountCents, 0),
      };
    });
    patrons.sort(
      (a, b) => b.totalCents - a.totalCents || a.displayName.localeCompare(b.displayName),
    );
    return { isLoading, error, patrons };
  }, [data, isLoading, error]);
}

/**
 * Authorization URL for the Google OAuth redirect flow ("" until mounted —
 * createAuthorizationURL needs window). The current URL is used as the
 * redirect target, so ?next= survives the round trip; Instant signs the
 * user in automatically when they land back. An oauth=google marker is
 * added to the redirect target so the signin page can tell a fresh OAuth
 * sign-in apart from an already-signed-in visit (for analytics).
 */
export function useGoogleAuthUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const redirect = new URL(window.location.href);
    redirect.searchParams.set("oauth", "google");
    setUrl(
      db.auth.createAuthorizationURL({
        clientName: "google-web",
        redirectURL: redirect.toString(),
      }),
    );
  }, []);
  return url;
}

/** The signed-in user's profile (or null). */
export function useMyProfile() {
  const { user, isLoading: authLoading } = db.useAuth();
  const { data, isLoading: queryLoading } = db.useQuery(
    user
      ? {
          profiles: {
            $: { where: { "user.id": user.id } },
            pledges: { blogger: {} },
            claimedBloggers: {},
          },
        }
      : null,
  );
  return {
    user: user ?? null,
    profile: data?.profiles?.[0] ?? null,
    // A skipped (null) query reports isLoading:true forever in this SDK, so only
    // report loading while auth resolves or while a real profile query is in
    // flight. Otherwise a signed-out visitor hangs on "Loading…" and never
    // reaches the sign-in prompt.
    isLoading: authLoading || (user ? queryLoading : false),
  };
}
