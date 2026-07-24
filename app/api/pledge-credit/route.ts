import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { id } from "@instantdb/admin";
import { getPostHogClient } from "@/lib/posthog-server";

// Pledge using signup credit — no Stripe. Records a normal "patron" pledge
// (so it draws quadratic matching like a cash pledge) and deducts the credit.
export async function POST(req: NextRequest) {
  const { refreshToken, bloggerId, amountCents } = await req.json();
  if (!refreshToken || !bloggerId || !Number.isFinite(amountCents)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const amt = Math.round(amountCents);
  if (amt < 100) {
    return NextResponse.json({ error: "Minimum pledge is $1." }, { status: 400 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { profiles } = await db.query({
    profiles: { $: { where: { "user.id": user.id } } },
  });
  const profile = profiles[0];
  if (!profile) {
    return NextResponse.json({ error: "Create a profile first" }, { status: 403 });
  }
  const balance = profile.creditCents ?? 0;
  if (amt > balance) {
    return NextResponse.json({ error: "Not enough credit." }, { status: 400 });
  }

  const { bloggers } = await db.query({ bloggers: { $: { where: { id: bloggerId } } } });
  if (bloggers.length === 0) {
    return NextResponse.json({ error: "Blogger not found" }, { status: 404 });
  }

  const pledgeId = id();
  await db.transact([
    db.tx.pledges[pledgeId]
      .update({ amountCents: amt, source: "patron", status: "paid", createdAt: Date.now() })
      .link({ patron: profile.id, blogger: bloggerId }),
    db.tx.profiles[profile.id].update({ creditCents: balance - amt }),
  ]);

  getPostHogClient().capture({
    distinctId: profile.id,
    event: "pledge_recorded",
    properties: { blogger_id: bloggerId, amount_cents: amt, method: "credit" },
  });

  return NextResponse.json({ ok: true, remainingCents: balance - amt });
}
