import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { id } from "@instantdb/admin";

/**
 * Loose identity for a blog: lowercase host (minus www) plus path, no scheme,
 * query, or trailing slash. Deliberately does NOT collapse to the host alone —
 * on a shared platform, medium.com/@alice and medium.com/@bob are different
 * blogs. So this catches the common case (two readers nominating the same
 * well-known dead blog) and lets near-misses through to human review.
 */
function urlKey(raw: string | null | undefined): string {
  if (!raw) return ""; // a row missing its URL can't match anything
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
}

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

  // Don't queue the same blog twice. Rejected nominations are skipped on
  // purpose: they're invisible to everyone but admins, and saying "already
  // nominated" about one would leak that a decline happened.
  const key = urlKey(url);
  const existing = await db.query({
    nominations: { $: { where: { status: { $in: ["pending", "approved"] } } } },
    bloggers: {},
  });
  const dupeBounty = existing.bloggers.find((b: any) => urlKey(b.blogUrl) === key);
  if (dupeBounty) {
    return NextResponse.json(
      { error: `${dupeBounty.name} already has a bounty.`, slug: dupeBounty.slug },
      { status: 409 },
    );
  }
  if (existing.nominations.some((n: any) => urlKey(n.blogUrl) === key)) {
    return NextResponse.json(
      { error: "Someone already nominated that blog — it's waiting on review." },
      { status: 409 },
    );
  }

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
