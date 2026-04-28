import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const TYPE_TONE = {
    Behavioral: "var(--accent-primary)",
    Technical: "var(--accent-secondary)",
    Situational: "var(--warning)",
};
export function InterviewCard({ items }) {
    return (<article className="surface-card p-7">
      <h3 className="text-cardtitle font-display mb-5">Interview Prep</h3>
      <Accordion type="single" collapsible className="w-full">
        {items.map((it, i) => (<AccordionItem key={i} value={`q-${i}`} className="border-token">
            <AccordionTrigger className="text-left hover:no-underline gap-3">
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0" style={{
                background: `hsl(${TYPE_TONE[it.type]} / 0.15)`,
                color: `hsl(${TYPE_TONE[it.type]})`,
            }}>
                  {it.type.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-foreground">{it.q}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-token leading-relaxed pl-1">{it.a}</p>
            </AccordionContent>
          </AccordionItem>))}
      </Accordion>
    </article>);
}
