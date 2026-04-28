import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScoreCard } from "@/components/analyze/ScoreCard";
import { KeywordCard } from "@/components/analyze/KeywordCard";
import { SuggestionsCard } from "@/components/analyze/SuggestionsCard";
import { InterviewCard } from "@/components/analyze/InterviewCard";
export function ViewFullDrawer({ entry, onClose }) {
    return (<Sheet open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto bg-background border-token p-0">
        <div className="p-6">
          {entry && (<>
              <SheetHeader className="mb-6">
                <SheetTitle className="font-display text-cardtitle text-foreground">
                  {entry.jobTitle ?? "General Resume"}
                </SheetTitle>
                <SheetDescription className="text-muted-token">
                  Saved {new Date(entry.date).toLocaleString()} · {entry.wordCount} words
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5">
                <ScoreCard score={entry.score} sub={entry.subScores}/>
                <KeywordCard found={entry.keywordsFound} missing={entry.keywordsMissing} hasJD={entry.jobDescription.length > 0}/>
                <SuggestionsCard items={entry.suggestions}/>
                <article className="surface-card p-6">
                  <h3 className="text-cardtitle font-display mb-4">Cover Letter</h3>
                  <pre className="whitespace-pre-wrap font-sans text-[14px] leading-[1.85] text-foreground">{entry.coverLetter}</pre>
                </article>
                <InterviewCard items={entry.interviewQuestions}/>
              </div>
            </>)}
        </div>
      </SheetContent>
    </Sheet>);
}
