import { useRef, useState } from "react";
import { Loader2, Upload, FileText } from "lucide-react";
import { extractPDFText } from "@/lib/pdfParser";
function CB({ checked, onChange, children }) {
    return (<label className="inline-flex items-center gap-2 cursor-pointer text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer"/>
      <span className="h-4 w-4 rounded border border-token grid place-items-center peer-checked:gradient-bg peer-checked:border-transparent transition">
        <svg viewBox="0 0 16 16" className={`h-3 w-3 text-white ${checked ? "opacity-100" : "opacity-0"} transition-opacity`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3 3 7-7"/>
        </svg>
      </span>
      {children}
    </label>);
}
export function InputPanel({ resume, setResume, jd, setJd, options, setOptions, onAnalyze, loading }) {
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [uploadInfo, setUploadInfo] = useState({ fileName: "", error: "", hint: "" });
    const wc = resume.trim() ? resume.trim().split(/\s+/).length : 0;
    const jdWords = jd.trim() ? jd.trim().split(/\s+/).length : 0;

    const handleFile = (file) => {
        if (!file)
            return;
        if (file.size > 2 * 1024 * 1024) {
            setUploadInfo({ fileName: "", error: "File is too large. Please upload a file smaller than 2MB.", hint: "" });
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (ext === "txt" || ext === "md") {
            const reader = new FileReader();
            reader.onload = () => {
                const text = String(reader.result ?? "");
                if (!text.trim()) {
                    setUploadInfo({ fileName: "", error: "Couldn't read this file. Please paste your resume text below.", hint: "" });
                    return;
                }
                setResume(text);
                setUploadInfo({ fileName: file.name, error: "", hint: "Text loaded. You can edit it below." });
            };
            reader.onerror = () => {
                setUploadInfo({ fileName: "", error: "Failed to read file. Please paste your resume text below.", hint: "" });
            };
            reader.readAsText(file);
            return;
        }

        if (ext === "pdf") {
            try {
                setUploadInfo({ fileName: file.name, error: "", hint: "Extracting text from PDF..." });
                
                extractPDFText(file)
                    .then((text) => {
                        if (text && text.trim()) {
                            setResume(text);
                            setUploadInfo({ 
                                fileName: file.name, 
                                error: "", 
                                hint: "PDF text extracted successfully. You can edit it below." 
                            });
                        } else {
                            setUploadInfo({ 
                                fileName: file.name, 
                                error: "", 
                                hint: "Could not extract text from PDF. Please copy and paste your resume text below." 
                            });
                        }
                    })
                    .catch((err) => {
                        setUploadInfo({ 
                            fileName: file.name, 
                            error: "", 
                            hint: "Could not extract PDF text automatically. Please copy and paste your resume below." 
                        });
                    });
            } catch (err) {
                setUploadInfo({ fileName: "", error: "Could not process PDF file.", hint: "" });
            }
            return;
        }

        if (ext === "docx") {
            setUploadInfo({ fileName: file.name, error: "", hint: "DOCX files detected. Please extract the text and paste it in the resume text area below." });
            return;
        }

        setUploadInfo({ fileName: file.name, error: "Unsupported file type. Please use PDF, DOCX, TXT, or MD.", hint: "" });
    };

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    return (<section className="surface-card p-6 lg:p-8 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-surface p-3 border border-token text-muted-token shadow-sm">
            <FileText className="h-5 w-5"/>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Resume upload & paste</div>
            <p className="text-xs text-muted-token">Drop a resume file or click to upload, then paste or edit the resume text below for analysis.</p>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative cursor-pointer rounded-3xl border-2 ${dragging ? "border-accent-primary bg-[hsl(var(--accent-primary)/0.08)]" : "border-dashed border-token bg-surface"} p-8 text-center transition-all hover:border-accent-primary`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="mx-auto mb-5 h-14 w-14 rounded-3xl bg-surface grid place-items-center border border-token text-muted-token shadow-sm">
            <Upload className="h-6 w-6"/>
          </div>
          <div className="text-sm font-semibold text-foreground">Drag & drop your resume here</div>
          <div className="text-xs text-muted-token mt-2">Supports PDF, DOCX, TXT, MD. Paste extracted text below.</div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-token">
            <span className="rounded-full border border-token px-3 py-1">PDF</span>
            <span className="rounded-full border border-token px-3 py-1">DOCX</span>
            <span className="rounded-full border border-token px-3 py-1">TXT</span>
            <span className="rounded-full border border-token px-3 py-1">MD</span>
          </div>
          {uploadInfo.fileName && (<div className="mt-4 text-xs text-foreground">Selected: <span className="font-medium">{uploadInfo.fileName}</span></div>)}
        </div>

        {uploadInfo.error ? (<div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{uploadInfo.error}</div>) : uploadInfo.hint ? (<div className="rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground">{uploadInfo.hint}</div>) : null}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Resume text</label>
                <p className="text-xs text-muted-token">Paste your resume content here for analysis.</p>
              </div>
              <div className="text-xs text-muted-token">{wc} words</div>
            </div>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={10}
              className="min-h-[200px] w-full resize-none rounded-3xl border border-token bg-surface px-4 py-4 text-sm text-foreground outline-none transition focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/10"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Job description (optional)</label>
                <p className="text-xs text-muted-token">Add the role or posting to compare keywords and suggestions.</p>
              </div>
              <div className="text-xs text-muted-token">{jdWords} words</div>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description or posting here..."
              rows={6}
              className="min-h-[140px] w-full resize-none rounded-3xl border border-token bg-surface px-4 py-4 text-sm text-foreground outline-none transition focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/10"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CB checked={options.score} onChange={(value) => setOptions({ ...options, score: value })}>Score</CB>
          <CB checked={options.keywords} onChange={(value) => setOptions({ ...options, keywords: value })}>Keywords</CB>
          <CB checked={options.coverLetter} onChange={(value) => setOptions({ ...options, coverLetter: value })}>Cover letter</CB>
          <CB checked={options.interview} onChange={(value) => setOptions({ ...options, interview: value })}>Interview prep</CB>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-token">Resume text is required to run the analysis.</div>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading || !resume.trim()}
            className="
            width:100%;padding:36px;border-radius:12px;background:linear-gradient(135deg,var(--a),var(--a2));border:none;color:white;font-family:var(--font);font-size:100px;font-weight:1000;cursor:pointer;transition:all .3s;letter-spacing:-.01em" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''bg-gradient-to-r from-blue-500 to-purple-500 
               text-white font-semibold px-6 py-3 rounded-xl
               flex items-center gap-2
               transition-all duration-300
               hover:scale-105 hover:shadow-[0_8px_25px_rgba(91,156,255,0.5)] 
               active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </div>
    </section>);
}
