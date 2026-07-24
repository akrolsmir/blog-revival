import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admins";

// Mark a blogger's profile claim as identity-verified (or revoke it).
// Admins only. Payout is still arranged with the blogger over email; this
// just records that Manifund has confirmed who they are.
export async function POST(req: NextRequest) {
  const { refreshToken, bloggerId, verified } = await req.json();
  if (!refreshToken || !bloggerId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { bloggers } = await db.query({
    bloggers: { $: { where: { id: bloggerId } }, claimedBy: {} },
  });
  const blogger = bloggers[0];
  if (!blogger) {
    return NextResponse.json({ error: "Blogger not found" }, { status: 404 });
  }
  if (!blogger.claimedBy) {
    return NextResponse.json({ error: "No claim to verify" }, { status: 409 });
  }

  const claimVerified = verified !== false;
  await db.transact([db.tx.bloggers[bloggerId].update({ claimVerified })]);
  return NextResponse.json({ ok: true, claimVerified });
}
