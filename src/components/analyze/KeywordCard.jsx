export function KeywordCard({ found, missing, hasJD }) {
    if (!hasJD) {
        return (<article className="surface-card p-7">
        <h3 className="text-cardtitle font-display mb-2">Keyword Match</h3>
        <p className="text-sm text-muted-token">
          Add a job description to see your match score and which keywords you're missing.
        </p>
      </article>);
    }
    return (<article className="surface-card p-7">
      <h3 className="text-cardtitle font-display mb-5">Keyword Match</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--success))" }}>
            Found in your resume ({found.length})
          </h4>
          {found.length === 0 ? (<p className="text-xs text-muted-token">None of the top job-description keywords appeared in your resume.</p>) : (<div className="flex flex-wrap gap-1.5">
              {found.map((k) => (<span key={k} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))" }}>
                  {k}
                </span>))}
            </div>)}
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--danger))" }}>
            Missing keywords ({missing.length})
          </h4>
          {missing.length === 0 ? (<p className="text-xs text-muted-token">Strong coverage — every top keyword from the job description appears.</p>) : (<div className="flex flex-wrap gap-1.5">
              {missing.map((k) => (<span key={k} className="text-xs px-2.5 py-1 rounded-full font-medium border border-dashed" style={{
                    borderColor: "hsl(var(--danger) / 0.5)",
                    color: "hsl(var(--danger))",
                    background: "hsl(var(--danger) / 0.06)",
                }}>
                  {k}
                </span>))}
            </div>)}
        </div>
      </div>
    </article>);
}
