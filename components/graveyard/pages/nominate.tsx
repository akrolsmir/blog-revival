"use client";

import Link from "next/link";
import { useMyProfile, useNominationForm } from "@/lib/hooks";

const inputCls =
  "mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-4 py-3 text-moon placeholder:text-mist/50 focus:border-candle/60";
const labelCls = "gy-label text-mist";

export default function GyNominatePage() {
  const { user, isLoading } = useMyProfile();
  const f = useNominationForm();

  if (isLoading) {
    return <p className="gy-label py-32 text-center text-mist">summoning…</p>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="gy-label text-mist">raise the dead</p>
        <h1 className="mt-3 text-5xl">Nominate a blog</h1>
        <Link
          href="/signin?next=/nominate"
          className="gy-caps mt-8 inline-block text-candle underline underline-offset-4"
        >
          sign in to nominate →
        </Link>
      </main>
    );
  }

  if (f.done) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="gy-label text-mist">the summons is sent</p>
        <h1 className="mt-3 text-5xl">Nomination received</h1>
        <p className="mt-5 text-lg text-moon/85">
          A Manifund admin will review it before it rises on the site.
        </p>
        <Link
          href="/"
          className="gy-caps mt-8 inline-block text-candle underline underline-offset-4"
        >
          back to the graveyard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="gy-label text-mist">raise the dead</p>
      <h1 className="mt-3 text-5xl">Nominate a blog</h1>

      <div className="mt-10 space-y-6">
        <label className="block">
          <span className={labelCls}>blog name (optional)</span>
          <input
            value={f.blogName}
            onChange={(e) => f.setBlogName(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>name (or pseudonym)</span>
          <input
            value={f.authorName}
            onChange={(e) => f.setAuthorName(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>link to the blog (or other website)</span>
          <input
            type="url"
            value={f.blogUrl}
            onChange={(e) => f.setBlogUrl(e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>last post (optional)</span>
          <input
            type="date"
            value={f.lastPost}
            onChange={(e) => f.setLastPost(e.target.value)}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </label>

        <div>
          <span className={labelCls}>top posts (optional)</span>
          <div className="mt-2 space-y-3">
            {f.topPosts.map((p, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <input
                  value={p.title}
                  onChange={(e) => f.setPost(i, { title: e.target.value })}
                  placeholder="Title"
                  className="w-full rounded-sm border border-moon/25 bg-transparent px-4 py-2.5 text-moon placeholder:text-mist/50"
                />
                <input
                  type="url"
                  value={p.url}
                  onChange={(e) => f.setPost(i, { url: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-sm border border-moon/25 bg-transparent px-4 py-2.5 text-moon placeholder:text-mist/50"
                />
                <button
                  type="button"
                  onClick={() => f.removePost(i)}
                  className="gy-label text-mist underline underline-offset-4 hover:text-candle"
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
              className="gy-label mt-3 text-candle underline underline-offset-4"
            >
              + add another
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={f.submit}
          disabled={f.busy}
          className="gy-caps rounded-sm bg-candle px-6 py-3 font-medium text-night hover:bg-candle/90 disabled:opacity-50"
        >
          {f.busy ? "sending…" : "submit nomination"}
        </button>
        {f.error && <p className="text-sm text-red-300">{f.error}</p>}
      </div>
    </main>
  );
}
