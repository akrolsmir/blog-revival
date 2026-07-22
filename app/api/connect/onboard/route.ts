import { NextRequest, NextResponse } from "next/server";
import { stripeClient, stripeConfigured } from "@/lib/stripe";
import { adminDb } from "@/lib/admin";

// Start Stripe Connect Express onboarding for a claimed, verified blogger so
// they can withdraw their bounty.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY to .env." },
      { status: 503 }
    );
  }
  const { bloggerId, refreshToken, skin } = await req.json();
  if (!bloggerId || !refreshToken) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { bloggers } = await db.query({
    bloggers: {
      $: { where: { id: bloggerId } },
      claimedBy: { user: {} },
    },
  });
  const blogger = bloggers[0];
  if (!blogger) {
    return NextResponse.json({ error: "Blogger not found" }, { status: 404 });
  }
  if (blogger.claimedBy?.user?.id !== user.id) {
    return NextResponse.json(
      { error: "Only the claimant can start payout onboarding" },
      { status: 403 }
    );
  }

  const stripe = stripeClient();
  let accountId = blogger.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      metadata: { bloggerId },
    });
    accountId = account.id;
    await db.transact([
      db.tx.bloggers[bloggerId].update({ stripeAccountId: accountId }),
    ]);
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const back = `${origin}/${skin === "wordpress" ? "wordpress" : "graveyard"}/claim`;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: back,
    return_url: `${back}?onboarded=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
