import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Edit3 } from "lucide-react";
import { useToast } from "@/lib/toast";
export function CoverLetterCard({ initial }) {
    const ref = useRef(null);
    const [text, setText] = useState(initial);
    const [copied, setCopied] = useState(false);
    const { success } = useToast();
    useEffect(() => {
        setText(initial);
        if (ref.current)
            ref.current.innerText = initial;
    }, [initial]);
    const onCopy = async () => {
        const current = ref.current?.innerText ?? text;
        try {
            await navigator.clipboard.writeText(current);
            setCopied(true);
            success("Cover letter copied to clipboard");
            window.setTimeout(() => setCopied(false), 1800);
        }
        catch {
            /* ignore */
        }
    };
    const onPrint = () => {
        const card = document.getElementById("cover-letter-print");
        if (!card)
            return;
        card.setAttribute("data-print-target", "");
        window.print();
        window.setTimeout(() => card.removeAttribute("data-print-target"), 100);
    };
    return (<article id="cover-letter-print" className="surface-card p-7 relative" style={{
            background: "linear-gradient(180deg, hsl(var(--surface)) 0%, hsl(var(--accent-primary) / 0.04) 100%)",
            borderTop: "3px solid hsl(var(--accent-primary))",
        }}>
      <div className="flex items-center justify-between mb-5" data-print-hide>
        <div>
          <h3 className="text-cardtitle font-display">Cover Letter</h3>
          <p className="text-xs text-muted-token mt-1 inline-flex items-center gap-1">
            <Edit3 className="h-3 w-3"/> Click anywhere in the letter to edit it before copying
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCopy} className="btn-ghost-token inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium">
            {copied ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={onPrint} className="btn-ghost-token inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium">
            <Download className="h-3.5 w-3.5"/> PDF
          </button>
        </div>
      </div>

      <div ref={ref} contentEditable suppressContentEditableWarning spellCheck onInput={(e) => setText(e.currentTarget.innerText)} className="whitespace-pre-wrap text-[15px] leading-[1.85] text-foreground rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary)/0.4)] transition" style={{ minHeight: 200 }}>
        {initial}
      </div>
    </article>);
}
