"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import {
  computeQf,
  DEFAULT_LIVE_THRESHOLD_CENTS,
  DEFAULT_POOL_CENTS,
  emptyMath,
  type BountyMath,
  type PledgeLike,
} from "@/lib/qf";
import { isAdminEmail } from "@/lib/admins";
import { submitNomination } from "@/lib/actions";

export type BloggerRow = {
  id: string;
  slug: string;
  name: string;
  pseudonymous?: boolean;
  blogName?: string;
  blogUrl: string;
  photoUrl?: string;
  epitaph?: string;
  lastPostAt?: number;
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
  const profile = data?.profiles?.[0] ?? null;

  return {
    user: user ?? null,
    profile,
    // A skipped (null) query reports isLoading:true forever in this SDK, so only
    // report loading while auth resolves or while a real profile query is in
    // flight. Otherwise a signed-out visitor hangs on "Loading…" and never
    // reaches the sign-in prompt.
    isLoading: authLoading || (user ? queryLoading : false),
  };
}

export type NominationRow = {
  id: string;
  blogName?: string;
  authorName: string;
  blogUrl: string;
  lastPostAt?: number;
  topPosts?: { title: string; url: string }[];
  createdAt: number;
  submitter?: { id: string; handle: string; displayName: string } | null;
};

/**
 * Reader nominations still waiting on review, newest first — the "not yet a
 * bounty" tier of the blogroll. Only `pending` is queried: an approved
 * nomination already exists as a bloggers row a few rows up, and rejected
 * ones aren't readable at all (instant.perms.ts filters them out).
 */
export function usePendingNominations() {
  const { data, isLoading, error } = db.useQuery({
    nominations: {
      $: { where: { status: "pending" }, order: { createdAt: "desc" } },
      submitter: {},
    },
  });
  return {
    isLoading,
    error,
    nominations: (data?.nominations ?? []) as unknown as NominationRow[],
  };
}

export type TopPatron = {
  id: string;
  handle: string;
  displayName: string;
  totalCents: number;
};

/** The patrons who've given a blogger the most, biggest first. */
export function topPatrons(blogger: BloggerRow, limit = 3): TopPatron[] {
  const byPatron = new Map<string, TopPatron>();
  for (const p of blogger.pledges ?? []) {
    const patron = p.patron;
    if (!patron) continue;
    const existing = byPatron.get(patron.id);
    if (existing) existing.totalCents += p.amountCents;
    else
      byPatron.set(patron.id, {
        id: patron.id,
        handle: patron.handle,
        displayName: patron.displayName,
        totalCents: p.amountCents,
      });
  }
  return [...byPatron.values()].sort((a, b) => b.totalCents - a.totalCents).slice(0, limit);
}

/** True when the signed-in user is a nomination admin. */
export function useIsAdmin(): boolean {
  const { user } = db.useAuth();
  return isAdminEmail(user?.email);
}

export type TopPostInput = { title: string; url: string };

/** Shared state + submit for the blog nomination form (both skins). */
export function useNominationForm() {
  const [blogName, setBlogName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [lastPost, setLastPost] = useState(""); // yyyy-mm-dd from a date input
  const [topPosts, setTopPosts] = useState<TopPostInput[]>([{ title: "", url: "" }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function setPost(i: number, patch: Partial<TopPostInput>) {
    setTopPosts((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  }
  function addPost() {
    setTopPosts((ps) => (ps.length >= 5 ? ps : [...ps, { title: "", url: "" }]));
  }
  function removePost(i: number) {
    setTopPosts((ps) => (ps.length <= 1 ? ps : ps.filter((_, j) => j !== i)));
  }

  async function submit() {
    setError(null);
    if (!authorName.trim() || !blogUrl.trim()) {
      setError("Please fill in the name and link.");
      return;
    }
    // Blog name and last-post date are optional.
    let lastPostAt: number | undefined;
    if (lastPost) {
      lastPostAt = new Date(lastPost).getTime();
      if (!Number.isFinite(lastPostAt)) {
        setError("That last-post date looks off.");
        return;
      }
    }
    setBusy(true);
    const res = await submitNomination({
      blogName: blogName.trim(),
      authorName: authorName.trim(),
      blogUrl: blogUrl.trim(),
      lastPostAt,
      topPosts: topPosts
        .map((p) => ({ title: p.title.trim(), url: p.url.trim() }))
        .filter((p) => p.title || p.url),
    });
    setBusy(false);
    if (res?.error) setError(res.error);
    else setDone(true);
  }

  return {
    blogName,
    setBlogName,
    authorName,
    setAuthorName,
    blogUrl,
    setBlogUrl,
    lastPost,
    setLastPost,
    topPosts,
    setPost,
    addPost,
    removePost,
    busy,
    error,
    done,
    submit,
  };
}
