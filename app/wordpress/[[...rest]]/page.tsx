"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

// Legacy skin URL: force the WordPress (light) theme, then land on the same
// page in the unified tree (/wordpress/b/foo → /b/foo).
export default function ForceWordpress() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { rest } = useParams<{ rest?: string[] }>();

  useEffect(() => {
    setTheme("light");
    router.replace(rest?.length ? `/${rest.join("/")}` : "/");
  }, [setTheme, router, rest]);

  return null;
}
