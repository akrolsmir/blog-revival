import Link from "next/link";

// Design chooser: one backend, two frontends.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <Link
        href="/graveyard"
        className="gy group relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden p-12 transition-all duration-300 md:hover:flex-[1.15]"
      >
        <div className="gy-moon absolute right-10 top-10 h-16 w-16 rounded-full opacity-80" />
        <div className="gy-label text-mist">demo one</div>
        <h1 className="text-center text-4xl md:text-5xl">The Graveyard</h1>
        <p className="max-w-xs text-center italic text-mist">
          Here lie the best blogs on the internet. Leave a pledge; we&rsquo;ll light a candle.
        </p>
        <span className="gy-caps mt-2 border border-candle/60 px-6 py-2 text-candle transition group-hover:bg-candle/10">
          enter the graveyard
        </span>
        <div className="gy-ground absolute inset-x-0 bottom-0 h-24" />
      </Link>

      <Link
        href="/wordpress"
        className="wp group relative flex flex-1 flex-col items-center justify-center gap-6 p-12 transition-all duration-300 md:hover:flex-[1.15]"
      >
        <div className="text-[11px] uppercase tracking-widest text-wpmeta">demo two</div>
        <div className="wp-header rounded-md px-10 py-6 text-center shadow">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Blog Revival Project</h1>
          <p className="mt-1 text-sm text-blue-100">bounties for the bloggers we miss</p>
        </div>
        <span className="wp-btn">Enter the blog →</span>
      </Link>
    </main>
  );
}
