export function dollars(cents: number, opts: { round?: boolean } = {}): string {
  const d = cents / 100;
  if (opts.round || Number.isInteger(d)) {
    return `$${Math.round(d).toLocaleString("en-US")}`;
  }
  return `$${d.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function daysAgoWords(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days.toLocaleString("en-US")} days ago`;
}
