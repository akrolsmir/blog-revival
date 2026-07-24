import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { MAX_SIGNUP_CREDITS, SIGNUP_CREDIT_CENTS } from "@/lib/credit";

// Grant the signed-in patron their one-time signup credit, if the first-N
// slots aren't used up. Idempotent per profile (gotSignupCredit guards it).
export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();
  if (!refreshToken) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [mineRes, allRes] = await Promise.all([
    db.query({ profiles: { $: { where: { "user.id": user.id } } } }),
    db.query({ profiles: {} }),
  ]);
  const profile = mineRes.profiles[0];
  if (!profile) {
    return NextResponse.json({ error: "Create a profile first" }, { status: 403 });
  }
  if (profile.gotSignupCredit) {
    return NextResponse.json({ ok: true, creditCents: profile.creditCents ?? 0 });
  }

  const grantedCount = (allRes.profiles as any[]).filter((p) => p.gotSignupCredit).length;
  if (grantedCount >= MAX_SIGNUP_CREDITS) {
    // Mark as processed so we don't re-check every load, but grant nothing.
    await db.transact([db.tx.profiles[profile.id].update({ gotSignupCredit: true })]);
    return NextResponse.json({ ok: true, creditCents: profile.creditCents ?? 0, soldOut: true });
  }

  const creditCents = (profile.creditCents ?? 0) + SIGNUP_CREDIT_CENTS;
  await db.transact([db.tx.profiles[profile.id].update({ creditCents, gotSignupCredit: true })]);
  return NextResponse.json({ ok: true, creditCents, granted: true });
}
