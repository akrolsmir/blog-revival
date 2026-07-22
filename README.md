# Blog Revival Project

Bounties for beloved dormant bloggers to write one more post. Quadratic
funding with a $10k matching pool, by [Manifund](https://manifund.org).
See [INITIAL-SPEC.md](INITIAL-SPEC.md) for the full spec.

One shared backend (InstantDB + Stripe), two demo frontends:

- **`/graveyard`** — midnight cemetery: headstones, candles, epitaphs
- **`/wordpress`** — a loving 2005 WordPress cosplay: bounties as blog posts

## Setup

```bash
bun install
cp .env.example .env   # fill in values (ask Austin)
bun run dev            # http://localhost:3000
```

Optional, to re-create the demo data:

```bash
bun run scripts/reset.ts && bun run scripts/seed.ts
```

Schema/permission changes live in `instant.schema.ts` / `instant.perms.ts`;
push with `bunx instant-cli push`.

## How it fits together

- **InstantDB** holds `profiles`, `bloggers`, `pledges`, `comments`,
  `settings`. Clients subscribe live via `lib/hooks.ts`; QF math
  (`lib/qf.ts`) runs client-side off the raw pledges, and is recomputed
  server-side before any money moves.
- **Stripe Checkout** takes pledges (`/api/checkout` →
  webhook or `/api/checkout/confirm` records the pledge server-side).
- **Stripe Connect** pays bloggers out (`/api/connect/onboard`,
  `/api/connect/payout`) once a claim is hand-verified
  (`bloggers.claimVerified`) and a revival post is linked. Bloggers can
  instead redirect their bounty to another blogger or donate it
  (`/api/claim`).
- Auth is InstantDB magic codes (email → six-digit code).
- Personal bounties (Austin/Carol's pots, `pledges.source != "patron"`)
  count toward the $1,000 threshold but are excluded from QF matching.

Test payments with card `4242 4242 4242 4242`, any future expiry, any CVC.
