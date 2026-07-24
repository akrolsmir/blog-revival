"use client";

import { useState } from "react";
import { useBounties } from "@/lib/hooks";
import { MatchSlider } from "@/components/graveyard/MatchSlider";

export function WpMatchMath() {
  const { bloggers, pledgesByBlogger, poolCents, liveThresholdCents } = useBounties();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sliderTarget = bloggers.find((b) => b.id === selectedId) ?? bloggers[0];
  if (!sliderTarget) return null;

  return (
    <section>
      <h2 className="wp-widget-title">Try the Match Math</h2>
      <label className="mt-2 block text-[12.5px] wp-meta">
        Blogger:{" "}
        <select
          value={sliderTarget.id}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-1 w-full rounded border border-wpborder bg-white px-2 py-1 text-[12.5px] text-wpink"
        >
          {bloggers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 rounded border border-wpborder bg-[#fafafa]">
        <MatchSlider
          pledgesByBlogger={pledgesByBlogger}
          poolCents={poolCents}
          liveThresholdCents={liveThresholdCents}
          bloggerId={sliderTarget.id}
          bloggerName={sliderTarget.name}
          patronCount={sliderTarget.supporterCount}
          dark={false}
        />
      </div>
    </section>
  );
}
