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

/**
 * A small icon for a blogger: their own photo if set, otherwise the favicon of
 * their old blog via Google's faviconV2 service (the one Chrome uses). Blogs
 * without a favicon 404 — pair this with an onError that hides the <img>.
 */
export function bloggerIcon(
  blogUrl: string,
  photoUrl?: string | null,
  size = 64
): string {
  if (photoUrl) return photoUrl;
  const target = /^https?:\/\//.test(blogUrl) ? blogUrl : `https://${blogUrl}`;
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
    target
  )}&size=${size}`;
}
