"use client";

import { useBounties } from "@/lib/hooks";
import { Headstone } from "@/components/graveyard/Headstone";

export default function GyBlogsPage() {
  const { isLoading, bloggers } = useBounties();
  return (
    <main className="px-6 pb-28 pt-16 md:px-12">
      <h1 className="text-center text-5xl">Blogs</h1>
      {isLoading ? (
        <p className="gy-caps mt-16 text-center tracking-[0.2em] text-mist">raising the dead…</p>
      ) : (
        <div className="mx-auto mt-14 grid max-w-[1160px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bloggers.map((b, i) => (
            <Headstone key={b.id} blogger={b} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
