"use client";

import { WpFaq } from "@/components/wordpress/Faq";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function WordpressFaqPage() {
  return (
    <div className="space-y-10">
      <article>
        <h2 className="text-[26px] font-bold leading-snug">Frequently asked questions</h2>
        <p className="wp-meta mt-1">{fmtDate(new Date())}</p>
        <div className="mt-5">
          <WpFaq />
        </div>
      </article>
    </div>
  );
}
