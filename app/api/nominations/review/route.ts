import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { id } from "@instantdb/admin";
import { isAdminEmail } from "@/lib/admins";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "blog"
  );
}

// Approve or reject a nomination. Admins only. Approving creates a live
// bounty (a bloggers row at status "funding").
export async function POST(req: NextRequest) {
  const { refreshToken, nominationId, action } = await req.json();
  if (!refreshToken || !nominationId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { nominations } = await db.query({
    nominations: { $: { where: { id: nominationId } } },
  });
  const nom = nominations[0];
  if (!nom) {
    return NextResponse.json({ error: "Nomination not found" }, { status: 404 });
  }
  if (nom.status !== "pending") {
    return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  }

  if (action === "reject") {
    await db.transact([db.tx.nominations[nominationId].update({ status: "rejected" })]);
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  if (action === "approve") {
    // Generate a slug that doesn't collide with an existing bounty.
    const base = slugify(nom.blogName || nom.authorName);
    const { bloggers } = await db.query({ bloggers: {} });
    const taken = new Set(bloggers.map((b: any) => b.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const bloggerId = id();
    await db.transact([
      db.tx.bloggers[bloggerId].update({
        slug,
        name: nom.authorName,
        blogName: nom.blogName,
        blogUrl: nom.blogUrl,
        lastPostAt: nom.lastPostAt,
        recentPosts: (nom.topPosts as any) ?? [],
        status: "funding",
        createdAt: Date.now(),
      }),
      db.tx.nominations[nominationId].update({ status: "approved" }),
    ]);
    return NextResponse.json({ ok: true, status: "approved", slug });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
