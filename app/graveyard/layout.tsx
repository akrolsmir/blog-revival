import type { Metadata } from "next";
import { GyNav, GyFooter } from "@/components/graveyard/Nav";

export const metadata: Metadata = {
  title: "revive.blog — The Blog Revival Project",
  description:
    "The best blogs on the internet aren't dead. They're resting. Pledge a bounty; we'll light a candle.",
};

export default function GraveyardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gy flex min-h-screen flex-col">
      <GyNav />
      <div className="flex-1">{children}</div>
      <GyFooter />
    </div>
  );
}
