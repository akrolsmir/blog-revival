import Link from "next/link";
import { WpSidebar } from "@/components/wordpress/Sidebar";

export function WpShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wp min-h-screen">
      <div className="mx-auto max-w-[980px] px-3 py-6">
        <header className="wp-header rounded-t-md px-8 py-10 text-center shadow-sm">
          <h1 className="text-4xl font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
            <Link href="/" className="!text-white !no-underline">
              Blog Revival Project
            </Link>
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            bounties for the bloggers we miss
          </p>
        </header>
        <div className="grid gap-0 rounded-b-md border border-t-0 border-wpborder bg-white md:grid-cols-[1fr_260px]">
          <main className="min-w-0 px-6 py-8 md:border-r md:border-dotted md:border-wpborder md:px-8">
            {children}
          </main>
          <div className="px-6 py-8">
            <WpSidebar />
          </div>
        </div>
        <footer className="wp-meta px-4 py-6 text-center">
          <p>
            Blog Revival Project is a project of{" "}
            <a href="https://manifund.org">Manifund</a>, a 501(c)(3) nonprofit.
            Contributions are tax-deductible per US law.
          </p>
        </footer>
      </div>
    </div>
  );
}
