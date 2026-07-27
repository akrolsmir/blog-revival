import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The scene reads live funding, so the card can't be baked at build time — but
// crawlers refetch it constantly, so cache an hour between database reads.
export const revalidate = 3600;

export default async function Image() {
  return renderOgImage();
}
