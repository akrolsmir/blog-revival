"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMyProfile, useIsAdmin } from "@/lib/hooks";
import { listPendingNominations, reviewNomination } from "@/lib/actions";

type Nom = {
  id: string;
  blogName: string;
  authorName: string;
  blogUrl: string;
  lastPostAt: number;
  topPosts?: { title: string; url: string }[];
  createdAt: number;
  submitter?: { handle: string; displayName: string } | null;
};

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPage() {
  const { user, isLoading } = useMyProfile();
  const isAdmin = useIsAdmin();
  const [noms, setNoms] = useState<Nom[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    listPendingNominations().then((res) => {
      if (res?.error) setError(res.error);
      else setNoms(res.nominations ?? []);
    });
  }, [isAdmin]);

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    const res = await reviewNomination(id, action);
    setBusyId(null);
    if (res?.error) setError(res.error);
    else setNoms((ns) => (ns ?? []).filter((n) => n.id !== id));
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Nomination review</h1>
          <Link href="/" className="text-sm text-blue-700 underline">
            ← site
          </Link>
        </header>

        {isLoading && <p className="mt-6 text-sm text-neutral-500">Loading…</p>}

        {!isLoading && !user && (
          <p className="mt-6 text-sm">
            <Link href="/signin?next=/admin" className="text-blue-700 underline">
              Sign in
            </Link>{" "}
            to review nominations.
          </p>
        )}

        {!isLoading && user && !isAdmin && (
          <p className="mt-6 text-sm text-neutral-600">
            You&rsquo;re signed in as {user.email}, which isn&rsquo;t an admin account. Nomination
            review is limited to Manifund admins.
          </p>
        )}

        {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

        {isAdmin && noms !== null && noms.length === 0 && (
          <p className="mt-6 text-sm text-neutral-500">No pending nominations. 🎉</p>
        )}

        {isAdmin && noms && noms.length > 0 && (
          <ul className="mt-6 space-y-4">
            {noms.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-lg font-bold">{n.blogName}</span>
                  <span className="text-sm text-neutral-500">by {n.authorName}</span>
                </div>
                <p className="mt-1 text-sm">
                  <a
                    href={n.blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline"
                  >
                    {n.blogUrl.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                  <span className="text-neutral-500"> · last post {fmtDate(n.lastPostAt)}</span>
                </p>
                {n.topPosts && n.topPosts.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-neutral-700">
                    {n.topPosts.map((p, i) => (
                      <li key={i}>
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline"
                          >
                            {p.title || p.url}
                          </a>
                        ) : (
                          p.title
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-neutral-400">
                  submitted {fmtDate(n.createdAt)}
                  {n.submitter ? ` by @${n.submitter.handle}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => review(n.id, "approve")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {busyId === n.id ? "…" : "Approve → create bounty"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => review(n.id, "reject")}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
