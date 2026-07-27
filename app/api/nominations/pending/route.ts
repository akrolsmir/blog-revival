import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admins";

// List pending nominations for the admin review queue. Admins only.
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

  const { nominations } = await db.query({
    nominations: {
      $: { where: { status: "pending" }, order: { createdAt: "desc" } },
      submitter: {},
      submitterUser: { profile: {} },
    },
  });

  // Admins see who submitted even when there's no profile to name — the
  // account's email, the way the claims queue already shows a claimant's.
  // The account link itself never leaves this route.
  const shaped = nominations.map((n: any) => {
    const { submitterUser, ...rest } = n;
    return {
      ...rest,
      submitter: n.submitter ?? submitterUser?.profile ?? null,
      submitterEmail: submitterUser?.email ?? null,
    };
  });

  return NextResponse.json({ nominations: shaped });
}
