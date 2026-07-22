"use client";

import Link from "next/link";
import { useMyProfile } from "@/lib/hooks";

export function GyNav() {
  const { user, profile } = useMyProfile();
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-6 py-6 md:px-12">
      <Link href="/graveyard" className="flex items-baseline gap-3.5">
        <span className="gy-caps text-[22px] font-semibold tracking-[0.14em] text-moon">
          revive.blog
        </span>
        <span className="gy-caps hidden text-xs tracking-[0.22em] text-mist sm:inline">
          the blog revival project
        </span>
      </Link>
      <nav className="gy-caps flex items-center gap-5 text-sm tracking-[0.18em] md:gap-8">
        <Link href="/graveyard#how" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          how it works
        </Link>
        <Link href="/graveyard#blogroll" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          the blogroll
        </Link>
        <Link href="/graveyard/claim" className="text-[#b9c2d4] hover:text-moon">
          for bloggers
        </Link>
        {user && profile ? (
          <Link
            href="/graveyard/account"
            className="rounded-[3px] border border-gold/50 px-4 py-2 text-gold hover:bg-gold/10"
          >
            {profile.handle}
          </Link>
        ) : (
          <Link
            href={user ? "/graveyard/account" : "/graveyard/signin"}
            className="rounded-[3px] bg-gold px-5 py-2 text-[#171208] shadow-[0_0_24px_rgba(230,184,92,.28)] hover:bg-gold/90"
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
    <footer className="border-t border-[#141d30] bg-abyss px-6 py-14 text-center">
      <div className="gy-caps mb-2.5 text-[19px] tracking-[0.14em] text-moon">
        revive.blog
      </div>
      <p className="text-[15px] text-[#7e8aa3]">
        A project of{" "}
        <a
          href="https://manifund.org"
          className="text-[#e8c87a] hover:text-[#f6e0a8]"
        >
          Manifund
        </a>
        , a 501(c)(3) nonprofit. Pledges are tax-deductible per US law.
      </p>
      <nav className="gy-caps mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] tracking-[0.18em] text-mist">
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
      <p className="mt-7 text-[13px] italic text-[#525e76]">
        Rest is temporary. Blogs are forever.
      </p>
    </footer>
  );
}
