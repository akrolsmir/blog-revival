import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admins";

// Remove a blogger's profile claim (unlink the claimant, clear verification).
// Admins only. Used to clear out false/spurious claims; the bounty row itself
// stays, just unclaimed.
export async function POST(req: NextRequest) {
  const { refreshToken, bloggerId } = await req.json();
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
    return NextResponse.json({ error: "No claim to delete" }, { status: 409 });
  }

  await db.transact([
    db.tx.bloggers[bloggerId]
      .update({ claimVerified: false })
      .unlink({ claimedBy: blogger.claimedBy.id }),
  ]);
  return NextResponse.json({ ok: true });
}
