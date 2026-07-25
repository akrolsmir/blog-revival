"use client";

import Link from "next/link";
import { useMyProfile, useIsAdmin } from "@/lib/hooks";

// The header wraps rather than shrinks: below ~360px the wordmark and the
// "become a patron" button can't share a line, and without flex-wrap the
// button ran past the right edge of the viewport instead of dropping under
// the wordmark. whitespace-nowrap keeps each label whole so wrapping moves
// entire links, never breaking one across two lines.
export function GyNav() {
  const { user, profile } = useMyProfile();
  const isAdmin = useIsAdmin();
  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-6 md:px-12">
      <Link href="/" className="gy-caps text-[25px] tracking-[0.14em] text-moon hover:text-moon">
        revive.blog
      </Link>
      <nav className="gy-caps flex flex-wrap items-center justify-end gap-x-5 gap-y-2.5 whitespace-nowrap text-[17px] tracking-[0.18em] md:gap-x-8">
        <Link href="/#about" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          about
        </Link>
        <Link href="/#blogroll" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          blogs
        </Link>
        <Link href="/#faq" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          faq
        </Link>
        <Link href="/patrons" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          patrons
        </Link>
        <Link href="/nominate" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          nominate
        </Link>
        <Link href="/claim" className="text-[#b9c2d4] hover:text-moon">
          for bloggers
        </Link>
        {isAdmin && (
          <Link href="/admin" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
            review
          </Link>
        )}
        {user && profile ? (
          <Link
            href="/account"
            className="rounded-[3px] border border-gold/50 px-4 py-2 text-gold hover:bg-gold/10"
          >
            {profile.handle}
          </Link>
        ) : (
          <Link
            href={user ? "/account" : "/signin"}
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
      <div className="gy-caps mb-2.5 text-[19px] tracking-[0.14em] text-moon">revive.blog</div>
      <p className="text-[15px] text-[#7e8aa3]">
        A project of{" "}
        <a href="https://manifund.org" className="text-[#e8c87a] hover:text-[#f6e0a8]">
          Manifund
        </a>
        , a 501(c)(3) nonprofit. Pledges are tax-deductible.
      </p>
      <nav className="gy-caps mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] tracking-[0.18em] text-mist">
        <Link href="/#about" className="hover:text-moon">
          about
        </Link>
        <Link href="/#blogroll" className="hover:text-moon">
          blogs
        </Link>
        <Link href="/#faq" className="hover:text-moon">
          faq
        </Link>
        <Link href="/patrons" className="hover:text-moon">
          patrons
        </Link>
        <Link href="/nominate" className="hover:text-moon">
          nominate
        </Link>
        <Link href="/claim" className="hover:text-moon">
          claim your grave
        </Link>
      </nav>
    </footer>
  );
}
