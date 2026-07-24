"use client";

import Link from "next/link";
import { useMyProfile, useIsAdmin } from "@/lib/hooks";

export function WpMeta() {
  const { user, profile } = useMyProfile();
  const isAdmin = useIsAdmin();
  return (
    <aside>
      <section>
        <h2 className="wp-widget-title">Meta</h2>
        <ul className="mt-2 space-y-1.5">
          {user && profile ? (
            <li>
              <Link href="/account">Profile</Link>
            </li>
          ) : (
            <>
              <li>
                <Link href="/signin">Sign in</Link>
              </li>
              <li>
                <Link href={user ? "/account" : "/signin"}>Become a patron</Link>
              </li>
            </>
          )}
          <li>
            <Link href="/patrons">Browse patrons</Link>
          </li>
          <li>
            <Link href="/claim">Claim your blogger profile</Link>
          </li>
          <li>
            <Link href="/nominate">Nominate a blog</Link>
          </li>
          {isAdmin && (
            <li>
              <Link href="/admin">Review nominations</Link>
            </li>
          )}
        </ul>
      </section>
    </aside>
  );
}
