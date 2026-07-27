"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMyProfile, useIsAdmin } from "@/lib/hooks";

// The header wraps rather than shrinks: below ~360px the wordmark and the
// "become a patron" button can't share a line, and without flex-wrap the
// button ran past the right edge of the viewport instead of dropping under
// the wordmark. whitespace-nowrap keeps each label whole so wrapping moves
// entire links, never breaking one across two lines.
//
// On phones the header all but disappears. The top of a small screen is the
// only real estate a visitor is guaranteed to see, and a nav bar there was
// spending it on links (and a gold CTA) that repeat what the hero and the
// footer already say. On the home route it renders nothing at all below md,
// so the hero's own "Blog Revival Project" is the first line on the page;
// elsewhere it keeps a bare wordmark as the way back home. Everything the
// mobile header dropped — including sign in / your account, which the footer
// never carried — now lives in the footer nav.
export function GyNav() {
  const { user, profile } = useMyProfile();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <header
      className={`relative z-20 flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4 md:flex md:px-12 md:py-6 ${
        isHome ? "hidden" : "flex"
      }`}
    >
      <Link
        href="/"
        className="gy-caps text-[21px] tracking-[0.14em] text-moon hover:text-moon md:text-[25px]"
      >
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
        <Link href="/feed" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          activity
        </Link>
        <Link href="/nominate" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
          nominate
        </Link>
        <Link href="/claim" className="hidden text-[#b9c2d4] hover:text-moon sm:inline">
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
            className="text-[#b9c2d4] hover:text-moon sm:rounded-[3px] sm:border sm:border-gold/50 sm:px-4 sm:py-2 sm:text-gold sm:hover:bg-gold/10"
          >
            {profile.handle}
          </Link>
        ) : (
          <Link
            href={user ? "/account" : "/signin"}
            className="text-[#b9c2d4] hover:text-moon sm:rounded-[3px] sm:bg-gold sm:px-5 sm:py-2 sm:text-[#171208] sm:shadow-[0_0_24px_rgba(230,184,92,.28)] sm:hover:bg-gold/90"
          >
            <span className="sm:hidden">sign in</span>
            <span className="hidden sm:inline">become a patron</span>
          </Link>
        )}
      </nav>
    </header>
  );
}

// Since the mobile header carries no links, this nav is the whole site map on a
// phone — hence the account entry, and hence links padded out to a thumb-sized
// tap target rather than the 13px text row they were on desktop.
const FOOTER_LINKS = [
  { href: "/#about", label: "about" },
  { href: "/#blogroll", label: "blogs" },
  { href: "/#faq", label: "faq" },
  { href: "/patrons", label: "patrons" },
  { href: "/feed", label: "activity" },
  { href: "/nominate", label: "nominate" },
  { href: "/claim", label: "claim your grave" },
];

export function GyFooter() {
  const { user, profile } = useMyProfile();
  const account =
    user && profile
      ? { href: "/account", label: "your account" }
      : { href: user ? "/account" : "/signin", label: "sign in" };
  return (
    <footer className="border-t border-[#141d30] bg-abyss px-6 py-12 text-center md:py-14">
      <div className="gy-caps mb-2.5 text-[19px] tracking-[0.14em] text-moon">revive.blog</div>
      <p className="mx-auto max-w-[46ch] text-[15px] text-[#7e8aa3] text-pretty">
        A project of{" "}
        <a href="https://manifund.org" className="text-[#e8c87a] hover:text-[#f6e0a8]">
          Manifund
        </a>
        , a 501(c)(3) nonprofit. Pledges are tax-deductible.
      </p>
      <nav className="gy-caps mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-x-7 gap-y-1 text-[14px] tracking-[0.18em] text-mist md:mt-6 md:gap-x-8 md:text-[13px]">
        {[...FOOTER_LINKS, account].map((l) => (
          <Link key={l.href} href={l.href} className="py-1.5 hover:text-moon">
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
