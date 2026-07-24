"use client";

import Link from "next/link";
import { GraveyardFaq } from "@/components/graveyard/Faq";

export default function GraveyardFaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-5xl">FAQ</h1>
      <div className="mt-10">
        <GraveyardFaq />
      </div>
      <Link
        href="/#blogroll"
        className="gy-caps mt-14 inline-block text-candle underline underline-offset-4"
      >
        back to the blogs
      </Link>
    </main>
  );
}
