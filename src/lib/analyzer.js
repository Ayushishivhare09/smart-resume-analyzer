// ResumeIQ analyzer — pure, domain-aware, JD-driven. Zero external calls.
// Public surface preserved for existing UI:
//   analyze(resumeText, jobDescription) -> AnalysisResult
//   detectJobTitle(resumeText, jd)      -> string | null
//   scoreLabel(score)                   -> { label, tone }
//   types: AnalysisResult, SubScores, Suggestion, InterviewQ
/* ============================================================
 * STEP 1 — Domain detection from JD
 * ============================================================ */
const DOMAIN_SEEDS = {
    frontend: ["react", "vue", "angular", "html", "css", "javascript", "typescript", "tailwind", "webpack", "vite", "dom", "responsive", "ui"],
    backend: ["node", "express", "django", "spring", "laravel", "fastapi", "postgresql", "mysql", "mongodb", "redis", "rest", "graphql", "microservices", "server"],
    devops: ["docker", "kubernetes", "ci/cd", "jenkins", "terraform", "ansible", "aws", "gcp", "azure", "linux", "bash", "pipeline", "nginx", "monitoring"],
    data: ["python", "r", "sql", "tableau", "powerbi", "machine learning", "pandas", "numpy", "statistics", "data analysis", "modeling", "etl"],
    design: ["figma", "sketch", "ux", "ui", "wireframe", "prototype", "user research", "usability", "adobe", "design system", "accessibility"],
    marketing: ["seo", "sem", "google analytics", "campaign", "content", "social media", "email marketing", "crm", "conversion", "brand", "growth"],
    finance: ["financial modeling", "excel", "forecasting", "budgeting", "accounting", "audit", "gaap", "valuation", "risk", "investment"],
    hr: ["recruitment", "onboarding", "hris", "payroll", "talent acquisition", "performance management", "employee relations"],
    sales: ["pipeline", "quota", "crm", "salesforce", "b2b", "prospecting", "negotiation", "closing", "account management", "lead generation"],
    healthcare: ["patient care", "clinical", "ehr", "nursing", "hipaa", "diagnosis", "therapy", "medication", "medical"],
    legal: ["litigation", "contract", "compliance", "regulatory", "counsel", "brief", "legal research", "statute", "drafting"],
};
const DOMAIN_LABELS = {
    frontend: "Frontend",
    backend: "Backend",
    fullstack: "Full-Stack",
    devops: "DevOps",
    data: "Data",
    design: "Design",
    marketing: "Marketing",
    finance: "Finance",
    hr: "HR",
    sales: "Sales",
    healthcare: "Healthcare",
    legal: "Legal",
    general: "General",
};
function countSeedHits(jdLower, seeds) {
    let n = 0;
    for (const s of seeds) {
        // Use a permissive substring check so multi-word seeds work too.
        if (jdLower.includes(s))
            n++;
    }
    return n;
}
function detectDomain(jd) {
    if (!jd || !jd.trim())
        return "general";
    const lower = jd.toLowerCase();
    const scores = {};
    for (const [dom, seeds] of Object.entries(DOMAIN_SEEDS)) {
        scores[dom] = countSeedHits(lower, seeds);
    }
    const fe = scores.frontend ?? 0;
    const be = scores.backend ?? 0;
    if (fe >= 2 && be >= 2)
        return "fullstack";
    let best = { dom: "general", n: 0 };
    for (const [dom, n] of Object.entries(scores)) {
        if (n > best.n)
            best = { dom: dom, n };
    }
    // Need at least 2 confident hits to label
    return best.n >= 2 ? best.dom : "general";
}
/* ============================================================
 * STEP 2 — Smart keyword extraction from JD
 * ============================================================ */
const FILLER = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from",
    "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "will", "would",
    "could", "should", "may", "might", "we", "you", "they", "our", "your", "their", "this", "that",
    "these", "those", "it", "its",
    "knowledge", "understanding", "familiarity", "experience", "ability", "skills", "basic",
    "strong", "good", "excellent", "great", "solid", "proficient", "preferred", "required",
    "must", "plus", "working", "including", "ensuring", "helping", "supporting", "managing",
    "leading", "using", "candidate", "opportunity", "position", "role", "responsibilities",
    "duties", "requirements", "looking", "seeking", "ideal", "background", "environment",
    "team", "company", "business", "communication", "written", "verbal", "motivated",
    "passionate", "detail", "oriented", "driven", "problem", "solving", "thinking",
    "collaborative", "fast", "new", "various", "related", "relevant", "years", "year", "time",
    "level", "full", "part", "senior", "junior", "mid", "other", "also", "well",
    // tiny extras that slip through
    "etc", "across", "within", "into", "over", "under", "about", "through", "while", "than", "then", "so", "such", "no", "not", "any", "all", "some", "more", "most", "very", "just", "only", "own", "who", "what", "when", "where", "why", "how", "which",
]);
const SIGNAL_PHRASES = [
    "experience with", "experience in", "knowledge of", "proficiency in", "skilled in",
    "expertise in", "background in", "familiarity with", "working with", "hands-on with", "hands on with", "exposure to",
];
const JD_GENERIC_WORDS = new Set([
    "experience", "qualifications", "qualification", "exposure", "working", "requirements", "requirement",
    "responsibilities", "responsibility", "role", "team", "strong", "solid", "basic", "good", "excellent",
    "preferred", "required", "must", "should", "ability", "knowledge", "understanding", "familiarity",
    "candidate", "company", "business", "communication", "collaboration", "passionate", "motivated",
    "years", "year", "work", "build", "building", "develop", "development", "create", "creating",
    "engineer", "developer", "frontend", "front-end", "ui", "ux",
]);
const TECH_KEYWORD_CATALOG = [
    "React.js", "React", "Next.js", "Three.js", "WebGL", "CAD", "Arduino", "ESP32", "TypeScript",
    "JavaScript", "Tailwind CSS", "Tailwind", "REST API", "REST APIs", "state management", "Vite",
    "Redux", "Zustand", "HTML", "CSS", "SCSS", "Sass", "Node.js", "Express", "GraphQL", "API",
    "Git", "GitHub", "Webpack", "Babel", "Jest", "Vitest", "React Testing Library", "Cypress",
    "Playwright", "Figma", "UI/UX", "responsive design", "accessibility", "WCAG", "DOM", "Canvas",
    "D3.js", "Chart.js", "Material UI", "MUI", "Bootstrap", "Framer Motion", "Firebase",
    "Supabase", "MongoDB", "PostgreSQL", "SQL", "NoSQL", "AWS", "Azure", "GCP", "Docker",
    "Kubernetes", "CI/CD", "Agile", "Scrum", "Jira", "OAuth", "JWT", "WebSockets", "PWA",
    "performance optimization", "SEO", "micro-frontends", "design system", "component library",
];
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#./\-\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}
function normalizeText(text) {
    return String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .replace(/[\u00A0\u2028\u2029\t]/g, " ")
        .replace(/[^\S\n]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
function isFillerWord(w) {
    if (!w)
        return true;
    if (FILLER.has(w))
        return true;
    if (/^\d+$/.test(w))
        return true;
    if (w.length < 2)
        return true;
    return false;
}
function prettify(raw) {
    let w = raw.trim().replace(/^[,.;:!?]+|[,.;:!?]+$/g, "");
    if (!w)
        return w;
    w = w.replace(/\b([A-Za-z0-9+#./-]+)(?:\s+\1\b)+/gi, "$1");
    const known = {
        react: "React.js", "react js": "React.js", "react native": "React Native",
        typescript: "TypeScript", javascript: "JavaScript",
        nodejs: "Node.js", "node.js": "Node.js", node: "Node.js",
        graphql: "GraphQL", aws: "AWS", gcp: "GCP", azure: "Azure",
        docker: "Docker", kubernetes: "Kubernetes", k8s: "Kubernetes",
        css: "CSS", html: "HTML", sql: "SQL", nosql: "NoSQL", api: "API",
        rest: "REST", "rest api": "REST API", "rest apis": "REST APIs", git: "Git", "ci/cd": "CI/CD",
        figma: "Figma", python: "Python", java: "Java", go: "Go", rust: "Rust",
        nextjs: "Next.js", "next.js": "Next.js", "next js": "Next.js", vue: "Vue", angular: "Angular",
        tailwind: "Tailwind CSS", "tailwind css": "Tailwind CSS", postgres: "PostgreSQL", postgresql: "PostgreSQL",
        mongodb: "MongoDB", redis: "Redis", saas: "SaaS", agile: "Agile",
        scrum: "Scrum", jira: "Jira", seo: "SEO", sem: "SEM", crm: "CRM",
        erp: "ERP", hipaa: "HIPAA", gaap: "GAAP", kpi: "KPI", etl: "ETL",
        salesforce: "Salesforce", hubspot: "HubSpot", tableau: "Tableau",
        powerbi: "Power BI", "power bi": "Power BI", terraform: "Terraform",
        jenkins: "Jenkins", ansible: "Ansible", nginx: "NGINX", linux: "Linux",
        bash: "Bash", express: "Express", django: "Django", spring: "Spring",
        laravel: "Laravel", fastapi: "FastAPI", mysql: "MySQL",
    };
    const lower = w.toLowerCase();
    if (known[lower])
        return known[lower];
    // ALL-CAPS acronym preserved
    if (/^[A-Z]{2,6}$/.test(w))
        return w;
    // Hyphenated compound -> capitalize each part
    if (w.includes("-")) {
        return w.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("-");
    }
    // Multi-word phrase
    if (w.includes(" ")) {
        return w.split(/\s+/).map((p) => (known[p.toLowerCase()] ? known[p.toLowerCase()] : p.charAt(0).toUpperCase() + p.slice(1))).join(" ");
    }
    return w.charAt(0).toUpperCase() + w.slice(1);
}
function bumpHit(map, raw, scoreInc) {
    const display = prettify(raw);
    const key = display.toLowerCase();
    if (!key)
        return;
    if (isFillerWord(key))
        return;
    const existing = map.get(key);
    if (existing) {
        existing.score += scoreInc;
    }
    else {
        map.set(key, { display, key, score: scoreInc });
    }
}
function extractKeywords(jd, domain) {
    const map = new Map();
    if (!jd.trim())
        return [];
    const lower = jd.toLowerCase();
    // Signal A — frequency on cleaned tokens
    const toks = tokenize(jd);
    const freq = new Map();
    for (const t of toks) {
        if (isFillerWord(t))
            continue;
        freq.set(t, (freq.get(t) ?? 0) + 1);
    }
    for (const [t, n] of freq.entries()) {
        if (n >= 2)
            bumpHit(map, t, 3 + n);
    }
    // Signal B — words after signal phrases (capture next 1-3 word phrase)
    for (const phrase of SIGNAL_PHRASES) {
        const re = new RegExp(`${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+([a-zA-Z][a-zA-Z0-9+#./\\-]*(?:\\s+[a-zA-Z][a-zA-Z0-9+#./\\-]*){0,2})`, "gi");
        let m;
        while ((m = re.exec(jd)) !== null) {
            const phraseRaw = m[1].trim().replace(/[,.;:!?]+$/g, "");
            // Take 1- and 2-word forms
            const parts = phraseRaw.split(/\s+/).filter(Boolean);
            if (parts.length >= 1 && !isFillerWord(parts[0].toLowerCase()))
                bumpHit(map, parts[0], 5);
            if (parts.length >= 2 && !isFillerWord(parts[0].toLowerCase()) && !isFillerWord(parts[1].toLowerCase())) {
                bumpHit(map, `${parts[0]} ${parts[1]}`, 6);
            }
        }
    }
    // Signal C — capitalized mid-sentence proper nouns
    // Split into sentences, skip the first capitalized token of each sentence.
    const sentences = jd.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
        const words = s.split(/\s+/);
        for (let i = 1; i < words.length; i++) {
            const w = words[i].replace(/[^A-Za-z0-9+#./\-]/g, "");
            if (!w)
                continue;
            if (/^[A-Z][a-zA-Z0-9+#./\-]*[a-z][a-zA-Z0-9+#./\-]*$/.test(w) && w.length >= 3) {
                if (!isFillerWord(w.toLowerCase()))
                    bumpHit(map, w, 4);
            }
        }
    }
    // Signal D — ALL-CAPS acronyms 2-6 chars (allow / e.g. CI/CD)
    const acroRe = /\b([A-Z]{2,6}(?:\/[A-Z]{2,6})?)\b/g;
    let am;
    while ((am = acroRe.exec(jd)) !== null) {
        bumpHit(map, am[1], 5);
    }
    // Signal E — hyphenated compound terms
    const hypRe = /\b([a-zA-Z]{2,}(?:-[a-zA-Z]{2,}){1,3})\b/g;
    let hm;
    while ((hm = hypRe.exec(jd)) !== null) {
        const raw = hm[1];
        // Skip if all parts are filler
        const parts = raw.toLowerCase().split("-");
        if (parts.every((p) => isFillerWord(p)))
            continue;
        bumpHit(map, raw, 4);
    }
    // Signal F — domain seed words present in JD are auto-keywords
    if (domain !== "general") {
        const seeds = DOMAIN_SEEDS[domain] ?? [];
        for (const seed of seeds) {
            if (lower.includes(seed))
                bumpHit(map, seed, 6);
        }
    }
    // Bigrams — 2-word phrases of non-filler words appearing 2+ times
    const bigramFreq = new Map();
    for (let i = 0; i < toks.length - 1; i++) {
        const a = toks[i], b = toks[i + 1];
        if (isFillerWord(a) || isFillerWord(b))
            continue;
        if (a.length < 3 || b.length < 3)
            continue;
        const key = `${a} ${b}`;
        bigramFreq.set(key, (bigramFreq.get(key) ?? 0) + 1);
    }
    for (const [bg, n] of bigramFreq.entries()) {
        if (n >= 2)
            bumpHit(map, bg, 5 + n);
    }
    // Final filler sweep & sort by score
    const out = [...map.values()].filter((h) => !isFillerWord(h.key));
    out.sort((a, b) => b.score - a.score);
    return out;
}
function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function termRegex(term) {
    const escaped = escapeRegExp(term).replace(/\\\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z0-9+#./-])${escaped}(?=$|[^a-z0-9+#./-])`, "i");
}
function hasTerm(text, term) {
    return termRegex(term.toLowerCase()).test(text.toLowerCase());
}
function isGenericJDKeyword(raw) {
    const cleaned = String(raw ?? "").toLowerCase().replace(/[^a-z0-9+#./\-\s]/g, " ").replace(/\s+/g, " ").trim();
    if (!cleaned)
        return true;
    if (JD_GENERIC_WORDS.has(cleaned) || FILLER.has(cleaned))
        return true;
    const parts = cleaned.split(/\s+/);
    return parts.every((p) => JD_GENERIC_WORDS.has(p) || FILLER.has(p));
}
function addStrictKeyword(map, raw, score = 1) {
    if (isGenericJDKeyword(raw))
        return;
    const normalized = normalizeKeyword(raw);
    if (!normalized || isGenericJDKeyword(normalized.canonical))
        return;
    const key = normalized.key;
    const existing = map.get(key);
    if (existing) {
        existing.score += score;
    }
    else {
        map.set(key, {
            display: normalized.canonical,
            canonical: normalized.canonical,
            key,
            score,
            category: keywordCategory(normalized.canonical),
        });
    }
}
function extractStrictTechKeywords(jd, domain) {
    const map = new Map();
    if (!jd.trim())
        return [];
    for (const term of TECH_KEYWORD_CATALOG) {
        if (hasTerm(jd, term))
            addStrictKeyword(map, term, 10);
    }
    const explicitTechRe = /\b([A-Za-z][A-Za-z0-9.+#-]*(?:\.js|JS|CSS|SQL|API|APIs|CAD|WebGL|WebGL2|UI\/UX)|[A-Z]{2,6}(?:\/[A-Z]{2,6})?|C\+\+|C#)\b/g;
    let match;
    while ((match = explicitTechRe.exec(jd)) !== null) {
        addStrictKeyword(map, match[1], 7);
    }
    const phraseRe = /\b([A-Za-z0-9.+#-]+\s+(?:API|APIs|CSS|JS|SQL|CAD|framework|frameworks|library|libraries|testing|management|optimization|design|system|components?|architecture))\b/gi;
    while ((match = phraseRe.exec(jd)) !== null) {
        const phrase = match[1].replace(/\b(and|or|with|using|for)$/i, "").trim();
        addStrictKeyword(map, phrase, 6);
    }
    const extracted = normalizeKeywordHits(extractKeywords(jd, domain));
    for (const hit of extracted) {
        const lower = hit.display.toLowerCase();
        const inCatalog = TECH_KEYWORD_CATALOG.some((term) => term.toLowerCase() === lower || term.toLowerCase().includes(lower) || lower.includes(term.toLowerCase()));
        const techShape = /\.js|\b(api|apis|css|html|sql|nosql|ui|ux|cad|webgl|arduino|esp32|typescript|javascript|react|next|three|vite|tailwind|redux|zustand|figma|git|docker|aws|azure|gcp|testing|state management|design system|component library|accessibility|responsive)\b/i.test(hit.display);
        if (inCatalog || techShape)
            addStrictKeyword(map, hit.display, hit.score ?? 4);
    }
    if (domain !== "general") {
        for (const seed of DOMAIN_SEEDS[domain] ?? []) {
            if (!isGenericJDKeyword(seed) && hasTerm(jd, seed))
                addStrictKeyword(map, seed, 5);
        }
    }
    return [...map.values()].sort((a, b) => b.score - a.score || a.display.localeCompare(b.display));
}
/* ============================================================
 * STEP 3 — Smart matching
 * ============================================================ */
const ALIASES = {
    js: "javascript", ts: "typescript", py: "python",
    k8s: "kubernetes", k8: "kubernetes",
    ml: "machine learning", ai: "artificial intelligence",
    db: "database", ui: "user interface", ux: "user experience",
    fe: "frontend", be: "backend", fs: "fullstack",
    aws: "amazon web services", gcp: "google cloud",
    ci: "continuous integration", cd: "continuous deployment",
    qa: "quality assurance", seo: "search engine optimization",
    crm: "customer relationship management", erp: "enterprise resource planning",
    api: "application programming interface", rest: "representational state transfer",
    sql: "structured query language", nosql: "non relational database",
    oop: "object oriented programming", tdd: "test driven development",
};
function buildResumeIndex(resume) {
    const lower = resume.toLowerCase();
    // Keep dots/hyphens to allow "node.js" / "next.js" partials.
    const cleaned = lower.replace(/[^a-z0-9+#./\-\s]/g, " ");
    const words = new Set();
    for (const w of cleaned.split(/\s+/).filter(Boolean)) {
        words.add(w);
        // singular variant
        if (w.endsWith("s") && w.length > 3)
            words.add(w.slice(0, -1));
    }
    return { raw: lower, words, phrases: cleaned };
}
function matchKeyword(kw, idx) {
    const k = kw.toLowerCase().trim();
    if (!k)
        return false;
    // Multi-word phrase → substring on cleaned text
    if (/\s/.test(k)) {
        if (idx.phrases.includes(k))
            return true;
        // alias expansion
        const expanded = k.split(/\s+/).map((p) => ALIASES[p] ?? p).join(" ");
        if (expanded !== k && idx.phrases.includes(expanded))
            return true;
        return false;
    }
    // Direct
    if (idx.words.has(k))
        return true;
    // Singular/plural
    if (k.endsWith("s") && idx.words.has(k.slice(0, -1)))
        return true;
    if (idx.words.has(k + "s"))
        return true;
    // Aliases (both directions)
    const aliasTarget = ALIASES[k];
    if (aliasTarget) {
        if (idx.phrases.includes(aliasTarget))
            return true;
        if (idx.words.has(aliasTarget))
            return true;
    }
    for (const [short, full] of Object.entries(ALIASES)) {
        if (full === k && idx.words.has(short))
            return true;
    }
    // Compound .js style — strip suffix
    if (k.endsWith(".js")) {
        const base = k.slice(0, -3);
        if (idx.words.has(base) || idx.phrases.includes(base))
            return true;
    }
    // Resume might contain the .js variant
    if (idx.phrases.includes(`${k}.js`))
        return true;
    // Substring fallback for hyphenated / dotted tokens
    if ((k.includes("-") || k.includes(".") || k.includes("/")) && idx.phrases.includes(k))
        return true;
    return false;
}

const KEYWORD_ALIAS_TO_CANONICAL = {
    react: "React.js",
    "react.js": "React.js",
    reactjs: "React.js",
    js: "JavaScript",
    javascript: "JavaScript",
    "java script": "JavaScript",
    rest: "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    restful: "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    node: "Node.js",
    nodejs: "Node.js",
    "node.js": "Node.js",
    ts: "TypeScript",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    api: "REST APIs",
    apis: "REST APIs",
    "soft skills": "Soft Skills",
};

const KEYWORD_CATEGORY_SEEDS = {
    Frontend: ["react", "javascript", "typescript", "html", "css", "frontend", "ui", "ux", "next.js", "vue", "angular", "tailwind"],
    Backend: ["node", "express", "django", "spring", "laravel", "fastapi", "backend", "api", "graphql", "rest", "microservices", "sql", "database"],
    Tools: ["git", "docker", "kubernetes", "aws", "gcp", "azure", "jenkins", "terraform", "jira", "figma", "tableau", "power bi"],
    "Soft Skills": ["communication", "collaboration", "leadership", "teamwork", "stakeholder", "ownership", "problem solving", "mentoring"],
};

const CANONICAL_TO_ALIASES = Object.entries(KEYWORD_ALIAS_TO_CANONICAL).reduce((acc, [alias, canonical]) => {
    if (!acc[canonical])
        acc[canonical] = [];
    acc[canonical].push(alias);
    return acc;
}, {});

function normalizeKeyword(raw) {
    const cleaned = String(raw ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9+#./\-\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!cleaned)
        return null;
    const deduped = cleaned
        .split(" ")
        .filter((token, idx, arr) => idx === 0 || token !== arr[idx - 1])
        .join(" ");
    const canonical = KEYWORD_ALIAS_TO_CANONICAL[deduped] ?? prettify(deduped);
    return {
        canonical,
        key: canonical.toLowerCase(),
    };
}

function keywordCategory(canonical) {
    const k = canonical.toLowerCase();
    for (const [cat, seeds] of Object.entries(KEYWORD_CATEGORY_SEEDS)) {
        if (seeds.some((s) => k.includes(s)))
            return cat;
    }
    return "Tools";
}

function keywordVariants(canonical) {
    const base = canonical.toLowerCase();
    const variants = new Set([base]);
    variants.add(base.replace(/\.js/g, ""));
    variants.add(base.replace(/apis/g, "api"));
    variants.add(base.replace(/\s+/g, ""));
    (CANONICAL_TO_ALIASES[canonical] ?? []).forEach((a) => {
        variants.add(a);
        variants.add(a.replace(/\s+/g, ""));
    });
    return [...variants].filter(Boolean);
}

function normalizeKeywordHits(extracted) {
    const deduped = new Map();
    for (const hit of extracted) {
        const norm = normalizeKeyword(hit.display ?? hit.key);
        if (!norm)
            continue;
        const existing = deduped.get(norm.key);
        if (existing) {
            existing.score += hit.score ?? 1;
        }
        else {
            deduped.set(norm.key, {
                display: norm.canonical,
                canonical: norm.canonical,
                key: norm.key,
                score: hit.score ?? 1,
                category: keywordCategory(norm.canonical),
            });
        }
    }
    return [...deduped.values()].sort((a, b) => b.score - a.score);
}

function matchCanonicalKeyword(canonical, idx) {
    for (const v of keywordVariants(canonical)) {
        if (matchKeyword(v, idx))
            return true;
        if (idx.phrases.includes(v))
            return true;
    }
    return false;
}

function groupKeywordsByCategory(allKeywords, foundSet) {
    const out = {
        Frontend: { found: [], missing: [] },
        Backend: { found: [], missing: [] },
        Tools: { found: [], missing: [] },
        "Soft Skills": { found: [], missing: [] },
    };
    for (const kw of allKeywords) {
        const cat = kw.category in out ? kw.category : "Tools";
        if (foundSet.has(kw.key))
            out[cat].found.push(kw.display);
        else
            out[cat].missing.push(kw.display);
    }
    return out;
}

const VAGUE_PATTERNS = [
    /\bresponsible for\b/i,
    /\bhelped (with|to)\b/i,
    /\bworked on\b/i,
    /\bassisted (with|in)\b/i,
    /\binvolved in\b/i,
    /\btasked with\b/i,
    /\bparticipated in\b/i,
];

function detectBulletStats(resume) {
    const lines = resume.split(/\r?\n/);
    const bulletRe = /^\s*([\-•*–])\s+(.+)/;
    const roleHintRe = /\b(engineer|developer|manager|analyst|intern|designer|consultant|specialist|lead|director)\b/i;
    const sectionLikeRe = /\b(experience|education|skills|projects|summary|objective|profile|certifications?)\b/i;
    let currentRole = "General";
    const perRole = new Map();
    const markers = new Set();
    let totalBullets = 0;
    for (const raw of lines) {
        const line = raw.trim();
        if (!line)
            continue;
        const bulletMatch = line.match(bulletRe);
        if (bulletMatch) {
            totalBullets++;
            markers.add(bulletMatch[1]);
            perRole.set(currentRole, (perRole.get(currentRole) ?? 0) + 1);
            continue;
        }
        const looksLikeRole = /(19|20)\d{2}/.test(line) && line.length <= 110;
        const titleLikeRole = roleHintRe.test(line) && !sectionLikeRe.test(line) && line.length <= 90;
        if (looksLikeRole || titleLikeRole) {
            currentRole = line.slice(0, 90);
            if (!perRole.has(currentRole))
                perRole.set(currentRole, 0);
        }
    }
    const perRoleList = [...perRole.entries()]
        .filter(([, n]) => n > 0)
        .map(([role, bullets]) => ({ role, bullets }));
    const roleCount = perRoleList.length;
    const avgBulletsPerRole = roleCount > 0 ? +(totalBullets / roleCount).toFixed(1) : 0;
    const rolesWithFewBullets = perRoleList.filter((r) => r.bullets < 2).length;
    return {
        totalBullets,
        roleCount,
        avgBulletsPerRole,
        rolesWithFewBullets,
        perRole: perRoleList,
        bulletMarkerCount: markers.size,
        dominantMarker: markers.values().next().value ?? "-",
        hasConsistentBullets: markers.size <= 1,
    };
}

function detectMetricSignals(resume) {
    const lines = resume.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const metricRe = /(\d+%|[$£€]\s?\d[\d,]*|\b\d+x\b|\b\d[\d,]*\+?\s+(users?|customers?|clients?|projects?|months?|weeks?|years?|tickets?|bugs?|sales|revenue|leads?|accounts?)\b)/i;
    const metricLines = lines.filter((l) => metricRe.test(l));
    return {
        count: metricLines.length,
        lines: metricLines.slice(0, 4),
    };
}

function detectVagueStatements(resume) {
    const lines = resume.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const hits = lines.filter((line) => VAGUE_PATTERNS.some((re) => re.test(line)));
    return {
        count: hits.length,
        lines: hits.slice(0, 4),
    };
}

function analyzeFormattingDetailed(resume, wordCount, sectionInfo, bulletStats) {
    const checks = [];
    let score = 0;
    const lines = resume.split(/\r?\n/);
    const yearCount = (resume.match(/\b(19|20)\d{2}\b/g) || []).length;

    const sectionPass = sectionInfo.points >= 12;
    checks.push({
        key: "sections",
        label: "Section headings",
        passed: sectionPass,
        reason: sectionPass
            ? "Clear core sections detected (Experience, Skills, Education, etc)."
            : "Missing core section headings like Skills/Projects/Experience.",
    });
    score += sectionPass ? 5 : 1;

    const bulletPass = bulletStats.totalBullets >= 4;
    const bulletConsistencyPass = bulletStats.hasConsistentBullets;
    checks.push({
        key: "bullets",
        label: "Bullet consistency",
        passed: bulletPass && bulletConsistencyPass,
        reason: bulletPass
            ? (bulletConsistencyPass
                ? `Consistent bullet style used across ${bulletStats.totalBullets} bullets.`
                : "Multiple bullet styles found. Use one symbol consistently.")
            : "Too few bullet points. Add concise bullet-based achievements under each role.",
    });
    score += bulletPass && bulletConsistencyPass ? 5 : bulletPass ? 3 : 1;

    let run = 0;
    let runMax = 0;
    for (const line of lines) {
        if (line.trim())
            run++;
        else {
            runMax = Math.max(runMax, run);
            run = 0;
        }
    }
    runMax = Math.max(runMax, run);
    const spacingPass = runMax <= 8;
    checks.push({
        key: "spacing",
        label: "Spacing and readability",
        passed: spacingPass,
        reason: spacingPass
            ? "Good spacing between sections and bullets."
            : "Large text blocks detected. Break long paragraphs into bullets.",
    });
    score += spacingPass ? 5 : 2;

    const lengthPass = wordCount >= 320 && wordCount <= 780;
    checks.push({
        key: "length",
        label: "Length balance",
        passed: lengthPass,
        reason: lengthPass
            ? `${wordCount} words is within ATS-friendly range.`
            : `${wordCount} words is outside ideal range (320-780 words).`,
    });
    score += lengthPass ? 3 : 1;

    const datePass = yearCount >= 2;
    checks.push({
        key: "dates",
        label: "Timeline clarity",
        passed: datePass,
        reason: datePass
            ? "Role timeline appears clear with date markers."
            : "Add date ranges per role so recruiters can read chronology quickly.",
    });
    score += datePass ? 2 : 0;

    const strengths = checks.filter((c) => c.passed).map((c) => c.reason);
    const issues = checks.filter((c) => !c.passed).map((c) => c.reason);

    return {
        score: Math.min(20, score),
        checks,
        strengths,
        issues,
    };
}

function estimateExperienceYears(resume) {
    const now = new Date().getFullYear();
    const ranges = [...resume.matchAll(/\b((?:19|20)\d{2})\s*(?:-|–|to)\s*((?:19|20)\d{2}|present|current)\b/gi)];
    if (ranges.length > 0) {
        const starts = [];
        const ends = [];
        for (const m of ranges) {
            const s = Number(m[1]);
            const eRaw = String(m[2]).toLowerCase();
            const e = eRaw === "present" || eRaw === "current" ? now : Number(eRaw);
            if (Number.isFinite(s) && Number.isFinite(e)) {
                starts.push(s);
                ends.push(e);
            }
        }
        if (starts.length) {
            const span = Math.max(...ends) - Math.min(...starts);
            if (span >= 0 && span <= 45)
                return span;
        }
    }
    const years = (resume.match(/\b(19|20)\d{2}\b/g) || []).map((y) => Number(y));
    if (years.length >= 2) {
        const span = Math.max(...years) - Math.min(...years);
        if (span >= 0 && span <= 45)
            return span;
    }
    return null;
}

function detectExperienceLevel(resume, yearsEstimate) {
    const lower = resume.toLowerCase();
    const fresherSignals = /(fresher|entry level|student|graduate|internship|intern)/.test(lower);
    if (yearsEstimate !== null)
        return yearsEstimate >= 3 ? "experienced" : "fresher";
    return fresherSignals ? "fresher" : "experienced";
}

function classifyStrengthLevel(score, keywordMatchPercent, experienceLevel, hasJD) {
    if (score >= 82 && (!hasJD || keywordMatchPercent >= 60) && (experienceLevel === "experienced" || score >= 88)) {
        return { label: "Interview-ready", tone: "success", message: "Strong ATS alignment and recruiter-readable execution." };
    }
    if (score >= 68) {
        return { label: "Strong", tone: "success", message: "Competitive profile with a few strategic improvements left." };
    }
    if (score >= 50) {
        return { label: "متوسط", tone: "warning", message: "Decent base, but key ATS and impact signals are still missing." };
    }
    return { label: "Beginner", tone: "danger", message: "Early-stage resume quality. Prioritize structure, metrics, and keyword alignment." };
}

function buildRewriteExamples(vagueLines, domainLabel) {
    const examples = [
        {
            bad: "Built a website",
            good: "Built a responsive React app improving load time by 30% and increasing sign-up conversion by 18%.",
            reason: "Adds technology + measurable business impact.",
        },
    ];
    for (const line of vagueLines.slice(0, 2)) {
        const clean = line.replace(/^[-•*–]\s*/, "").trim();
        const refined = clean
            .replace(/\bresponsible for\b/i, "Led")
            .replace(/\bhelped with\b/i, "Executed")
            .replace(/\bworked on\b/i, "Built")
            .replace(/\bassisted with\b/i, "Supported")
            .replace(/\binvolved in\b/i, "Delivered");
        examples.push({
            bad: clean,
            good: `${refined} for a ${domainLabel.toLowerCase()} initiative, resulting in a measurable improvement (e.g., +25% efficiency, -30% response time).`,
            reason: "Converts vague task language into outcome-focused achievement language.",
        });
    }
    return examples.slice(0, 3);
}

function buildInsightSections(ctx) {
    const didWell = [];
    const hurting = [];
    const quickFixes = [];
    const highEffortImprovements = [];

    if (ctx.keywordMatchPercent >= 60)
        didWell.push(`Good JD alignment: ${ctx.keywordMatchPercent}% keyword match.`);
    if (ctx.metricSignals.count >= 3)
        didWell.push(`Strong quantified impact with ${ctx.metricSignals.count} metric-backed bullets.`);
    if (ctx.formatting.score >= 14)
        didWell.push("Formatting is recruiter-friendly with clean spacing and scanability.");
    if (ctx.bulletStats.totalBullets >= 6)
        didWell.push(`Healthy bullet density (${ctx.bulletStats.totalBullets} bullets) supports fast screening.`);
    if (didWell.length === 0)
        didWell.push("You have a solid starting draft — now we need stronger ATS signals and outcomes.");

    if (ctx.highImpactMissing.length > 0)
        hurting.push(`Missing high-impact keywords: ${ctx.highImpactMissing.slice(0, 3).join(", ")}.`);
    if (ctx.metricSignals.count < 2)
        hurting.push("Too few quantified outcomes — the resume reads task-heavy instead of result-driven.");
    if (ctx.vagueSignals.count > 0)
        hurting.push(`${ctx.vagueSignals.count} vague statements detected (e.g., “responsible for”, “helped with”).`);
    if (!ctx.bulletStats.hasConsistentBullets)
        hurting.push("Inconsistent bullet style can hurt ATS parsing and recruiter readability.");
    if (ctx.bulletStats.rolesWithFewBullets > 0)
        hurting.push(`${ctx.bulletStats.rolesWithFewBullets} role(s) have fewer than 2 bullets and look under-explained.`);

    if (ctx.highImpactMissing.length > 0)
        quickFixes.push(`Add 2–3 high-impact keywords naturally: ${ctx.highImpactMissing.slice(0, 3).join(", ")}.`);
    quickFixes.push("Rewrite one weak bullet with metric + action verb (30-second improvement per bullet).");
    if (!ctx.bulletStats.hasConsistentBullets)
        quickFixes.push("Use one bullet symbol consistently across all sections (e.g., only “•”).");
    if (ctx.vagueSignals.count > 0)
        quickFixes.push("Replace weak openers (‘responsible for’, ‘helped with’) with direct action verbs.");

    if (ctx.experienceLevel === "fresher") {
        highEffortImprovements.push("Add a Projects section with 2–3 role-relevant builds including stack + outcome.");
        highEffortImprovements.push("Create a targeted summary at top with role, core stack, and measurable project wins.");
    }
    else {
        highEffortImprovements.push("For each recent role, add at least one business impact metric (time, revenue, quality, cost).");
        highEffortImprovements.push("Re-order bullets so the strongest quantified achievements appear first in every role.");
    }
    if (ctx.keywordMatchPercent < 55)
        highEffortImprovements.push("Tailor a role-specific resume variant by mirroring job language section-by-section.");

    return {
        didWell: didWell.slice(0, 4),
        hurting: hurting.slice(0, 4),
        quickFixes: quickFixes.slice(0, 4),
        highEffortImprovements: highEffortImprovements.slice(0, 4),
        rewriteExamples: buildRewriteExamples(ctx.vagueSignals.lines, ctx.domainLabel),
    };
}

function flattenInsightsToSuggestions(insights) {
    const out = [];
    for (const text of insights.hurting.slice(0, 2))
        out.push({ priority: "HIGH", icon: "⚠️", text });
    for (const text of insights.quickFixes.slice(0, 2))
        out.push({ priority: "MED", icon: "⚡", text });
    for (const text of insights.highEffortImprovements.slice(0, 2))
        out.push({ priority: "LOW", icon: "🛠️", text });
    return out.slice(0, 6);
}

function simulateATS(score, keywordMatchPercent, formattingScore, impactScore, vagueCount, hasJD) {
    const passes = score >= 68
        && formattingScore >= 12
        && impactScore >= 8
        && vagueCount <= 4
        && (!hasJD || keywordMatchPercent >= 50);
    const reasons = [];
    if (formattingScore < 12)
        reasons.push("Formatting readability is below ATS-friendly threshold.");
    if (impactScore < 8)
        reasons.push("Impact evidence is limited; add quantified achievements.");
    if (vagueCount > 4)
        reasons.push("Too many vague statements reduce recruiter confidence.");
    if (hasJD && keywordMatchPercent < 50)
        reasons.push("Low keyword alignment with the target JD.");
    if (reasons.length === 0)
        reasons.push("Strong baseline across keywords, structure, and impact signals.");
    const confidence = Math.max(52, Math.min(95, Math.round((score + formattingScore + impactScore) / 1.6)));
    return {
        verdict: passes ? "Likely Pass Initial Screening" : "Likely Reject Initial Screening",
        tone: passes ? "success" : "danger",
        confidence,
        reasons,
    };
}
/* ============================================================
 * STEP 4 — Scoring
 * ============================================================ */
const SECTION_PATTERNS = [
    { name: "Experience", pts: 5, re: /\b(experience|work\s+experience|employment)\b/i },
    { name: "Education", pts: 5, re: /\b(education|degree|university|college|school)\b/i },
    { name: "Skills", pts: 5, re: /\b(skills|technical\s+skills|competencies|technologies)\b/i },
    { name: "Projects", pts: 5, re: /\b(projects|portfolio|work\s+samples?|internship)\b/i },
    { name: "Achievements", pts: 5, re: /\b(achievements|awards|honou?rs|accomplishments)\b/i },
    { name: "Certifications", pts: 5, re: /\b(certifications?|licenses?|credentials)\b/i },
    { name: "Summary", pts: 5, re: /\b(summary|objective|profile|about|overview)\b/i },
];
const ACTION_VERBS = [
    "led", "managed", "built", "developed", "designed", "created", "launched", "shipped", "delivered",
    "increased", "decreased", "improved", "reduced", "optimized", "scaled", "grew", "generated",
    "analyzed", "researched", "implemented", "deployed", "architected", "engineered", "programmed",
    "wrote", "published", "authored", "presented", "trained", "mentored", "coached", "supervised",
    "coordinated", "organized", "planned", "executed", "collaborated", "partnered", "negotiated",
    "achieved", "exceeded", "awarded", "recognized", "promoted", "established", "founded", "spearheaded",
    "streamlined", "automated", "migrated", "integrated", "configured", "maintained", "monitored",
    "audited", "assessed", "evaluated", "reviewed", "tested", "validated", "diagnosed", "resolved",
    "supported", "facilitated", "administered", "operated", "processed", "handled", "directed",
    "transformed", "accelerated", "influenced", "advised", "consulted", "secured", "acquired",
];
const ACTION_VERB_SET = new Set(ACTION_VERBS);
const STRICT_ACTION_VERBS = [
    "built", "designed", "implemented", "developed", "achieved", "reduced", "improved", "optimized",
    "shipped", "integrated", "architected", "contributed",
];
const STRICT_ACTION_VERB_SET = new Set(STRICT_ACTION_VERBS);
const IMPACT_NOUNS = [
    "users", "customers", "clients", "people", "team", "members", "projects", "months", "weeks",
    "hours", "revenue", "sales", "tickets", "bugs", "requests", "downloads", "installs", "followers",
    "accounts", "leads", "deals", "calls", "records", "reports", "systems", "applications",
    "products", "campaigns", "countries", "markets", "stores", "locations",
];
function getBulletLines(resume) {
    return resume
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^[-•*–]\s+\S+/.test(line));
}
function detectContactInfo(resume) {
    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resume)
        || /(?:\+?\d[\d\s().-]{7,}\d)/.test(resume)
        || /\b(linkedin\.com|github\.com|portfolio|https?:\/\/)\b/i.test(resume);
}
function scoreStrictFormatting(resume, sectionInfo, bulletStats) {
    let score = Math.min(20, (sectionInfo.sectionNames?.length ?? sectionInfo.present.size) * 5);
    if (bulletStats.totalBullets > 0)
        score += 5;
    if (detectContactInfo(resume))
        score += 5;
    return Math.min(20, score);
}
function scoreStrictClarity(resume) {
    const bullets = getBulletLines(resume);
    if (bullets.length === 0)
        return { score: 0, actionVerbBullets: 0, totalBullets: 0 };
    const actionVerbBullets = bullets.filter((line) => {
        const first = line.replace(/^[-•*–]\s+/, "").trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
        return STRICT_ACTION_VERB_SET.has(first);
    }).length;
    return {
        score: Math.round((actionVerbBullets / bullets.length) * 35),
        actionVerbBullets,
        totalBullets: bullets.length,
    };
}
function scoreStrictImpact(resume) {
    const metricRe = /(\d+%|[$£€₹]\s?\d[\d,]*|\b\d+(?:\.\d+)?x\b|\b\d[\d,]*\+?\s*(?:users?|customers?|clients?|projects?|months?|weeks?|years?|tickets?|bugs?|sales|revenue|leads?|accounts?|components?|pages?|features?|apis?|milliseconds?|seconds?|hours?)\b)/i;
    const count = getBulletLines(resume).filter((line) => metricRe.test(line)).length;
    return { score: Math.min(20, count * 5), count };
}
function scoreStrictLength(resume, wordCount) {
    const lineCount = resume.split(/\r?\n/).filter((line) => line.trim()).length;
    const estimatedPages = Math.max(Math.ceil(wordCount / 650), Math.ceil(lineCount / 55));
    return estimatedPages > 3 ? 5 : 10;
}
function normalizeSectionLine(line) {
    return line
        .replace(/^[#>*\s-]+/, "")
        .replace(/\*\*/g, "")
        .replace(/[:：|]+$/g, "")
        .trim();
}
function detectSections(resume) {
    const lines = resume.split(/\r?\n/);
    const present = new Set();
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const clean = normalizeSectionLine(raw);
        if (!clean || clean.length > 60)
            continue;
        const lower = clean.toLowerCase();
        const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim());
        const followedByBullet = !!nextNonEmpty && /^\s*[-•*–]\s+/.test(nextNonEmpty);
        const standaloneCaps = clean === clean.toUpperCase() && /[A-Z]{3,}/.test(clean);
        const boldHeader = /\*\*[^*]+\*\*/.test(raw);
        for (const { name, re } of SECTION_PATTERNS) {
            if (re.test(clean) && (standaloneCaps || boldHeader || followedByBullet || clean.split(/\s+/).length <= 4)) {
                present.add(name);
            }
        }
        if ((standaloneCaps || boldHeader || followedByBullet) && clean.split(/\s+/).length <= 4) {
            const genericHeader = SECTION_PATTERNS.find(({ re }) => re.test(lower));
            if (genericHeader)
                present.add(genericHeader.name);
        }
    }
    return { points: Math.min(20, present.size * 5), present, sectionNames: [...present] };
}
function detectActionVerbCount(resume) {
    const lines = resume.split(/\r?\n/);
    let count = 0;
    for (const line of lines) {
        const t = line.trim().replace(/^[-•*–]\s*/, "");
        if (!t)
            continue;
        const first = t.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
        if (first && ACTION_VERB_SET.has(first))
            count++;
    }
    return count;
}
function scoreActionVerbs(count) {
    if (count >= 8)
        return 15;
    if (count >= 5)
        return 11;
    if (count >= 3)
        return 7;
    if (count >= 1)
        return 3;
    return 0;
}
function detectImpactCount(resume) {
    let n = 0;
    n += (resume.match(/\d+%/g) || []).length;
    n += (resume.match(/[$£€]\s?\d[\d,]*/g) || []).length;
    n += (resume.match(/\b\d+x\b/gi) || []).length;
    const nounRe = new RegExp(`\\b\\d[\\d,]*\\+?\\s+(?:${IMPACT_NOUNS.join("|")})\\b`, "gi");
    n += (resume.match(nounRe) || []).length;
    return n;
}
function scoreImpact(count) {
    if (count >= 5)
        return 15;
    if (count >= 3)
        return 10;
    if (count >= 1)
        return 6;
    return 0;
}
function scoreLength(words) {
    if (words >= 400 && words <= 700)
        return 10;
    if ((words >= 300 && words <= 399) || (words >= 701 && words <= 800))
        return 7;
    if ((words >= 200 && words <= 299) || (words >= 801 && words <= 900))
        return 4;
    return 2;
}
function scoreFormatting(resume) {
    let pts = 0;
    if (/(19|20)\d{2}/.test(resume))
        pts += 3;
    const lines = resume.split(/\r?\n/);
    const headerLine = lines.some((l) => {
        const t = l.trim();
        return t.length > 0 && t.length < 40 && t === t.toUpperCase() && /[A-Z]{3,}/.test(t);
    });
    if (headerLine)
        pts += 2;
    const bulletLines = lines.filter((l) => /^\s*[-•*–]\s+/.test(l)).length;
    if (bulletLines >= 3)
        pts += 3;
    // No paragraph (block of consecutive non-empty lines) over 8 lines without a break
    let runMax = 0, run = 0;
    for (const l of lines) {
        if (l.trim() === "") {
            runMax = Math.max(runMax, run);
            run = 0;
        }
        else
            run++;
    }
    runMax = Math.max(runMax, run);
    if (runMax <= 8)
        pts += 2;
    return Math.min(10, pts);
}
/* ============================================================
 * Domain hint helpers
 * ============================================================ */
const TECH_DOMAINS = ["frontend", "backend", "fullstack", "devops", "data", "design"];
const DOMAIN_VERBS = {
    frontend: ["built", "shipped", "designed", "optimized", "implemented"],
    backend: ["architected", "scaled", "engineered", "deployed", "optimized"],
    fullstack: ["built", "shipped", "architected", "implemented", "delivered"],
    devops: ["automated", "deployed", "monitored", "scaled", "migrated"],
    data: ["analyzed", "modeled", "researched", "automated", "validated"],
    design: ["designed", "prototyped", "researched", "shipped", "iterated"],
    marketing: ["launched", "grew", "generated", "managed", "optimized"],
    finance: ["analyzed", "forecasted", "audited", "modeled", "reduced"],
    hr: ["recruited", "onboarded", "coached", "coordinated", "implemented"],
    sales: ["closed", "negotiated", "exceeded", "generated", "managed"],
    healthcare: ["coordinated", "supervised", "diagnosed", "improved", "documented"],
    legal: ["drafted", "reviewed", "negotiated", "researched", "advised"],
    general: ["led", "built", "delivered", "improved", "managed"],
};
function buildSuggestions(ctx) {
    const out = [];
    const dl = ctx.domainLabel;
    const verbList = (DOMAIN_VERBS[ctx.domain] ?? DOMAIN_VERBS.general).slice(0, 5).join(", ");
    if (ctx.missingTop.length >= 3) {
        out.push({ priority: "HIGH", icon: "🎯", text: `Add these keywords where they honestly apply: ${ctx.missingTop.slice(0, 3).join(", ")}. They appear multiple times in this job description.` });
    }
    if (ctx.verbCount < 4) {
        out.push({ priority: "HIGH", icon: "⚡", text: `Start more bullet points with strong action verbs. For ${dl} roles, try: ${verbList}.` });
    }
    if (ctx.impactCount <= 1) {
        out.push({ priority: "HIGH", icon: "⚡", text: `Add numbers to your achievements. Recruiters for ${dl} roles respond strongly to metrics like percentages, team sizes, or revenue impact.` });
    }
    if (!ctx.hasSkills) {
        out.push({ priority: "MED", icon: "🔧", text: `Add a dedicated Skills or Technologies section. For ${dl} roles this is often the first thing a recruiter scans.` });
    }
    if (!ctx.hasProjects && TECH_DOMAINS.includes(ctx.domain)) {
        out.push({ priority: "MED", icon: "🔧", text: `Add a Projects section with 2–3 relevant builds. For ${dl} roles, showing real work matters more than listing responsibilities.` });
    }
    if (ctx.wordCount < 300) {
        out.push({ priority: "MED", icon: "🔧", text: "Your resume is quite brief. Expand each role with 2–3 bullet points describing what you did and what resulted from it." });
    }
    if (ctx.wordCount > 850) {
        out.push({ priority: "LOW", icon: "🔧", text: "Your resume is longer than ideal. Trim roles older than 5 years to 1–2 bullets and remove redundant descriptions." });
    }
    if (ctx.yearMatches < 2) {
        out.push({ priority: "LOW", icon: "🎯", text: "Add date ranges to each role (e.g. 2022–2024) so recruiters can quickly read your career timeline." });
    }
    if (!ctx.hasSummary) {
        out.push({ priority: "LOW", icon: "🎯", text: "Add a 2–3 line summary at the top tailored to this specific role. It's the first thing most recruiters read." });
    }
    if (ctx.score > 75 && ctx.sectionPoints >= 16) {
        out.push({ priority: "LOW", icon: "🎯", text: "Your resume is well-structured. Consider tailoring your summary section specifically to this job description for an even stronger match." });
    }
    // Always exactly 5 — pad with safe, generally-true coaching only if needed
    const padding = [
        { priority: "LOW", icon: "🎯", text: "Lead each bullet with the outcome, not the task — what changed because you were there?" },
        { priority: "LOW", icon: "🔧", text: "Mirror language from the job description in 2–3 places where it honestly fits your experience." },
        { priority: "LOW", icon: "⚡", text: "Cut weak qualifiers like 'helped with' or 'responsible for' and lead with what you actually did." },
    ];
    for (const p of padding) {
        if (out.length >= 5)
            break;
        if (!out.some((s) => s.text === p.text))
            out.push(p);
    }
    return out.slice(0, 5);
}
/* ============================================================
 * STEP 6 — Cover letter & interview prep
 * ============================================================ */
function detectName(resume) {
    const first = resume.split(/\r?\n/).slice(0, 5).map((l) => l.trim()).filter(Boolean);
    for (const line of first) {
        if (/^[A-Z][a-zA-Z'’.-]+(?:\s+[A-Z][a-zA-Z'’.-]+){1,2}$/.test(line) && line.length <= 40) {
            return line;
        }
    }
    return null;
}
const ROLE_HINTS = [
    "frontend developer", "backend developer", "fullstack developer", "full-stack developer",
    "software engineer", "senior software engineer", "staff engineer", "data scientist", "data analyst",
    "product manager", "designer", "ui designer", "ux designer", "product designer",
    "devops engineer", "site reliability engineer", "engineering manager", "marketing manager",
    "content writer", "project manager", "ios developer", "android developer",
    "machine learning engineer", "ml engineer", "qa engineer", "security engineer",
    "financial analyst", "investment analyst", "sales manager", "account executive",
    "recruiter", "talent acquisition", "hr manager", "brand manager", "growth manager",
];
function detectRole(text) {
    const lower = text.toLowerCase();
    for (const role of ROLE_HINTS) {
        if (lower.includes(role)) {
            return role
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .replace(/Ui /g, "UI ")
                .replace(/Ux /g, "UX ")
                .replace(/Ml /g, "ML ")
                .replace(/Qa /g, "QA ")
                .replace(/Hr /g, "HR ")
                .replace(/Ios /g, "iOS ");
        }
    }
    return null;
}
function detectCompany(jd) {
    if (!jd)
        return null;
    const m = jd.match(/(?:at|join|about)\s+([A-Z][A-Za-z0-9&.\- ]{1,40})/);
    if (m)
        return m[1].trim().replace(/[.,!?]$/, "");
    const m2 = jd.match(/^([A-Z][A-Za-z0-9&.\- ]{1,40})\s+is\s+(?:hiring|looking|seeking)/m);
    if (m2)
        return m2[1].trim();
    return null;
}
function fallbackCandidateName(resume) {
    const email = resume.match(/([A-Z0-9._%+-]+)@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[1];
    if (email) {
        const parts = email.split(/[._-]+/).filter((p) => /^[a-z]+$/i.test(p) && p.length > 1).slice(0, 2);
        if (parts.length >= 1)
            return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
    return "the candidate";
}
function detectResumeHighlights(resume, matchedKeywords) {
    const lines = resume.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const projectLines = lines
        .filter((line) => /\b(project|built|developed|designed|implemented|integrated|optimized|shipped|created)\b/i.test(line))
        .map((line) => line.replace(/^[-•*–]\s*/, "").replace(/\s+/g, " ").trim())
        .filter((line) => line.length > 12)
        .slice(0, 3);
    const skillHits = matchedKeywords.length > 0
        ? matchedKeywords
        : TECH_KEYWORD_CATALOG.filter((term) => hasTerm(resume, term)).slice(0, 4);
    return {
        skills: [...new Set(skillHits)].slice(0, 4),
        projects: projectLines,
    };
}
function classifyStrictLevel(score) {
    if (score >= 90)
        return "Expert";
    if (score >= 75)
        return "Advanced";
    if (score >= 50)
        return "Intermediate";
    return "Beginner";
}
function atsVerdict(score, keywordPercent, formattingScore) {
    if (score >= 80 && keywordPercent >= 65 && formattingScore >= 15)
        return "Strong Pass";
    if (score >= 65 && keywordPercent >= 45)
        return "Likely Pass";
    if (score >= 45 || keywordPercent >= 30)
        return "Borderline";
    return "Likely Reject";
}
function buildAtsReasons({ verdict, keywordPercent, formattingPts, clarityPts, impactScore, matchedCount, totalKeywords, sectionNames }) {
    const reasons = [];
    reasons.push(`${matchedCount}/${totalKeywords} technical JD keywords matched (${keywordPercent}%).`);
    reasons.push(sectionNames.length > 0
        ? `Detected resume sections: ${sectionNames.join(", ")}.`
        : "Few recognizable resume section headers were detected.");
    reasons.push(`Clarity score is ${clarityPts}/35 based on action-verb bullet ratio.`);
    if (impactScore > 0)
        reasons.push(`${Math.round(impactScore / 5)} bullet(s) include numbers, percentages, or concrete metrics.`);
    else
        reasons.push("No metric-backed bullets were detected, reducing recruiter confidence.");
    reasons.push(`ATS verdict: ${verdict}.`);
    return reasons;
}
function buildStrictSuggestions({ missing, clarityDetail, impactDetail, sectionInfo, hasContact }) {
    const out = [];
    if (missing.length > 0)
        out.push({ priority: "HIGH", icon: "🎯", text: `Add relevant JD technical keywords where truthful: ${missing.slice(0, 4).join(", ")}.` });
    if (clarityDetail.totalBullets === 0 || clarityDetail.score < 20)
        out.push({ priority: "HIGH", icon: "⚡", text: "Rewrite bullets to start with strong action verbs such as Built, Designed, Implemented, Developed, Optimized, or Integrated." });
    if (impactDetail.count < 2)
        out.push({ priority: "MED", icon: "📈", text: "Add metrics to project and experience bullets, such as performance improvements, user counts, latency reductions, or delivery timelines." });
    if ((sectionInfo.sectionNames?.length ?? 0) < 4)
        out.push({ priority: "MED", icon: "🧩", text: "Use clear standalone section headers like Summary, Skills, Projects, Experience, Education, Achievements, and Certifications." });
    if (!hasContact)
        out.push({ priority: "HIGH", icon: "☎️", text: "Add ATS-readable contact information: email, phone, LinkedIn/GitHub, or portfolio URL." });
    out.push({ priority: "LOW", icon: "🔧", text: "Prioritize the top third of the resume for the frontend stack and projects most relevant to this JD." });
    return out.slice(0, 6);
}
function buildCoverLetter(opts) {
    const name = opts.name ?? fallbackCandidateName(opts.resumeText ?? "");
    const role = opts.role ?? `${DOMAIN_LABELS[opts.domain] ?? "Software"} Engineering role`;
    const company = opts.company ?? "your team";
    const highlights = detectResumeHighlights(opts.resumeText ?? "", opts.matchedKeywords ?? []);
    const skillsLine = highlights.skills.length > 0
        ? highlights.skills.slice(0, 3).join(", ")
        : `${DOMAIN_LABELS[opts.domain] ?? "technical"} development`;
    const projectLine = highlights.projects.length > 0
        ? `Specific work that stands out includes ${highlights.projects.slice(0, 2).join("; ")}.`
        : `The resume shows practical experience with ${skillsLine}, which aligns with the technical requirements in the job description.`;
    const jdRefs = (opts.topKeywords ?? []).slice(0, 3).join(", ");
    const jdLine = jdRefs
        ? `Your job description emphasizes ${jdRefs}, and ${name}'s background shows direct overlap through ${skillsLine}.`
        : `${name}'s background aligns with the technical expectations described in the job description.`;
    let opening;
    if (TECH_DOMAINS.includes(opts.domain)) {
        opening = `I am excited to apply for the ${role} position at ${company}.`;
    }
    else if (opts.domain === "marketing") {
        opening = `I am passionate about building brands and would love to bring my experience to ${company} as your next ${role}.`;
    }
    else if (opts.domain === "finance") {
        opening = `I am applying for the ${role} position at ${company} with a strong background in financial analysis.`;
    }
    else {
        opening = `I am writing to express my interest in the ${role} position at ${company}.`;
    }
    const verbHits = STRICT_ACTION_VERBS.filter((v) => new RegExp(`\\b${escapeRegExp(v)}\\b`, "i").test(opts.resumeText ?? "")).slice(0, 3);
    const verbsLine = verbHits.length
        ? `In recent work, ${name} has ${verbHits.join(", ")} technical initiatives using ${skillsLine}`
        : `${name} brings hands-on technical experience with ${skillsLine}`;
    return `Dear Hiring Manager,

${opening} ${jdLine}

${verbsLine}. ${projectLine}

I would welcome the opportunity to discuss how ${name}'s ${DOMAIN_LABELS[opts.domain] ?? "technical"} engineering skills can support ${company}'s product goals. Thank you for your time and consideration.

Warm regards,
${name}`;
}
function buildInterviewQuestions(domain, domainLabel, topKeywords) {
    const k1 = topKeywords[0] ?? domainLabel.toLowerCase();
    const k2 = topKeywords[1] ?? "the tools listed in the job description";
    const behavioral = [
        {
            type: "Behavioral",
            q: "Tell me about a time you owned a project from start to finish.",
            a: `Pick one project where you were clearly the driver. Walk through the situation, the constraints, what you did each week, and the measurable outcome. For ${domainLabel} roles, anchor it in something close to the work you'd be doing here.`,
        },
        {
            type: "Behavioral",
            q: "Describe a time you received tough feedback. What did you do with it?",
            a: "Pick real, specific feedback — not a humblebrag. Explain how you sat with it, what you changed in your habits over the next few weeks, and how you knew the change stuck. Self-awareness plus follow-through is the signal.",
        },
    ];
    const technicalByDomain = {
        frontend: [
            { type: "Technical", q: `Walk me through how you would structure a complex ${k1} component for reuse and testability.`, a: `Discuss component boundaries, props vs. state, accessibility, and how you'd cover it with tests. Mention how ${k2} fits in if it appears in your stack.` },
            { type: "Technical", q: "How do you debug a slow page in production?", a: "Talk through measuring with the Performance panel, checking network waterfall, identifying render bottlenecks, and prioritizing the biggest wins first." },
        ],
        backend: [
            { type: "Technical", q: `Design a ${k1} endpoint that needs to scale to millions of requests. What do you think about?`, a: `Cover data model, indexing, caching strategy, idempotency, and observability. Reference ${k2} if it's in your toolbelt.` },
            { type: "Technical", q: "How would you debug an intermittent 500 error in production?", a: "Reproduce locally, check logs and traces, look at recent deploys, and isolate by feature flag. Talk about adding metrics so you'd catch it earlier next time." },
        ],
        fullstack: [
            { type: "Technical", q: `Walk me through how you'd ship a feature end-to-end that uses ${k1}.`, a: `Talk through schema, API contract, frontend state, error handling, and deploy strategy. Mention ${k2} if relevant.` },
            { type: "Technical", q: "What's your approach to writing tests across the stack?", a: "Discuss the test pyramid, where unit vs. integration vs. e2e earn their cost, and how you keep the suite fast enough to run on every commit." },
        ],
        devops: [
            { type: "Technical", q: `Walk me through a CI/CD pipeline you've built, especially how ${k1} fits in.`, a: `Cover stages, secret handling, rollback strategy, and observability. Reference ${k2} if it's part of your stack.` },
            { type: "Technical", q: "Tell me about a production incident you led the response on.", a: "Walk through detection, triage, mitigation, and the postmortem. Emphasize what you changed in process or tooling so the same class of bug couldn't recur." },
        ],
        data: [
            { type: "Technical", q: `Walk me through an analysis where you used ${k1} to drive a decision.`, a: `Cover the question, the dataset, the method, and the recommendation. Be honest about assumptions and limits.` },
            { type: "Technical", q: "How do you decide between a simple model and a complex one?", a: "Start with a baseline, add complexity only when it earns its keep on a held-out set, and weigh interpretability against marginal gains." },
        ],
        design: [
            { type: "Technical", q: `Walk me through a project where ${k1} shaped your design decisions.`, a: `Talk about the user problem, the research, the iterations, and the tradeoffs. Show artifacts when you can.` },
            { type: "Technical", q: "How do you handle disagreement with engineering or PM on a design call?", a: "Lead with the user problem, share the data behind your choice, and propose a quick experiment when intuition diverges." },
        ],
        marketing: [
            { type: "Technical", q: `Tell me about a campaign where ${k1} drove the result.`, a: `Cover the audience, the channel mix, the message, and the metric you moved. Be specific about what you'd do differently.` },
            { type: "Technical", q: "How do you decide which channel deserves more budget?", a: "Talk about CAC vs. LTV by channel, attribution caveats, and how you'd run a small test before reallocating significant spend." },
        ],
        finance: [
            { type: "Technical", q: `Walk me through a model you built where ${k1} was the central driver.`, a: `Cover assumptions, sensitivity analysis, and how you stress-tested it. Be ready to defend each number.` },
            { type: "Technical", q: "How do you communicate a complex financial result to a non-finance audience?", a: "Lead with the headline, then the two or three drivers, then the supporting detail only if asked. Use one chart, not five." },
        ],
        hr: [
            { type: "Technical", q: `Tell me about a time you used ${k1} to improve an HR process.`, a: `Cover the pain point, the change you made, and how you measured adoption. Mention ${k2} if relevant.` },
            { type: "Technical", q: "How do you handle a sensitive employee relations issue?", a: "Listen first, document carefully, loop in legal where appropriate, and act fairly and consistently. Confidentiality is non-negotiable." },
        ],
        sales: [
            { type: "Technical", q: `Walk me through a deal where ${k1} was the difference-maker.`, a: `Cover discovery, the champion, the objections, and the close. Be specific about the cycle length and the size.` },
            { type: "Technical", q: "How do you forecast your pipeline?", a: "Talk through stage definitions, conversion math, and how you keep the pipeline honest week to week." },
        ],
        healthcare: [
            { type: "Technical", q: `Describe a situation where ${k1} affected your clinical decision-making.`, a: `Cover assessment, the choice, the outcome, and what you'd do differently. Patient safety frames everything.` },
            { type: "Technical", q: "How do you stay current with evolving protocols?", a: "Cite specific journals, CE pathways, or peer review you participate in. Show you treat learning as part of the job." },
        ],
        legal: [
            { type: "Technical", q: `Walk me through a matter where ${k1} was central to your strategy.`, a: `Cover the facts, the legal question, the analysis, and the result. Be precise about your role on the team.` },
            { type: "Technical", q: "How do you approach a contract negotiation with limited leverage?", a: "Identify must-haves, offer creative concessions on lower-priority terms, and document everything cleanly so the next round is faster." },
        ],
        general: [
            { type: "Technical", q: `Walk me through a recent project where ${k1} mattered.`, a: `Cover the goal, the constraints, the work, and the result. Be specific.` },
            { type: "Technical", q: "Walk me through how you'd approach a problem you've never seen before.", a: "Clarify scope, sketch two or three approaches with tradeoffs, pick one with a reason, and decide what you'd measure first." },
        ],
    };
    const situational = {
        type: "Situational",
        q: "Why this team and why now?",
        a: `Tie three things together: something specific about the company's mission, something specific about your trajectory, and the gap that this ${domainLabel} role would close. Avoid generic enthusiasm.`,
    };
    return [...behavioral, ...technicalByDomain[domain], situational];
}
/* ============================================================
 * Public API
 * ============================================================ */
export function detectJobTitle(text, jd) {
    return detectRole(jd) ?? detectRole(text);
}
export function analyze(resumeText, jobDescription) {
    const resume = normalizeText(resumeText);
    const jd = normalizeText(jobDescription);
    const wordCount = resume.trim() ? resume.trim().split(/\s+/).length : 0;
    const domain = detectDomain(jd);
    const domainLabel = DOMAIN_LABELS[domain];

    // Strict JD keyword extraction: technical skills/tools/frameworks/domain terms only.
    const extracted = extractStrictTechKeywords(jd, domain);
    const totalForMatch = extracted.length;
    const idx = buildResumeIndex(resume);
    const found = [];
    const missing = [];
    const foundSet = new Set();
    for (const hit of extracted) {
        if (matchCanonicalKeyword(hit.canonical, idx) || matchKeyword(hit.display, idx) || matchKeyword(hit.key, idx)) {
            found.push(hit.display);
            foundSet.add(hit.key);
        }
        else {
            missing.push(hit.display);
        }
    }

    const hasJD = jd.trim().length > 0;
    const keywordMatchPercent = totalForMatch > 0 ? Math.round((found.length / totalForMatch) * 100) : 0;
    const keywordPts = totalForMatch > 0 ? Math.round((found.length / totalForMatch) * 35) : 0;

    const sectionInfo = detectSections(resume);
    const bulletStats = detectBulletStats(resume);
    const metricSignals = detectMetricSignals(resume);
    const vagueSignals = detectVagueStatements(resume);
    const formattingDetail = analyzeFormattingDetailed(resume, wordCount, sectionInfo, bulletStats);

    const formattingPts = scoreStrictFormatting(resume, sectionInfo, bulletStats); // /20
    const clarityDetail = scoreStrictClarity(resume);
    const clarityPts = clarityDetail.score; // /35
    const impactDetail = scoreStrictImpact(resume);
    const impactPts = impactDetail.score; // /20, reported separately
    const impactCount = impactDetail.count;
    const lengthPts = scoreStrictLength(resume, wordCount); // /10
    const verbCount = clarityDetail.actionVerbBullets;

    // Overall score follows the requested 100-point ATS rubric: formatting + clarity + keywords + length.
    const score = Math.min(100, formattingPts + clarityPts + keywordPts + lengthPts);

    const lengthReason = wordCount < 320
        ? "Resume is shorter than ideal; add more role-specific bullets."
        : wordCount > 780
            ? "Resume is longer than ideal; trim older or repetitive details."
            : "Length is balanced for recruiter scanning and ATS parsing.";

    const keywordCategories = groupKeywordsByCategory(extracted, foundSet);
    const rankedMissing = extracted.filter((k) => !foundSet.has(k.key));
    const highImpactMissing = rankedMissing.slice(0, 6).map((k) => k.display);
    const highImpactKeywords = extracted.slice(0, 8).map((k) => k.display);

    const yearsEstimate = estimateExperienceYears(resume);
    const experienceLevel = detectExperienceLevel(resume, yearsEstimate);
    const strengthLevel = classifyStrengthLevel(score, keywordMatchPercent, experienceLevel, hasJD);
    const level = classifyStrictLevel(score);
    const verdict = atsVerdict(score, keywordMatchPercent, formattingPts);
    const confidence = Math.max(0, Math.min(100, Math.round((score * 0.65) + (keywordMatchPercent * 0.25) + (formattingPts / 20) * 10)));
    const hasContact = detectContactInfo(resume);
    const atsReasons = buildAtsReasons({
        verdict,
        keywordPercent: keywordMatchPercent,
        formattingPts,
        clarityPts,
        impactScore: impactPts,
        matchedCount: found.length,
        totalKeywords: totalForMatch,
        sectionNames: sectionInfo.sectionNames ?? [],
    });

    const insights = buildInsightSections({
        keywordMatchPercent,
        highImpactMissing,
        metricSignals,
        vagueSignals,
        bulletStats,
        formatting: formattingDetail,
        experienceLevel,
        domainLabel,
    });

    const legacySuggestions = buildSuggestions({
        domain,
        domainLabel,
        missingTop: missing.slice(0, 5),
        verbCount,
        impactCount,
        hasSkills: SECTION_PATTERNS[2].re.test(resume),
        hasProjects: SECTION_PATTERNS[3].re.test(resume),
        hasSummary: SECTION_PATTERNS[6].re.test(resume),
        wordCount,
        yearMatches: (resume.match(/\b(19|20)\d{2}\b/g) || []).length,
        score,
        sectionPoints: sectionInfo.points,
    });
    const suggestions = [
        ...buildStrictSuggestions({ missing, clarityDetail, impactDetail, sectionInfo, hasContact }),
        ...flattenInsightsToSuggestions(insights),
        ...legacySuggestions,
    ]
        .filter((s, i, arr) => arr.findIndex((x) => x.text === s.text) === i)
        .slice(0, 8);

    const atsSimulation = simulateATS(score, keywordMatchPercent, formattingPts, impactPts, vagueSignals.count, hasJD);

    const scoreBreakdown = {
        keywordMatch: {
            label: "Keyword Match",
            score: keywordPts,
            max: 35,
            matched: found.length,
            total: totalForMatch,
            percent: keywordMatchPercent,
            reason: hasJD
                ? `${found.length}/${totalForMatch || 0} normalized JD keywords matched.`
                : "Add a JD to activate full keyword matching.",
        },
        formatting: {
            label: "Formatting",
            score: formattingPts,
            max: 20,
            reason: formattingDetail.issues[0] ?? formattingDetail.strengths[0] ?? "Formatting analyzed.",
            checks: formattingDetail.checks,
        },
        impact: {
            label: "Impact & Metrics",
            score: impactPts,
            max: 20,
            metrics: metricSignals.count,
            reason: metricSignals.count >= 2
                ? `${metricSignals.count} metric-driven bullets detected.`
                : "Limited quantified impact. Add % / numeric outcomes.",
        },
        clarity: {
            label: "Clarity & Action Verbs",
            score: clarityPts,
            max: 35,
            actionVerbs: verbCount,
            totalBullets: clarityDetail.totalBullets,
            vagueStatements: vagueSignals.count,
            reason: `${clarityDetail.actionVerbBullets}/${clarityDetail.totalBullets} bullets start with strict action verbs.`,
        },
        length: {
            label: "Length Balance",
            score: lengthPts,
            max: 10,
            reason: lengthReason,
        },
    };

    const sub = {
        formatting: Math.min(20, formattingPts),
        clarity: Math.min(35, clarityPts),
        keywords: Math.min(35, keywordPts),
    };

    const name = detectName(resume);
    const role = detectRole(jd) ?? detectRole(resume);
    const company = detectCompany(jd);
    const topKws = extracted.slice(0, 5).map((k) => k.display);

    return {
        score,
        level,
        formatting: formattingPts,
        clarity: clarityPts,
        keywords: keywordPts,
        impactScore: impactPts,
        lengthScore: lengthPts,
        atsVerdict: verdict,
        atsConfidence: confidence,
        atsReasons,
        matchedKeywords: found,
        missingKeywords: missing,
        subScores: sub,
        wordCount,
        jobTitle: role,
        detectedName: name,
        domain,
        domainLabel,
        keywordsFound: found.slice(0, 12),
        keywordsMissing: missing.slice(0, 12),
        keywordCategories,
        keywordStats: {
            matched: found.length,
            total: totalForMatch,
            percent: keywordMatchPercent,
            highImpactMissing,
            highImpactKeywords,
            rankedMissing: rankedMissing.slice(0, 12).map((k) => k.display),
        },
        scoreBreakdown,
        advancedSignals: {
            bulletStats,
            metricSignals,
            vagueSignals,
            actionVerbCount: verbCount,
            impactCount,
            formatting: formattingDetail,
            sectionPoints: sectionInfo.points,
        },
        insights,
        strengthLevel,
        experienceLevel,
        experienceYearsEstimate: yearsEstimate,
        atsSimulation,
        suggestions,
        coverLetter: buildCoverLetter({ name, role, company, domain, resumeText: resume, matchedKeywords: found, topKeywords: topKws }),
        interviewQuestions: buildInterviewQuestions(domain, domainLabel, topKws),
    };
}
export function scoreLabel(score) {
    if (score >= 75)
        return { label: "Strong", tone: "success" };
    if (score >= 50)
        return { label: "Good", tone: "warning" };
    return { label: "Needs Work", tone: "danger" };
}
