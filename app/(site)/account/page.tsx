"use client";

import { useSkin } from "@/lib/theme";
import GyAccount from "@/components/graveyard/pages/account";
import WpAccount from "@/components/wordpress/pages/account";

export default function AccountPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyAccount /> : <WpAccount />;
}
