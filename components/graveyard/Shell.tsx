import { GyNav, GyFooter } from "@/components/graveyard/Nav";

export function GyShell({
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
