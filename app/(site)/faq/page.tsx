"use client";

import { useSkin } from "@/lib/theme";
import GyFaq from "@/components/graveyard/pages/faq";
import WpFaq from "@/components/wordpress/pages/faq";

export default function FaqPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyFaq /> : <WpFaq />;
}
