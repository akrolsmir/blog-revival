"use client";

import { db } from "@/lib/db";
import posthog from "posthog-js";

// Client wrappers around the API routes. All money movement happens
// server-side; these just kick off flows.

export async function startCheckout(args: {
  bloggerId: string;
  bloggerName: string;
  bloggerSlug: string;
  profileId: string;
  amountCents: number;
  note?: string;
}): Promise<{ url?: string; error?: string }> {
  const distinctId = posthog.get_distinct_id();
  const sessionId = posthog.get_session_id();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (distinctId) headers["x-posthog-distinct-id"] = distinctId;
  if (sessionId) headers["x-posthog-session-id"] = sessionId;
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify(args),
  });
  return res.json();
}

export async function confirmCheckoutSession(sessionId: string) {
  const res = await fetch("/api/checkout/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  return res.json();
}

async function refreshToken(): Promise<string | null> {
  const user = await db.getAuth();
  return user?.refresh_token ?? null;
}

export async function claimBlogger(bloggerId: string) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "claim", bloggerId, refreshToken: token }),
  });
  return res.json();
}

export async function redirectBounty(bloggerId: string, targetBloggerId: string) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "redirect",
      bloggerId,
      targetBloggerId,
      refreshToken: token,
    }),
  });
  return res.json();
}

export async function donateBounty(bloggerId: string, charityName: string) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "charity",
      bloggerId,
      charityName,
      refreshToken: token,
    }),
  });
  return res.json();
}

export async function startConnectOnboarding(bloggerId: string) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/connect/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bloggerId, refreshToken: token }),
  });
  return res.json();
}

export async function withdrawBounty(bloggerId: string) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/connect/payout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bloggerId, refreshToken: token }),
  });
  return res.json();
}

export async function claimSignupCredit() {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/signup-credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  return res.json();
}

export async function pledgeWithCredit(bloggerId: string, amountCents: number) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/pledge-credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bloggerId, amountCents, refreshToken: token }),
  });
  return res.json();
}

export async function submitNomination(data: {
  blogName: string;
  authorName: string;
  blogUrl: string;
  lastPostAt?: number;
  topPosts: { title: string; url: string }[];
}) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in to nominate a blog" };
  const res = await fetch("/api/nominations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, refreshToken: token }),
  });
  return res.json();
}

/** Credit my earlier nominations to the profile I just created. No-op if none. */
export async function attributeMyNominations() {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/nominations/attribute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  return res.json();
}

export async function listPendingNominations() {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/nominations/pending", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  return res.json();
}

export async function reviewNomination(nominationId: string, action: "approve" | "reject") {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/nominations/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nominationId, action, refreshToken: token }),
  });
  return res.json();
}

export async function listClaims() {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/claims/pending", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  return res.json();
}

export async function verifyClaim(bloggerId: string, verified: boolean) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/claims/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bloggerId, verified, refreshToken: token }),
  });
  return res.json();
}

export async function deleteClaim(bloggerId: string) {
  const token = await refreshToken();
  if (!token) return { error: "Sign in first" };
  const res = await fetch("/api/claims/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bloggerId, refreshToken: token }),
  });
  return res.json();
}
