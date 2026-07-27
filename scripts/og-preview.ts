/**
 * Renders the social card to a PNG on disk so it can be eyeballed without a
 * browser or a deploy:
 *
 *   bun run scripts/og-preview.ts [outfile]
 *
 * Same code path the /opengraph-image route uses, so what lands here is what
 * crawlers get. Worth reaching for while tuning lib/og.tsx — Satori reports
 * layout errors as an opaque "failed to pipe response" through the route, but
 * throws them with a real message here.
 */
import { writeFile } from "node:fs/promises";
import { renderOgImage } from "@/lib/og";

const out = process.argv[2] ?? "og-preview.png";
const res = await renderOgImage();
const buf = Buffer.from(await res.arrayBuffer());
await writeFile(out, buf);
console.log(`wrote ${out} (${buf.length.toLocaleString("en-US")} bytes)`);
