import { FAQ_SECTIONS, FAQ_FOOTER } from "@/lib/content";
import { linkify } from "@/components/Linkify";

export function WpFaq() {
  return (
    <div className="space-y-8">
      {FAQ_SECTIONS.map((sec) => (
        <div key={sec.title}>
          <h3 className="text-[18px] font-bold">{sec.title}</h3>
          <div className="mt-3 space-y-4 text-[13.5px] leading-relaxed">
            {sec.items.map((it) => (
              <div key={it.q}>
                <p className="font-bold">{it.q}</p>
                {it.a.map((p, i) => (
                  <p key={i} className="mt-1">
                    {linkify(p)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[13.5px] italic">{linkify(FAQ_FOOTER)}</p>
    </div>
  );
}
