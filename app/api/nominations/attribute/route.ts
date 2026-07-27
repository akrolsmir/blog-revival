import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";

// Attach the caller's profile to the nominations they submitted before they
// had one. /nominate only requires a signed-in account, and profiles are made
// on /account, so a nomination can arrive with an account but no profile —
// which reads as "Someone nominated X" everywhere. The account page calls this
// after every save; it's idempotent and a no-op for everyone else.
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

  const { profiles } = await db.query({
    profiles: { $: { where: { "user.id": user.id } } },
  });
  const profile = profiles[0];
  if (!profile) {
    return NextResponse.json({ ok: true, linked: 0 });
  }

  const { nominations } = await db.query({
    nominations: { $: { where: { "submitterUser.id": user.id } }, submitter: {} },
  });
  const orphans = nominations.filter((n: any) => !n.submitter);
  if (orphans.length === 0) {
    return NextResponse.json({ ok: true, linked: 0 });
  }

  await db.transact(
    orphans.map((n: any) => db.tx.nominations[n.id].link({ submitter: profile.id })),
  );
  return NextResponse.json({ ok: true, linked: orphans.length });
}
