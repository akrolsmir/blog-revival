"use client";

import { useSkin } from "@/lib/theme";
import GySignin from "@/components/graveyard/pages/signin";
import WpSignin from "@/components/wordpress/pages/signin";

export default function SigninPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GySignin /> : <WpSignin />;
}
