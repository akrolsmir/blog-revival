"use client";

import { use } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { dollars } from "@/lib/format";

export default function WpPatronPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const { data, isLoading } = db.useQuery({
    profiles: {
      $: { where: { handle } },
      pledges: { blogger: {} },
      comments: { blogger: {} },
    },
  });

  if (isLoading) return <p className="wp-meta italic">Loading…</p>;
  const profile = data?.profiles?.[0];
  if (!profile) {
    return (
      <div>
        <h2 className="text-[22px] font-bold">404 — No such patron</h2>
        <p className="mt-2">
          <Link href="/">← Back to the front page</Link>
        </p>
      </div>
    );
  }

  const pledges = (profile.pledges ?? [])
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
  const totalCents = pledges.reduce((a: number, p: any) => a + p.amountCents, 0);
  const alive = (profile.favoriteAliveBlogs ?? []) as { name: string; url: string }[];
  const dead = (profile.favoriteDeadBlogs ?? []) as { name: string; url: string }[];
  const comments = (profile.comments ?? [])
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  return (
    <div>
      <h2 className="text-[26px] font-bold">{profile.displayName}</h2>
      <p className="wp-meta mt-1">
        @{profile.handle} · patron · {dollars(totalCents, { round: true })} pledged across{" "}
        {pledges.length} bounties
      </p>
      {profile.bio && <p className="mt-3 text-[13.5px]">{profile.bio}</p>}

      {profile.postsILike && (
        <section className="mt-6">
          <h3 className="text-[15px] font-bold">What I want to read</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed">{profile.postsILike}</p>
        </section>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="text-[15px] font-bold">Blogroll (alive)</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[13px]">
            {alive.map((b) => (
              <li key={b.name}>
                {b.url ? (
                  <a href={b.url} target="_blank" rel="noopener noreferrer">
                    {b.name}
                  </a>
                ) : (
                  b.name
                )}
              </li>
            ))}
            {alive.length === 0 && <li className="wp-meta italic">None listed.</li>}
          </ul>
        </section>
        <section>
          <h3 className="text-[15px] font-bold">Blogroll (dearly departed)</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[13px]">
            {dead.map((b) => (
              <li key={b.name}>
                {b.url ? (
                  <a href={b.url} target="_blank" rel="noopener noreferrer">
                    {b.name}
                  </a>
                ) : (
                  b.name
                )}
              </li>
            ))}
            {dead.length === 0 && <li className="wp-meta italic">None listed.</li>}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <h3 className="text-[15px] font-bold">Pledges</h3>
        <table className="mt-2 w-full text-[12.5px]">
          <tbody>
            {pledges.map((p: any) => (
              <tr key={p.id} className="border-b border-dotted border-wpborder">
                <td className="py-1.5">
                  {p.blogger ? <Link href={`/b/${p.blogger.slug}`}>{p.blogger.name}</Link> : "—"}
                </td>
                <td className="py-1.5 text-right font-bold">
                  {dollars(p.amountCents, { round: true })}
                </td>
              </tr>
            ))}
            {pledges.length === 0 && (
              <tr>
                <td className="wp-meta py-1.5 italic">No pledges yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {comments.length > 0 && (
        <section className="mt-6">
          <h3 className="text-[15px] font-bold">Recent comments</h3>
          <ul className="mt-2 space-y-2 text-[13px]">
            {comments.slice(0, 5).map((c: any) => (
              <li key={c.id}>
                on {c.blogger ? <Link href={`/b/${c.blogger.slug}`}>{c.blogger.name}</Link> : "—"}:{" "}
                <em>&ldquo;{c.text}&rdquo;</em>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
