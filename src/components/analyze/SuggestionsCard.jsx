const PRI = {
    HIGH: { label: "HIGH", tone: "var(--danger)" },
    MED: { label: "MED", tone: "var(--warning)" },
    LOW: { label: "LOW", tone: "var(--accent-primary)" },
};
export function SuggestionsCard({ items }) {
    return (<article className="surface-card p-7">
      <h3 className="text-cardtitle font-display mb-5">Suggestions</h3>
      <ul className="space-y-3">
        {items.map((s, i) => {
            const pri = PRI[s.priority];
            return (<li key={i} className="flex items-start gap-3 p-3 rounded-xl border border-token" style={{ background: "hsl(var(--bg))" }}>
              <span className="text-lg shrink-0" aria-hidden>
                {s.icon}
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0 mt-0.5" style={{ background: `hsl(${pri.tone} / 0.15)`, color: `hsl(${pri.tone})` }}>
                {pri.label}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
            </li>);
        })}
      </ul>
    </article>);
}
