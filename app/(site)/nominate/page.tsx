"use client";

import { useSkin } from "@/lib/theme";
import GyNominate from "@/components/graveyard/pages/nominate";
import WpNominate from "@/components/wordpress/pages/nominate";

export default function NominatePage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyNominate /> : <WpNominate />;
}
