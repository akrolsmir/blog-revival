"use client";

import { db } from "@/lib/db";

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
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
