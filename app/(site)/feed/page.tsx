"use client";

import { useSkin } from "@/lib/theme";
import GyFeed from "@/components/graveyard/pages/feed";
import WpFeed from "@/components/wordpress/pages/feed";

export default function FeedPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyFeed /> : <WpFeed />;
}
