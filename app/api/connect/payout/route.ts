import { NextRequest, NextResponse } from "next/server";
import { stripeClient, stripeConfigured } from "@/lib/stripe";
import { adminDb } from "@/lib/admin";
import { computeQf, type PledgeLike } from "@/lib/qf";
import { getPostHogClient } from "@/lib/posthog-server";

// Pay out a revived blogger's bounty via Stripe Connect transfer. Requires:
// the requester claimed the profile, the claim is verified (manual review),
// a revival post is linked, and Connect onboarding is complete.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY to .env." },
      { status: 503 }
    );
  }
  const { bloggerId, refreshToken } = await req.json();
  if (!bloggerId || !refreshToken) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [{ bloggers }, { settings }, allPledges] = await Promise.all([
    db.query({
      bloggers: { $: { where: { id: bloggerId } }, claimedBy: { user: {} } },
    }),
    db.query({ settings: { $: { where: { key: "main" } } } }),
    db.query({ pledges: { blogger: {}, patron: {} } }),
  ]);

  const blogger = bloggers[0];
  const config = settings[0];
  if (!blogger || !config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (blogger.claimedBy?.user?.id !== user.id) {
    return NextResponse.json({ error: "Not your bounty" }, { status: 403 });
  }
  if (!blogger.claimVerified) {
    return NextResponse.json(
      { error: "Claim not verified yet — Manifund reviews each claim by hand." },
      { status: 403 }
    );
  }
  if (blogger.status !== "revived") {
    return NextResponse.json(
      { error: "Link your published revival post before withdrawing." },
      { status: 403 }
    );
  }
  if (!blogger.stripeAccountId) {
    return NextResponse.json(
      { error: "Complete Stripe onboarding first." },
      { status: 403 }
    );
  }

  // Recompute the bounty server-side; matching locks in at claim time.
  const byBlogger = new Map<string, PledgeLike[]>();
  for (const p of allPledges.pledges) {
    const bid = p.blogger?.id;
    if (!bid) continue;
    const list = byBlogger.get(bid) ?? [];
    list.push({
      amountCents: p.amountCents,
      source: p.source,
      status: p.status,
      patronId: p.patron?.id,
    });
    byBlogger.set(bid, list);
  }
  const math = computeQf(
    byBlogger,
    config.matchingPoolCents,
    config.liveThresholdCents
  ).perBlogger.get(bloggerId);
  if (!math || !math.isLive) {
    return NextResponse.json({ error: "Bounty is not live" }, { status: 403 });
  }

  const stripe = stripeClient();
  const transfer = await stripe.transfers.create({
    amount: math.totalCents,
    currency: "usd",
    destination: blogger.stripeAccountId,
    metadata: { bloggerId, kind: "blog-revival-payout" },
  });

  await db.transact([
    db.tx.bloggers[bloggerId].update({
      status: "paid",
      bountyDirection: "withdraw",
    }),
    db.tx.settings[config.id].update({
      // The match leaves the pool the moment it's claimed.
      matchingPoolCents: Math.max(0, config.matchingPoolCents - math.matchCents),
    }),
  ]);

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user.id,
    event: "payout_completed",
    properties: {
      blogger_id: bloggerId,
      amount_cents: math.totalCents,
      match_cents: math.matchCents,
      transfer_id: transfer.id,
    },
  });
  await posthog.flush();

  return NextResponse.json({ transferId: transfer.id, amountCents: math.totalCents });
}
