import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admins";

// List claimed bloggers for the admin verification queue. Admins only.
// Returns every blogger that has a claimant, unverified ones first.
export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();
  if (!refreshToken) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { bloggers } = await db.query({
    bloggers: { claimedBy: { user: {} } },
  });

  const claims = bloggers
    .filter((b: any) => b.claimedBy)
    .map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      blogName: b.blogName ?? null,
      blogUrl: b.blogUrl,
      status: b.status,
      revivalPostUrl: b.revivalPostUrl ?? null,
      revivalPostTitle: b.revivalPostTitle ?? null,
      claimVerified: !!b.claimVerified,
      claimant: {
        handle: b.claimedBy.handle,
        displayName: b.claimedBy.displayName,
        email: b.claimedBy.user?.email ?? null,
      },
    }))
    // Pending (unverified) claims float to the top of the queue.
    .sort((a: any, b: any) => Number(a.claimVerified) - Number(b.claimVerified));

  return NextResponse.json({ claims });
}
