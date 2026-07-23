"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useMyProfile } from "@/lib/hooks";
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

  if (isLoading) return <p className="wp-meta italic">Loading…</p>;
  if (!user) {
    return (
      <div>
        <h2 className="text-[22px] font-bold">Your profile</h2>
        <p className="mt-2">
          <Link href="/signin?next=/account">Sign in first →</Link>
        </p>
      </div>
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
      setError("Username and display name are required.");
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
        skin: "wordpress",
      });
      setSaved(true);
      if (next) router.push(next);
    } catch {
      setError("Couldn't save — that username may be taken.");
    }
  }

  const myPledges = (profile?.pledges ?? [])
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  return (
    <div>
      <h2 className="text-[22px] font-bold">{profile ? "Edit your profile" : "Become a patron"}</h2>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12px] font-bold">Username</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="mt-1 w-full"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-bold">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[12px] font-bold">About you</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-bold">What kind of posts do you like?</span>
          <textarea
            value={postsILike}
            onChange={(e) => setPostsILike(e.target.value)}
            rows={3}
            className="mt-1 w-full"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12px] font-bold">Favorite living blogs</span>
            <textarea
              value={alive}
              onChange={(e) => setAlive(e.target.value)}
              rows={4}
              className="mt-1 w-full"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-bold">Favorite dead blogs</span>
            <textarea
              value={dead}
              onChange={(e) => setDead(e.target.value)}
              rows={4}
              className="mt-1 w-full"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={save}>
            Update Profile »
          </button>
          {profile && <Link href={`/p/${profile.handle}`}>view public page</Link>}
          <button
            type="button"
            onClick={() => {
              posthog.capture("signed_out", { skin: "wordpress" });
              posthog.reset();
              db.auth.signOut();
            }}
            className="!ml-auto !border-0 !bg-none !bg-transparent !p-0 !font-normal !text-wplink underline"
          >
            Log out
          </button>
        </div>
        {saved && <p className="text-[12.5px] text-wpgreen">Profile updated.</p>}
        {error && <p className="text-[12.5px] text-red-700">{error}</p>}
      </div>

      {myPledges.length > 0 && (
        <section className="mt-8">
          <h3 className="text-[15px] font-bold">Your pledges</h3>
          <table className="mt-2 w-full text-[12.5px]">
            <tbody>
              {myPledges.map((p: any) => (
                <tr key={p.id} className="border-b border-dotted border-wpborder">
                  <td className="py-1.5">
                    {p.blogger ? <Link href={`/b/${p.blogger.slug}`}>{p.blogger.name}</Link> : "—"}
                  </td>
                  <td className="py-1.5 text-right font-bold">
                    {dollars(p.amountCents, { round: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default function WpAccountPage() {
  return (
    <Suspense>
      <AccountInner />
    </Suspense>
  );
}
