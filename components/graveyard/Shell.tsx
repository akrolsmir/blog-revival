import { GyNav, GyFooter } from "@/components/graveyard/Nav";

// overflow-x-clip: the scene is built from elements that deliberately run past
// their own boxes — candle glows are up to 213px wide around a 12px wick, and
// grave mounds sit 10% proud of the stone on each side. On a phone the plot
// reaches close enough to the edges that those spill past the viewport and
// give the page a horizontal scrollbar. clip (not hidden) because it doesn't
// create a scroll container, so it can't break sticky positioning.
export function GyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="gy flex min-h-screen flex-col overflow-x-clip">
      <GyNav />
      <div className="flex-1">{children}</div>
      <GyFooter />
    </div>
  );
}
