"use client";

import Link from "next/link";
import { useMyProfile, useIsAdmin } from "@/lib/hooks";

// One list, two shapes: the Meta widget in the left column from md up, and a
// single wrapped strip of links under the header on phones. Stacked, the
// widget put nine links and a heading above the first line of the post — the
// most expensive real estate on the page spent on navigation.
function useMetaLinks(): { href: string; label: string; short?: string }[] {
  const { user, profile } = useMyProfile();
  const isAdmin = useIsAdmin();
  return [
    ...(user && profile
      ? [{ href: "/account", label: "Profile" }]
      : [
          { href: "/signin", label: "Sign in" },
          { href: user ? "/account" : "/signin", label: "Become a patron" },
        ]),
    { href: "/patrons", label: "Browse patrons", short: "Patrons" },
    { href: "/feed", label: "Recent activity", short: "Activity" },
    { href: "/claim", label: "Claim your blogger profile", short: "Claim your blog" },
    { href: "/nominate", label: "Nominate a blog", short: "Nominate" },
    { href: "/#faq", label: "FAQ" },
    ...(isAdmin ? [{ href: "/admin", label: "Review nominations", short: "Review" }] : []),
  ];
}

export function WpMeta() {
  const links = useMetaLinks();
  return (
    <aside>
      <section>
        <h2 className="wp-widget-title">Meta</h2>
        <ul className="mt-2 space-y-1.5">
          {links.map((l) => (
            <li key={l.label}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

// The strip reads as a nav bar, so it uses the shorter labels where the widget
// spelled things out: the page around it supplies the context they carried.
export function WpMetaBar() {
  const links = useMetaLinks();
  return (
    <nav
      aria-label="Meta"
      className="flex flex-wrap items-baseline gap-x-1 border-b border-dotted border-wpborder px-5 py-2 text-[12px] md:hidden"
    >
      {links.map((l, i) => (
        <span key={l.label} className="whitespace-nowrap">
          {i > 0 && <span className="mr-1 text-wpmeta">·</span>}
          <Link href={l.href} className="inline-block py-1">
            {l.short ?? l.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
