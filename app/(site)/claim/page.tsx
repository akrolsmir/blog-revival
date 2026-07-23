"use client";

import { useSkin } from "@/lib/theme";
import GyClaim from "@/components/graveyard/pages/claim";
import WpClaim from "@/components/wordpress/pages/claim";

export default function ClaimPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyClaim /> : <WpClaim />;
}
