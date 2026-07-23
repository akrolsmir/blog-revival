"use client";

import { useSkin } from "@/lib/theme";
import GyHome from "@/components/graveyard/pages/home";
import WpHome from "@/components/wordpress/pages/home";

export default function Home() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyHome /> : <WpHome />;
}
