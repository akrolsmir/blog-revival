"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useMyProfile } from "@/lib/hooks";
import { claimSignupCredit } from "@/lib/actions";
import { dollars } from "@/lib/format";
import posthog from "posthog-js";

type FavBlog = { name: string; url: string };

function parseFavs(text: string): FavBlog[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, url] = line.split("|").map((s) => s.trim());
      return { name: name ?? line, url: url ?? "" };
    });
}

function favsToText(favs?: FavBlog[]): string {
  return (favs ?? []).map((f) => (f.url ? `${f.name} | ${f.url}` : f.name)).join("\n");
}

function AccountInner() {
  const { user, profile, isLoading } = useMyProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [postsILike, setPostsILike] = useState("");
  const [alive, setAlive] = useState("");
  const [dead, setDead] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user && !loaded) {
      posthog.identify(user.id, {});
    }
    if (profile && !loaded) {
      setHandle(profile.handle);
      setDisplayName(profile.displayName);
      setBio(profile.bio ?? "");
      setPostsILike(profile.postsILike ?? "");
      setAlive(favsToText(profile.favoriteAliveBlogs as FavBlog[]));
      setDead(favsToText(profile.favoriteDeadBlogs as FavBlog[]));
      setLoaded(true);
    }
  }, [profile, loaded, user]);

  if (isLoading) {
    return <p className="gy-label py-32 text-center text-mist">summoning…</p>;
  }
  if (!user) {
    return (
      <main className="px-6 py-32 text-center">
        <h1 className="text-4xl">You&rsquo;re not signed in.</h1>
        <Link
          href="/signin"
          className="gy-caps mt-6 inline-block text-candle underline underline-offset-4"
        >
          sign in first
        </Link>
      </main>
    );
  }

  async function save() {
    setError(null);
    setSaved(false);
    const cleanHandle = handle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");
    if (!cleanHandle || !displayName.trim()) {
      setError("Handle and display name are required.");
      return;
    }
    try {
      const profileId = profile?.id ?? id();
      await db.transact(
        db.tx.profiles[profileId]
          .update({
            handle: cleanHandle,
            displayName: displayName.trim(),
            bio: bio.trim() || undefined,
            postsILike: postsILike.trim() || undefined,
            favoriteAliveBlogs: parseFavs(alive),
            favoriteDeadBlogs: parseFavs(dead),
            createdAt: profile?.createdAt ?? Date.now(),
          })
          .link({ user: user!.id }),
      );
      posthog.capture("profile_saved", {
        is_new_profile: !profile,
        skin: "graveyard",
      });
      await claimSignupCredit();
      setSaved(true);
      if (next) router.push(next);
    } catch (e: any) {
      setError(
        e?.message?.includes("unique")
          ? "That handle is taken — pick another."
          : "Couldn't save. Try a different handle?",
      );
    }
  }

  const myPledges = (profile?.pledges ?? [])
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="gy-label text-mist">your plot in the yard</p>
      <h1 className="mt-3 text-4xl">{profile ? "Your patron profile" : "Become a patron"}</h1>
      {(profile?.creditCents ?? 0) > 0 && (
        <p className="mt-4 rounded-sm border border-candle/40 bg-candle/10 px-4 py-3 text-candle">
          Your balance is <strong>{dollars(profile!.creditCents!, { round: true })}</strong> to
          pledge with.
        </p>
      )}
      <p className="mt-3 text-moon/80">
        Patrons keep the graveyard lit. Tell the bloggers who you are and what you&rsquo;re hoping
        they&rsquo;ll write.
      </p>

      <div className="mt-10 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="gy-label text-mist">handle</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="quietlurker"
              className="mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon"
            />
          </label>
          <label className="block">
            <span className="gy-label text-mist">display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="A. Reader"
              className="mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon"
            />
          </label>
        </div>
        <label className="block">
          <span className="gy-label text-mist">bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon"
          />
        </label>
        <label className="block">
          <span className="gy-label text-mist">what kind of posts do you like?</span>
          <textarea
            value={postsILike}
            onChange={(e) => setPostsILike(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-moon placeholder:text-mist/50"
          />
        </label>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="gy-label text-mist">favorite living blogs</span>
            <textarea
              value={alive}
              onChange={(e) => setAlive(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-[13px] text-moon placeholder:text-mist/50"
            />
          </label>
          <label className="block">
            <span className="gy-label text-mist">favorite dead blogs</span>
            <textarea
              value={dead}
              onChange={(e) => setDead(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-sm border border-moon/25 bg-transparent px-3 py-2 text-[13px] text-moon placeholder:text-mist/50"
            />
          </label>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            className="gy-caps rounded-sm bg-candle px-8 py-3 text-[19px] text-night hover:bg-candle/90"
          >
            save profile
          </button>
          {profile && (
            <Link
              href={`/p/${profile.handle}`}
              className="gy-caps text-sm text-mist underline underline-offset-4 hover:text-moon"
            >
              view public page
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              posthog.capture("signed_out", { skin: "graveyard" });
              posthog.reset();
              db.auth.signOut();
            }}
            className="gy-caps ml-auto text-sm text-mist underline underline-offset-4 hover:text-moon"
          >
            sign out
          </button>
        </div>
        {saved && <p className="text-sm text-candle">Saved.</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>

      {myPledges.length > 0 && (
        <section className="mt-14">
          <h2 className="gy-caps text-2xl text-moon">your pledges</h2>
          <ul className="mt-4 space-y-2">
            {myPledges.map((p: any) => (
              <li
                key={p.id}
                className="flex justify-between border-b border-moon/10 pb-2 text-[15px]"
              >
                <span className="text-moon/85">
                  {p.blogger ? (
                    <Link
                      href={`/b/${p.blogger.slug}`}
                      className="underline decoration-moon/30 underline-offset-4"
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
          </ul>
        </section>
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="gy-label py-32 text-center text-mist">stirring…</p>}>
      <AccountInner />
    </Suspense>
  );
}
