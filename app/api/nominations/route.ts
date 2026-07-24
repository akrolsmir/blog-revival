import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { id } from "@instantdb/admin";

// Submit a blog nomination. Signed-in only; lands as `pending` for admin review.
export async function POST(req: NextRequest) {
  const { refreshToken, blogName, authorName, blogUrl, lastPostAt, topPosts } = await req.json();
  if (!refreshToken) {
    return NextResponse.json({ error: "Sign in to nominate a blog." }, { status: 401 });
  }

  const db = adminDb();
  const user = await db.auth.verifyToken(refreshToken);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const bn = String(blogName ?? "").trim();
  const an = String(authorName ?? "").trim();
  const url = String(blogUrl ?? "").trim();
  // Only the person's name and a link are required; blog name and last-post
  // date are optional.
  if (!an || !url) {
    return NextResponse.json({ error: "Name and link are required." }, { status: 400 });
  }
  const lastPost = Number.isFinite(lastPostAt) ? lastPostAt : null;

  const posts = Array.isArray(topPosts)
    ? topPosts
        .map((p: any) => ({
          title: String(p?.title ?? "").trim(),
          url: String(p?.url ?? "").trim(),
        }))
        .filter((p) => p.title || p.url)
        .slice(0, 5)
    : [];

  // Link the submitter's profile if they have one (nomination still works without).
  const { profiles } = await db.query({
    profiles: { $: { where: { "user.id": user.id } } },
  });
  const profile = profiles[0];

  const nominationId = id();
  const tx = db.tx.nominations[nominationId].update({
    authorName: an,
    blogUrl: url,
    topPosts: posts,
    status: "pending",
    createdAt: Date.now(),
    ...(bn ? { blogName: bn } : {}),
    ...(lastPost !== null ? { lastPostAt: lastPost } : {}),
  });
  await db.transact([profile ? tx.link({ submitter: profile.id }) : tx]);

  return NextResponse.json({ ok: true });
}
