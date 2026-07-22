"use client";

import Link from "next/link";
import { useMyProfile } from "@/lib/hooks";

export function GyNav() {
  const { user, profile } = useMyProfile();
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 md:px-12">
      <Link href="/graveyard" className="flex items-baseline gap-3">
        <span className="gy-label text-base font-semibold tracking-[0.2em] text-moon">
          revive.blog
        </span>
        <span className="gy-caps hidden text-sm text-mist sm:inline">
          the blog revival project
        </span>
      </Link>
      <nav className="gy-caps flex items-center gap-5 text-sm md:gap-8">
        <Link href="/graveyard#how" className="hidden text-moon/80 hover:text-moon sm:inline">
          how it works
        </Link>
        <Link href="/graveyard#blogroll" className="hidden text-moon/80 hover:text-moon sm:inline">
          the blogroll
        </Link>
        <Link href="/graveyard/claim" className="text-moon/80 hover:text-moon">
          for bloggers
        </Link>
        {user && profile ? (
          <Link
            href="/graveyard/account"
            className="rounded-sm border border-candle/50 px-4 py-1.5 text-candle hover:bg-candle/10"
          >
            {profile.handle}
          </Link>
        ) : (
          <Link
            href={user ? "/graveyard/account" : "/graveyard/signin"}
            className="rounded-sm bg-candle px-4 py-1.5 font-medium text-night hover:bg-candle/90"
          >
            become a patron
          </Link>
        )}
      </nav>
    </header>
  );
}

export function GyFooter() {
  return (
    <footer className="bg-abyss px-6 py-14 text-center">
      <div className="gy-label mb-3 text-moon">revive.blog</div>
      <p className="text-mist">
        A project of{" "}
        <a
          href="https://manifund.org"
          className="underline decoration-mist/40 underline-offset-4 hover:text-moon"
        >
          Manifund
        </a>
        , a 501(c)(3) nonprofit. Pledges are tax-deductible per US law.
      </p>
      <nav className="gy-caps mt-6 flex justify-center gap-8 text-sm text-moon/70">
        <Link href="/graveyard#how" className="hover:text-moon">
          how it works
        </Link>
        <Link href="/graveyard#blogroll" className="hover:text-moon">
          the blogroll
        </Link>
        <Link href="/graveyard/claim" className="hover:text-moon">
          claim your grave
        </Link>
        <Link href="/wordpress" className="hover:text-moon">
          the other demo
        </Link>
      </nav>
      <p className="mt-8 text-sm italic text-mist/70">
        Rest is temporary. Blogs are forever.
      </p>
    </footer>
  );
}
