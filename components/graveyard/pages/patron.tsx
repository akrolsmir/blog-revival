"use client";

import { use } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { dollars } from "@/lib/format";

export default function GraveyardPatronPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const { data, isLoading } = db.useQuery({
    profiles: {
      $: { where: { handle } },
      pledges: { blogger: {} },
      comments: { blogger: {} },
    },
  });

  if (isLoading) {
    return <p className="gy-label py-32 text-center text-mist">summoning…</p>;
  }
  const profile = data?.profiles?.[0];
  if (!profile) {
    return (
      <main className="px-6 py-32 text-center">
        <h1 className="text-4xl">No such patron.</h1>
        <Link
          href="/"
          className="gy-caps mt-6 inline-block text-candle underline underline-offset-4"
        >
          back to the graveyard
        </Link>
      </main>
    );
  }

  const pledges = (profile.pledges ?? [])
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
  const totalCents = pledges.reduce((a: number, p: any) => a + p.amountCents, 0);
  const alive = (profile.favoriteAliveBlogs ?? []) as { name: string; url: string }[];
  const dead = (profile.favoriteDeadBlogs ?? []) as { name: string; url: string }[];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="gy-label text-mist">keeper of candles</p>
      <h1 className="mt-3 text-5xl">{profile.displayName}</h1>
      <p className="gy-label mt-2 text-mist">@{profile.handle}</p>
      {profile.bio && <p className="mt-5 text-lg text-moon/85">{profile.bio}</p>}

      {profile.postsILike && (
        <section className="mt-10 rounded-md border border-moon/15 p-6">
          <h2 className="gy-caps text-xl text-moon">what i want to read</h2>
          <p className="mt-3 leading-relaxed text-moon/85">{profile.postsILike}</p>
        </section>
      )}

      {(alive.length > 0 || dead.length > 0) && (
        <section className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="rounded-md border border-moon/15 p-6">
            <h2 className="gy-caps text-lg text-moon">favorite living blogs</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {alive.map((b) => (
                <li key={b.name}>
                  {b.url ? (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-moon/85 underline decoration-moon/30 underline-offset-4 hover:decoration-candle"
                    >
                      {b.name}
                    </a>
                  ) : (
                    <span className="text-moon/85">{b.name}</span>
                  )}
                </li>
              ))}
              {alive.length === 0 && <li className="italic text-mist">None listed yet.</li>}
            </ul>
          </div>
          <div className="rounded-md border border-moon/15 p-6">
            <h2 className="gy-caps text-lg text-moon">favorite dead blogs</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {dead.map((b) => (
                <li key={b.name}>
                  {b.url ? (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-moon/85 underline decoration-moon/30 underline-offset-4 hover:decoration-candle"
                    >
                      {b.name}
                    </a>
                  ) : (
                    <span className="text-moon/85">{b.name}</span>
                  )}
                </li>
              ))}
              {dead.length === 0 && <li className="italic text-mist">None listed yet.</li>}
            </ul>
          </div>
        </section>
      )}

      <section className="mt-8 rounded-md border border-moon/15 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="gy-caps text-xl text-moon">candles lit</h2>
          <span className="gy-label text-mist">{dollars(totalCents, { round: true })} pledged</span>
        </div>
        <ul className="mt-4 space-y-2">
          {pledges.map((p: any) => (
            <li
              key={p.id}
              className="flex justify-between border-b border-moon/10 pb-2 text-[15px]"
            >
              <span>
                {p.blogger ? (
                  <Link
                    href={`/b/${p.blogger.slug}`}
                    className="text-moon/85 underline decoration-moon/30 underline-offset-4"
                  >
                    {p.blogger.name}
                  </Link>
                ) : (
                  "—"
                )}
              </span>
              <span className="font-semibold text-moon">
                {dollars(p.amountCents, { round: true })}
              </span>
            </li>
          ))}
          {pledges.length === 0 && <li className="italic text-mist">No candles yet.</li>}
        </ul>
      </section>
    </main>
  );
}
