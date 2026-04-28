import { Star } from "lucide-react";
const items = [
    {
        initial: "P",
        name: "Priya Anand",
        quote: "The insights are actually useful, not just generic tips. It helped me align my resume better with job descriptions.",
        hue: "var(--accent-primary)",
    },
    {
        initial: "K",
        name: "Kunal Mehta",
        quote: "The UI is super clean and easy to use. I liked how simple it is to upload and instantly see suggestions. No unnecessary complexity.",
        hue: "var(--accent-secondary)",
    },
    {
        initial: "D",
        name: "Divya Nair",
        quote: "The tracking feature is underrated. I can finally manage all my job applications in one place without using spreadsheets.",
        hue: "var(--accent-primary)",
    },
];
export function Testimonials() {
    return (<section className="section-pad">
      <div className="container-rq">
        <div className="text-center mb-14 max-w-xl mx-auto">
          <h2 className="font-display text-section">Real people, real outcomes</h2>
          <p className="text-muted-token mt-3">A few words from folks who've used ResumeIQ between calls.</p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2">
          {items.map((t) => (<article key={t.name} className="surface-card surface-card-hover p-7 min-w-[85%] md:min-w-0 snap-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white" style={{ background: `hsl(${t.hue})` }}>
                  {t.initial}
                </span>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-token">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" style={{ color: "hsl(var(--warning))" }}/>))}
              </div>
              <p className="text-sm text-foreground leading-relaxed">"{t.quote}"</p>
            </article>))}
        </div>
      </div>
    </section>);
}
