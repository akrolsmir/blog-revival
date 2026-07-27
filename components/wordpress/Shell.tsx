import Link from "next/link";
import { WpSidebar } from "@/components/wordpress/Sidebar";
import { WpMeta, WpMetaBar } from "@/components/wordpress/Meta";

export function WpShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wp min-h-screen">
      <div className="mx-auto max-w-[1180px] px-2 py-3 md:px-3 md:py-6">
        <header className="wp-header rounded-t-md px-5 py-7 text-center shadow-sm md:px-8 md:py-10">
          <h1 className="text-[28px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] md:text-4xl">
            <Link href="/" className="!text-white !no-underline">
              Blog Revival Project
            </Link>
          </h1>
          <p className="mt-1.5 text-sm text-blue-100 md:mt-2">bounties for the bloggers we miss</p>
        </header>
        <div className="rounded-b-md border border-t-0 border-wpborder bg-white">
          {/* phones: the Meta widget collapses to one nav strip here, and its
              column below is dropped rather than stacked above the post */}
          <WpMetaBar />
          <div className="grid gap-0 md:grid-cols-[168px_1fr_244px]">
            <div className="hidden px-5 py-8 md:block md:border-r md:border-dotted md:border-wpborder">
              <WpMeta />
            </div>
            <main className="min-w-0 px-5 py-6 md:px-8 md:py-8">{children}</main>
            <div className="border-t border-dotted border-wpborder px-5 py-6 md:border-l md:border-t-0 md:py-8">
              <WpSidebar />
            </div>
          </div>
        </div>
        <footer className="wp-meta px-4 py-6 text-center">
          <p>
            Blog Revival Project is a project of <a href="https://manifund.org">Manifund</a>, a
            501(c)(3) nonprofit. Contributions are tax-deductible.
          </p>
        </footer>
      </div>
    </div>
  );
}
