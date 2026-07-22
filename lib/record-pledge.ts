import { id } from "@instantdb/admin";
import type Stripe from "stripe";
import { adminDb } from "@/lib/admin";

// Idempotently record a paid Checkout session as a pledge. Called from both
// the webhook and the success-redirect confirm endpoint, so double-delivery
// is expected and must be a no-op.
export async function recordPaidSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { recorded: false };
  const meta = session.metadata ?? {};
  if (meta.kind !== "blog-revival-pledge") return { recorded: false };
  const { bloggerId, profileId, note } = meta;
  if (!bloggerId || !profileId) return { recorded: false };

  const db = adminDb();
  const existing = await db.query({
    pledges: { $: { where: { stripeSessionId: session.id } } },
  });
  if (existing.pledges.length > 0) return { recorded: false };

  const pledgeId = id();
  await db.transact([
    db.tx.pledges[pledgeId]
      .update({
        amountCents: session.amount_total ?? 0,
        note: note || undefined,
        source: "patron",
        status: "paid",
        stripeSessionId: session.id,
        createdAt: Date.now(),
      })
      .link({ patron: profileId, blogger: bloggerId }),
  ]);
  return { recorded: true, pledgeId };
}
