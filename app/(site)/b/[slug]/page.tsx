"use client";

import { useSkin } from "@/lib/theme";
import GyBlogger from "@/components/graveyard/pages/blogger";
import WpBlogger from "@/components/wordpress/pages/blogger";

export default function BloggerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? (
    <GyBlogger params={params} />
  ) : (
    <WpBlogger params={params} />
  );
}
