"use client";

import { useSkin } from "@/lib/theme";
import GyBlogs from "@/components/graveyard/pages/blogs";
import WpBlogs from "@/components/wordpress/pages/blogs";

export default function BlogsPage() {
  const skin = useSkin();
  if (!skin) return null;
  return skin === "gy" ? <GyBlogs /> : <WpBlogs />;
}
