import { NextRequest, NextResponse } from "next/server";
import { stripeClient, stripeConfigured } from "@/lib/stripe";
import { recordPaidSession } from "@/lib/record-pledge";

// Fallback for local dev without `stripe listen`: the success redirect lands
// with ?session_id=..., the client calls this, and we verify with Stripe
// directly. Idempotent with the webhook.
export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const { sessionId } = await req.json();
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const result = await recordPaidSession(session);
  return NextResponse.json(result);
}
