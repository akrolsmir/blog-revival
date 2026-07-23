"use client";

import { useSkin } from "@/lib/theme";
import GyPatrons from "@/components/graveyard/pages/patrons";
import WpPatrons from "@/components/wordpress/pages/patrons";

export default function PatronsPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyPatrons /> : <WpPatrons />;
}
