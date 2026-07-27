// Quadratic funding math, shared by both frontends and the server.
//
// Standard capital-constrained QF (Buterin/Hitzig/Weyl):
//   rawMatch_b = (Σ_i √p_ib)² − Σ_i p_ib
// where p_ib are the individual patron pledges to blogger b. If the sum of
// raw matches exceeds the matching pool, every match is scaled down
// proportionally so the pool is never overspent.
//
// Personal bounties (Austin's and Carol's discretionary pots) count toward a
// bounty's total but are excluded from the match calculation — they're a
// single large give, which is exactly what QF is designed not to amplify.

// Fallbacks for when the settings row hasn't loaded (or doesn't exist yet).
export const DEFAULT_POOL_CENTS = 10_000_00;
export const DEFAULT_LIVE_THRESHOLD_CENTS = 1_000_00;

export type PledgeLike = {
  amountCents: number;
  source: string; // "patron" | "austin" | "carol"
  status: string; // "pending" | "paid"
  patronId?: string;
};

export type BountyMath = {
  directCents: number; // all pledges incl. personal bounties
  patronCents: number; // QF-eligible pledges only
  personalCents: number; // austin/carol pots
  rawMatchCents: number;
  matchCents: number; // after pool scaling
  totalCents: number; // direct + match
  patronCount: number;
  isLive: boolean;
};

export type QfResult = {
  perBlogger: Map<string, BountyMath>;
  poolCents: number;
  poolUsedCents: number;
  scale: number; // 1 when the pool isn't binding
};

/** Group pledges per patron so one patron pledging twice isn't double-counted
 * as two independent contributors (√(a+b) not √a+√b). */
function sumSqrtByPatron(pledges: PledgeLike[]): {
  sumSqrt: number;
  sum: number;
  patronCount: number;
} {
  const byPatron = new Map<string, number>();
  let anonIdx = 0;
  for (const p of pledges) {
    const key = p.patronId ?? `anon-${anonIdx++}`;
    byPatron.set(key, (byPatron.get(key) ?? 0) + p.amountCents);
  }
  let sumSqrt = 0;
  let sum = 0;
  for (const cents of byPatron.values()) {
    sumSqrt += Math.sqrt(cents);
    sum += cents;
  }
  return { sumSqrt, sum, patronCount: byPatron.size };
}

export function computeQf(
  pledgesByBlogger: Map<string, PledgeLike[]>,
  poolCents: number,
  liveThresholdCents: number,
): QfResult {
  type Partial = {
    directCents: number;
    patronCents: number;
    personalCents: number;
    rawMatchCents: number;
    patronCount: number;
  };
  const partials = new Map<string, Partial>();

  let totalRawMatch = 0;
  for (const [bloggerId, pledges] of pledgesByBlogger) {
    const counted = pledges.filter((p) => p.status !== "void");
    const patronPledges = counted.filter((p) => p.source === "patron");
    const personalPledges = counted.filter((p) => p.source !== "patron");
    const { sumSqrt, sum, patronCount } = sumSqrtByPatron(patronPledges);
    const personalCents = personalPledges.reduce((a, p) => a + p.amountCents, 0);
    const rawMatchCents = Math.max(0, sumSqrt * sumSqrt - sum);
    totalRawMatch += rawMatchCents;
    partials.set(bloggerId, {
      directCents: sum + personalCents,
      patronCents: sum,
      personalCents,
      rawMatchCents,
      patronCount,
    });
  }

  const scale = totalRawMatch > poolCents ? poolCents / totalRawMatch : 1;

  const perBlogger = new Map<string, BountyMath>();
  let poolUsedCents = 0;
  for (const [bloggerId, p] of partials) {
    const matchCents = Math.floor(p.rawMatchCents * scale);
    poolUsedCents += matchCents;
    const totalCents = p.directCents + matchCents;
    perBlogger.set(bloggerId, {
      ...p,
      matchCents,
      totalCents,
      isLive: totalCents >= liveThresholdCents,
    });
  }

  return { perBlogger, poolCents, poolUsedCents, scale };
}

/** What would a hypothetical new pledge of `amountCents` do to this blogger's
 * match? Pass `patronId` when the pledger is known so the new pledge groups
 * with their past pledges (√(a+b), not a fresh patron); omit it for the
 * anonymous demo slider. */
export function marginalMatch(
  pledgesByBlogger: Map<string, PledgeLike[]>,
  poolCents: number,
  liveThresholdCents: number,
  bloggerId: string,
  amountCents: number,
  patronId?: string,
): { before: BountyMath; after: BountyMath; addedMatchCents: number } {
  const before =
    computeQf(pledgesByBlogger, poolCents, liveThresholdCents).perBlogger.get(bloggerId) ??
    emptyMath(liveThresholdCents);

  const hypothetical = new Map(pledgesByBlogger);
  const existing = hypothetical.get(bloggerId) ?? [];
  hypothetical.set(bloggerId, [
    ...existing,
    {
      amountCents,
      source: "patron",
      status: "paid",
      patronId: patronId ?? "hypothetical-new-patron",
    },
  ]);
  const after =
    computeQf(hypothetical, poolCents, liveThresholdCents).perBlogger.get(bloggerId) ??
    emptyMath(liveThresholdCents);

  return {
    before,
    after,
    addedMatchCents: Math.max(0, after.matchCents - before.matchCents),
  };
}

export function emptyMath(liveThresholdCents: number): BountyMath {
  return {
    directCents: 0,
    patronCents: 0,
    personalCents: 0,
    rawMatchCents: 0,
    matchCents: 0,
    totalCents: 0,
    patronCount: 0,
    isLive: false,
  };
}

export function daysSilent(lastPostAt: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - lastPostAt) / 86_400_000));
}
