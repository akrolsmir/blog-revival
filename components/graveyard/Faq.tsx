import { FAQ_SECTIONS, FAQ_FOOTER } from "@/lib/content";
import { linkify } from "@/components/Linkify";

const LINK = "text-candle underline underline-offset-4 hover:text-candle/80";

export function GraveyardFaq() {
  return (
    <div className="space-y-11 text-left">
      {FAQ_SECTIONS.map((sec, si) => (
        <div key={si}>
          {sec.title && <h3 className="gy-caps text-2xl text-moon">{sec.title}</h3>}
          <div className={`space-y-6 ${sec.title ? "mt-5" : ""}`}>
            {sec.items.map((it) => (
              <div key={it.q}>
                <p className="font-semibold text-moon">{it.q}</p>
                {it.a.map((p, i) => (
                  <p key={i} className="mt-2 leading-relaxed text-moon/80 [text-wrap:pretty]">
                    {linkify(p, LINK)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="italic text-mist">{linkify(FAQ_FOOTER, LINK)}</p>
    </div>
  );
}
