# CLAUDE.md

Blog Revival Project: bounties for dormant bloggers to write one more post,
funded by quadratic matching. A Manifund project. Full product spec:
INITIAL-SPEC.md. Design references: prototypes/*.html (open in a browser;
they're JS-bundled single files).

## Commands

- `bun run dev` — dev server on :3000 (use bun, not npm; bun.lock is canonical)
- `bunx tsc --noEmit` — type check (no test suite exists)
- `bunx instant-cli push` — push instant.schema.ts / instant.perms.ts changes
- `bun run scripts/reset.ts && bun run scripts/seed.ts` — wipe + reseed demo data
- Secrets live in `.env` (gitignored); template in `.env.example`

## Architecture

One shared backend, one route tree, two skins keyed to dark/light mode
(dark → graveyard, light → WordPress). Full rationale and gotchas:
docs/2026-07-23-theming.md. `lib/theme.tsx` wraps next-themes:
system preference by default, explicit choice persisted; it sets
`skin-gy`/`skin-wp` on `<html>` pre-paint and exposes `useSkin()`
(undefined until mounted — skinned trees must not render during hydration).

- `components/graveyard/**` — dark cemetery skin (Cormorant Garamond
  headings, Cormorant SC small-caps, Newsreader body; UI gold `#e6b85c`,
  flame `#ffc45e`, on navy `#0b1120`)
- `components/wordpress/**` — 2005 WordPress pastiche (Georgia headings,
  Lucida body, Kubrick blue header, sidebar widgets)
- Routes in `app/(site)/`: `/` home, `b/[slug]` blogger, `p/[handle]`
  patron, `patrons`, `signin`, `account`, `claim`. Each route (and the
  (site) layout, which picks the Shell) is a thin `useSkin()` switch over
  the per-skin page components in `components/<skin>/pages/*`; chrome lives
  in `components/<skin>/Shell.tsx`. Keep the two skins feature-equivalent
  when adding anything; shared logic goes in `lib/`, only markup differs.
  The theme switcher is a fixed corner button (`components/ThemeFab.tsx`)
  rendered by the (site) layout outside both shells.
- `/graveyard/*` and `/wordpress/*` are legacy URLs: they force the matching
  theme and redirect to the unified path. `/choose` is the old side-by-side
  demo picker.
- Skin CSS is scoped by `.gy` / `.wp` wrapper classes defined in
  app/globals.css (Tailwind v4 `@theme` tokens + custom classes). The
  html-level `skin-*` classes set only the background — never put `.wp` on
  `<html>`: its 13px font-size would rescale every rem unit.

Data: InstantDB (client SDK in `lib/db.ts`, admin SDK in `lib/admin.ts` —
never import admin in client code). All pages are client components using
live queries via `lib/hooks.ts` (`useBounties`, `useMyProfile`).

Money flow (all writes server-side; clients never create pledges):
- Pledge: `lib/actions.ts` → POST /api/checkout → Stripe Checkout →
  webhook `/api/stripe/webhook` OR success-redirect `/api/checkout/confirm`
  (both call `lib/record-pledge.ts`, idempotent on stripeSessionId)
- Payout: `/api/connect/onboard` (Express account) → `/api/connect/payout`
  (transfer; deducts the match from settings.matchingPoolCents)
- Claim/redirect/donate: `/api/claim` (verifies Instant refresh token)

## Domain rules (non-obvious)

- QF math in `lib/qf.ts`: match = (Σ√pledges)² − Σpledges per blogger,
  scaled proportionally so total matches never exceed the pool. Pledges are
  grouped per patron before sqrt (two pledges from one patron ≠ two patrons).
- `pledges.source`: "patron" = QF-matched; "austin"/"carol" (personal
  bounties) and "redirect" count toward the $1,000 live threshold but get
  NO match. Display patron counts via `supporterCount` (everyone), not
  `math.patronCount` (QF-eligible only).
- Server recomputes QF before any payout — never trust client totals.
- Bounty lifecycle: bloggers.status = funding → live (computed, not stored:
  total ≥ settings.liveThresholdCents) → revived (post linked) → paid.
  Payout additionally requires claimVerified, set manually by staff in the
  Instant dashboard after human review.
- Auth: Instant magic codes. A profile links to $users; seeded demo
  profiles (austin, carol, earlyreader…) have no linked user on purpose.
- Permissions (instant.perms.ts): pledges/settings are server-write-only;
  bloggers updatable only by their claimant; profile handle is unique.

## Docs

Medium-to-large changes (eg 10+ files and/or 1000+ lines) get a short writeup in `docs/`, named
`YYYY-MM-DD-<topic>.md` (see docs/2026-07-23-theming.md): what & why, a
concrete "What changed" list, how it works now, non-obvious gotchas. These
are point-in-time records — where one disagrees with the code or this
file, trust the code. Titles and summaries in plain literal prose; compact
phrasing is fine in the detail sections. Link a doc from this file when it
explains standing architecture.

## Gotchas

- The InstantDB app id in .env is shared with other experiments — a schema
  push shows DELETE NAMESPACE diffs for entities it doesn't know about.
  Never run `instant-cli push --yes` without reading the plan first.
- Components using useSearchParams (PledgeBox, WpPledgeForm, signin,
  account pages) must stay wrapped in <Suspense> or the build fails.
- Amounts are integer cents everywhere; format only via lib/format.ts.
