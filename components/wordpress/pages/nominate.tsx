"use client";

import Link from "next/link";
import { useMyProfile, useNominationForm } from "@/lib/hooks";

export default function WpNominatePage() {
  const { user, isLoading } = useMyProfile();
  const f = useNominationForm();

  if (isLoading) return <p className="wp-meta italic">Loading…</p>;

  if (!user) {
    return (
      <div>
        <h2 className="text-[22px] font-bold">Nominate a blog</h2>
        <p className="mt-3 text-[13.5px]">
          <Link href="/signin?next=/nominate">Sign in to nominate a blog →</Link>
        </p>
      </div>
    );
  }

  if (f.done) {
    return (
      <div>
        <h2 className="text-[22px] font-bold">Nomination received</h2>
        <p className="mt-3 text-[13.5px]">
          Thanks — a Manifund admin will review it before it goes live.
        </p>
        <p className="mt-3 text-[13.5px]">
          <Link href="/">← Back to the front page</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[22px] font-bold">Nominate a blog</h2>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-[12px] font-bold">Name (or pseudonym)</span>
          <input
            value={f.authorName}
            onChange={(e) => f.setAuthorName(e.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-bold">Blog name (optional)</span>
          <input
            value={f.blogName}
            onChange={(e) => f.setBlogName(e.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-bold">Link to the blog (or other website)</span>
          <input
            type="url"
            value={f.blogUrl}
            onChange={(e) => f.setBlogUrl(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-bold">Last post (optional)</span>
          <input
            type="date"
            value={f.lastPost}
            onChange={(e) => f.setLastPost(e.target.value)}
            className="mt-1 w-full"
          />
        </label>

        <div>
          <span className="text-[12px] font-bold">Top posts (optional)</span>
          <div className="mt-1 space-y-2">
            {f.topPosts.map((p, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <input
                  value={p.title}
                  onChange={(e) => f.setPost(i, { title: e.target.value })}
                  placeholder="Title"
                  className="w-full"
                />
                <input
                  type="url"
                  value={p.url}
                  onChange={(e) => f.setPost(i, { url: e.target.value })}
                  placeholder="https://…"
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => f.removePost(i)}
                  className="!border-0 !bg-none !bg-transparent !p-0 !font-normal !text-wplink underline"
                >
                  remove
                </button>
              </div>
            ))}
          </div>
          {f.topPosts.length < 5 && (
            <button
              type="button"
              onClick={f.addPost}
              className="mt-2 !border-0 !bg-none !bg-transparent !p-0 !font-normal !text-wplink underline"
            >
              + add another
            </button>
          )}
        </div>

        <button type="button" onClick={f.submit} disabled={f.busy}>
          {f.busy ? "Submitting…" : "Submit nomination »"}
        </button>
        {f.error && <p className="text-[12.5px] text-red-700">{f.error}</p>}
      </div>
    </div>
  );
}
