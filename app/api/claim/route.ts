import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { computeQf, type PledgeLike } from "@/lib/qf";

// Blogger bounty actions that can't be done under client permissions:
// - claim:   attach the signed-in profile to an unclaimed blogger row
// - redirect: send a live bounty's value to revive another blogger
// - charity:  donate a live bounty's value (stays with Manifund for regranting)
export async function POST(req: NextRequest) {
  const { action, bloggerId, refreshToken, targetBloggerId, charityName } = await req.json();
  if (!action || !bloggerId || !refreshToken) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    return NextResponse.json({ error: "Create a profile first" }, { status: 403 });
  }

  const { bloggers } = await db.query({
    bloggers: { $: { where: { id: bloggerId } }, claimedBy: { user: {} } },
  });
  const blogger = bloggers[0];
  if (!blogger) {
    return NextResponse.json({ error: "Blogger not found" }, { status: 404 });
  }

  if (action === "claim") {
    if (blogger.claimedBy) {
      return NextResponse.json({ error: "This profile has already been claimed" }, { status: 409 });
    }
    await db.transact([
      db.tx.bloggers[bloggerId].update({ claimVerified: false }).link({ claimedBy: profile.id }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // redirect / charity require an owned, verified, revived bounty
  if (blogger.claimedBy?.user?.id !== user.id) {
    return NextResponse.json({ error: "Not your bounty" }, { status: 403 });
  }
  if (!blogger.claimVerified || blogger.status !== "revived") {
    return NextResponse.json(
      { error: "Bounty must be verified and the revival post published first" },
      { status: 403 },
    );
  }

  const [{ settings }, allPledges] = await Promise.all([
    db.query({ settings: { $: { where: { key: "main" } } } }),
    db.query({ pledges: { blogger: {}, patron: {} } }),
  ]);
  const config = settings[0];
  const byBlogger = new Map<string, PledgeLike[]>();
  for (const p of allPledges.pledges) {
    const bid = p.blogger?.id;
    if (!bid) continue;
    const list = byBlogger.get(bid) ?? [];
    list.push({
      amountCents: p.amountCents,
      source: p.source,
      status: p.status,
      patronId: p.patron?.id,
    });
    byBlogger.set(bid, list);
  }
  const math = computeQf(
    byBlogger,
    config.matchingPoolCents,
    config.liveThresholdCents,
  ).perBlogger.get(bloggerId);
  if (!math?.isLive) {
    return NextResponse.json({ error: "Bounty is not live" }, { status: 403 });
  }

  if (action === "redirect") {
    if (!targetBloggerId || targetBloggerId === bloggerId) {
      return NextResponse.json({ error: "Pick another blogger" }, { status: 400 });
    }
    await db.transact([
      db.tx.bloggers[bloggerId]
        .update({
          status: "paid",
          bountyDirection: "redirect",
        })
        .link({ redirectTo: targetBloggerId }),
      // The redirected bounty lands as a personal-style pledge (no QF match
      // on money that was itself matched).
      db.tx.pledges[crypto.randomUUID()]
        .update({
          amountCents: math.totalCents,
          note: `Redirected from ${blogger.name}'s bounty`,
          source: "redirect",
          status: "paid",
          createdAt: Date.now(),
        })
        .link({ blogger: targetBloggerId, patron: profile.id }),
      db.tx.settings[config.id].update({
        matchingPoolCents: Math.max(0, config.matchingPoolCents - math.matchCents),
      }),
    ]);
    return NextResponse.json({ ok: true, movedCents: math.totalCents });
  }

  if (action === "charity") {
    await db.transact([
      db.tx.bloggers[bloggerId].update({
        status: "paid",
        bountyDirection: "charity",
        bountyDirectionDetail: (charityName ?? "charity").slice(0, 200),
      }),
      db.tx.settings[config.id].update({
        matchingPoolCents: Math.max(0, config.matchingPoolCents - math.matchCents),
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
