import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import type { FeedEvent, FeedRef } from "@/lib/feed";

// Public activity feed. Runs through the admin SDK because nominations are
// server-only in instant.perms.ts (view: "false") — this route is the one
// place that decides what a nomination looks like in public: the blog being
// nominated and who suggested it, never the submitter's email, and never a
// rejected nomination. Everything else it returns is already public.

export const dynamic = "force-dynamic";

function patronRef(p: any): FeedRef {
  if (!p?.handle) return { kind: "plain", name: "Someone" };
  return { kind: "patron", name: p.displayName || p.handle, handle: p.handle };
}

function bloggerRef(b: any): FeedRef {
  return { kind: "blogger", name: b.blogName || b.name, slug: b.slug };
}

export async function GET(req: NextRequest) {
  const asked = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Math.min(Number.isFinite(asked) && asked > 0 ? asked : 120, 300);

  const db = adminDb();
  const data = await db.query({
    profiles: {},
    bloggers: { claimedBy: {} },
    pledges: { patron: {}, blogger: {} },
    comments: { author: {}, blogger: {} },
    // submitterUser is the fallback path to a name: a nomination made before
    // its author had a profile carries only the account, and the profile they
    // make later hangs off that. /api/nominations/attribute normally fills in
    // `submitter` at that point; reading through both means the feed is right
    // even if it hasn't run.
    nominations: { submitter: {}, submitterUser: { profile: {} } },
  });

  const events: FeedEvent[] = [];

  for (const p of data.profiles ?? []) {
    if (!p.createdAt) continue;
    events.push({
      id: `signup:${p.id}`,
      kind: "signup",
      at: p.createdAt,
      subject: patronRef(p),
    });
  }

  for (const b of data.bloggers ?? []) {
    if (!b.createdAt) continue;
    events.push({
      id: `bounty:${b.id}`,
      kind: "bounty",
      at: b.createdAt,
      subject: bloggerRef(b),
    });
    // Claims and revivals have no timestamp of their own in the schema, so
    // they're stamped with the bounty's creation date — right ordering only
    // by luck. Nothing is claimed or revived yet; give these real fields
    // (claimedAt / revivedAt) before that changes.
    if ((b as any).claimedBy) {
      events.push({
        id: `claim:${b.id}`,
        kind: "claim",
        at: b.createdAt,
        subject: patronRef((b as any).claimedBy),
        object: bloggerRef(b),
      });
    }
    if (b.revivalPostUrl) {
      events.push({
        id: `revival:${b.id}`,
        kind: "revival",
        at: b.createdAt,
        subject: bloggerRef(b),
        object: {
          kind: "external",
          name: b.revivalPostTitle || "read it",
          url: b.revivalPostUrl,
        },
      });
    }
  }

  for (const p of data.pledges ?? []) {
    // Skip checkouts that never completed.
    if (p.status === "pending" || !p.createdAt) continue;
    const blogger = (p as any).blogger;
    if (!blogger) continue;
    events.push({
      id: `pledge:${p.id}`,
      kind: "pledge",
      at: p.createdAt,
      subject: patronRef((p as any).patron),
      object: bloggerRef(blogger),
      amountCents: p.amountCents,
      source: p.source,
    });
  }

  for (const c of data.comments ?? []) {
    const blogger = (c as any).blogger;
    if (!blogger || !c.createdAt) continue;
    events.push({
      id: `comment:${c.id}`,
      kind: "comment",
      at: c.createdAt,
      subject: patronRef((c as any).author),
      object: bloggerRef(blogger),
      text: c.text.length > 240 ? `${c.text.slice(0, 240).trimEnd()}…` : c.text,
    });
  }

  for (const n of data.nominations ?? []) {
    // Rejected nominations stay private — no public record of a turned-down blog.
    if (n.status === "rejected" || !n.createdAt) continue;
    events.push({
      id: `nomination:${n.id}`,
      kind: "nomination",
      at: n.createdAt,
      subject: patronRef((n as any).submitter ?? (n as any).submitterUser?.profile),
      object: {
        kind: "external",
        name: n.blogName || n.authorName,
        url: n.blogUrl,
      },
    });
  }

  events.sort((a, b) => b.at - a.at);

  return NextResponse.json({ events: events.slice(0, limit) });
}
