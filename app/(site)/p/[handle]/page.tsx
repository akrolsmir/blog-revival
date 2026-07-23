"use client";

import { useSkin } from "@/lib/theme";
import GyPatron from "@/components/graveyard/pages/patron";
import WpPatron from "@/components/wordpress/pages/patron";

export default function PatronPage({ params }: { params: Promise<{ handle: string }> }) {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyPatron params={params} /> : <WpPatron params={params} />;
}
