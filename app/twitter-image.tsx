// Same card as opengraph-image. X reads og:image when twitter:image is
// missing, but only after twitter:card is declared — declaring both leaves
// nothing to infer.
import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export default async function Image() {
  return renderOgImage();
}
