import { NextRequest, NextResponse } from "next/server";
import { stripeClient, stripeConfigured } from "@/lib/stripe";
import { getPostHogClient } from "@/lib/posthog-server";

// Creates a Stripe Checkout session for a pledge. The pledge row is written
// server-side once payment completes (webhook or confirm fallback) — never
// trusted from the client.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY to .env." },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { bloggerId, bloggerName, bloggerSlug, profileId, amountCents, note } = body ?? {};

  if (!bloggerId || !profileId || !amountCents) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const amount = Math.floor(Number(amountCents));
  if (!Number.isFinite(amount) || amount < 100 || amount > 500_000) {
    return NextResponse.json({ error: "Pledge must be between $1 and $5,000" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const back = `${origin}/b/${bloggerSlug}`;

  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `Revival pledge: ${bloggerName ?? "a dormant blogger"}`,
            description:
              "Tax-deductible contribution to Manifund, a 501(c)(3), earmarked for the Blog Revival Project.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: "blog-revival-pledge",
      bloggerId,
      profileId,
      note: (note ?? "").slice(0, 480),
    },
    success_url: `${back}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: back,
  });

  const phDistinctId = req.headers.get("x-posthog-distinct-id") ?? profileId;
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: phDistinctId,
    event: "checkout_session_created",
    properties: {
      blogger_id: bloggerId,
      blogger_name: bloggerName,
      amount_cents: amount,
    },
  });
  await posthog.flush();

  return NextResponse.json({ url: session.url });
}
