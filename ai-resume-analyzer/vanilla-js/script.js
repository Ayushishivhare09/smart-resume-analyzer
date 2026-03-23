import { analyzeResume } from '../shared-analyzer-engine/index.js';

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let APP = {
  user: null,
  history: [],
  currentResult: null,
  jobs: [
    {id:1,title:'Senior Frontend Engineer',company:'Stripe',stage:'interview',color:'#4f9eff'},
    {id:2,title:'Full Stack Dev',company:'Vercel',stage:'applied',color:'#a78bfa'},
    {id:3,title:'React Developer',company:'Linear',stage:'offer',color:'#34d399'},
    {id:4,title:'Software Engineer',company:'Figma',stage:'applied',color:'#f59e0b'},
  ],
  settings:{emailAlerts:true,weeklyReport:false,publicProfile:false,darkMode:true}
};

// ── persist to sessionStorage ──
function saveState(){try{sessionStorage.setItem('riq',JSON.stringify({user:APP.user,history:APP.history,jobs:APP.jobs}))}catch(e){}}
function loadState(){try{const d=JSON.parse(sessionStorage.getItem('riq'));if(d){APP.user=d.user;APP.history=d.history||[];APP.jobs=d.jobs||APP.jobs;}}catch(e){}}
loadState();

// ══════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════
function truncate(str, len){return str.length>len?str.slice(0,len)+'...':str;}
function scoreClass(s){return s>=80?'score-high':s>=60?'score-mid':'score-low';}
function countC(el,id){document.getElementById(id).textContent=el.value.length+' chars';}

// ══════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════
function initReveal(){
  setTimeout(()=>{
    document.querySelectorAll('.feat-card').forEach((el,i)=>{
      setTimeout(()=>el.classList.add('visible'),i*100);
    });
  },300);
}
function toggleTheme(){
  const html=document.documentElement;
  const current=html.getAttribute('data-theme');
  const next=current==='light'?'dark':'light';
  html.setAttribute('data-theme',next);
  APP.settings.darkMode=next==='dark';
  saveState();
}

// ══════════════════════════════════════
// PAGE SYSTEM
// ══════════════════════════════════════
function showPage(id){
  const next=document.getElementById(id);
  const current=document.querySelector('.page.active');
  if(!next||current===next)return;
  const flash=document.getElementById('pageFlash');
  flash.classList.add('flash');
  setTimeout(()=>{
    if(current) current.classList.remove('active');
    next.classList.add('active');
    next.style.animation='none';
    next.offsetHeight;
    next.style.animation='pgIn .5s cubic-bezier(.22,1,.36,1) both';
    window.scrollTo(0,0);
    flash.classList.remove('flash');
    setTimeout(initReveal, 80);
  }, 160);
}
function requireAuth(pg){
  if(!APP.user){openModal('authModal');return;}
  if(pg)showPage(pg);
}
function goDashboard(){if(APP.user)showPage('pg-dashboard');else showPage('pg-landing');}

// ══════════════════════════════════════
// MODALS & TOASTS
// ══════════════════════════════════════
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function showToast(msg,type='success'){
  const t=document.getElementById('toast');
  const icon=type==='success'?'✓ ':type==='error'?'✕ ':type==='info'?'ℹ ':'';
  t.textContent=icon+msg;
  t.className='toast '+type+' show';
  setTimeout(()=>t.classList.remove('show'),type==='info'?4000:3200);
}

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════
function toggleAuth(showSignup){
  const su=showSignup===undefined?document.getElementById('signupForm').style.display==='none':showSignup;
  document.getElementById('loginForm').style.display=su?'none':'block';
  document.getElementById('signupForm').style.display=su?'block':'none';
}
function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  const err=document.getElementById('loginErr');
  if(!email||!pass){err.textContent='Please fill in all fields.';err.style.display='block';return;}
  const users=JSON.parse(sessionStorage.getItem('riq_users')||'[]');
  const u=users.find(x=>x.email===email&&x.pass===pass);
  if(!u){err.textContent='Invalid email or password.';err.style.display='block';return;}
  err.style.display='none';
  loginUser(u);
}
function doSignup(){
  const name=document.getElementById('signupName').value.trim();
  const email=document.getElementById('signupEmail').value.trim();
  const pass=document.getElementById('signupPass').value;
  const err=document.getElementById('signupErr');
  if(!name||!email||!pass){err.textContent='Please fill in all fields.';err.style.display='block';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';err.style.display='block';return;}
  const users=JSON.parse(sessionStorage.getItem('riq_users')||'[]');
  if(users.find(x=>x.email===email)){err.textContent='An account with this email already exists.';err.style.display='block';return;}
  err.style.display='none';
  const u={name,email,pass};
  users.push(u);
  sessionStorage.setItem('riq_users',JSON.stringify(users));
  loginUser(u);
}
function loginUser(u){
  APP.user=u;saveState();
  closeModal('authModal');
  updateNavUser();
  updateLandingNav();
  showToast('Welcome back, '+u.name.split(' ')[0]+'!');
  showPage('pg-dashboard');
  showDashTab('overview');
}
function doSignout(){
  APP.user=null;saveState();
  showPage('pg-landing');
  showToast('Signed out successfully.','success');
  updateLandingNav();
}
function updateNavUser(){
  if(!APP.user)return;
  const init=APP.user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('navAvatar').textContent=init;
  document.getElementById('navAvatar2').textContent=init;
  document.getElementById('navUserName').textContent=APP.user.name.split(' ')[0];
  document.getElementById('histBadge').textContent=APP.history.length;
}
function updateLandingNav(){
  const nav=document.getElementById('landingNav');
  if(!nav)return;
  if(APP.user){
    nav.innerHTML=`<span style="font-size:13px;color:var(--t2)">${APP.user.name.split(' ')[0]}</span>
      <div class="avatar" style="cursor:default">${APP.user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
      <button class="btn btn-ghost" style="font-size:12px" onclick="doSignout()">Sign Out</button>`;
  }else{
    nav.innerHTML=`<div style="display:flex;gap:8px">
      <button class="btn btn-ghost" onclick="openModal('authModal')">Sign In</button>
      <button class="btn btn-primary" onclick="openModal('authModal');toggleAuth(false)">Get Started</button>
    </div>`;
  }
}

// ══════════════════════════════════════
// DASHBOARD TABS
// ══════════════════════════════════════
function showDashTab(tab){
  document.querySelectorAll('.sidebar-item').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('si-'+tab);
  if(el)el.classList.add('active');
  const dc=document.getElementById('dashContent');
  dc.innerHTML='';
  switch(tab){
    case 'overview': renderOverview(dc);break;
    case 'history': renderHistory(dc);break;
    case 'coverletter': renderCoverLetter(dc);break;
    case 'interview': renderInterview(dc);break;
    case 'tracker': renderTracker(dc);break;
    case 'profile': renderProfile(dc);break;
    case 'settings': renderSettings(dc);break;
  }
}

// ─── OVERVIEW ───
function renderOverview(c){
  const h=APP.history;
  const avgScore=h.length?Math.round(h.reduce((s,x)=>s+x.atsScore,0)/h.length):0;
  const best=h.length?Math.max(...h.map(x=>x.atsScore)):0;
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Welcome back, ${APP.user?.name.split(' ')[0]||'there'} 👋</div>
      <div class="section-sub">Here's your career progress at a glance</div></div>
      <button class="btn btn-primary" onclick="showPage('pg-analyze')">+ New Analysis</button>
    </div>
    <div class="metric-grid stagger">
      <div class="metric-card">
        <div class="metric-val" style="background:linear-gradient(135deg,var(--a),var(--a2));-webkit-background-clip:text;-webkit-text-fill-color:transparent">${h.length}</div>
        <div class="metric-label">Analyses Done</div>
        <div class="metric-change metric-up">↑ Keep going!</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="background:linear-gradient(135deg,var(--a3),#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${avgScore||'—'}</div>
        <div class="metric-label">Avg Score</div>
        <div class="metric-change ${avgScore>=70?'metric-up':'metric-down'}">${avgScore>=70?'↑ Strong':'↓ Room to grow'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="background:linear-gradient(135deg,var(--a2),#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${best||'—'}</div>
        <div class="metric-label">Best Score</div>
        <div class="metric-change metric-up">Personal best</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="background:linear-gradient(135deg,var(--warn),#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${APP.jobs.length}</div>
        <div class="metric-label">Jobs Tracked</div>
        <div class="metric-change metric-up">↑ Active pipeline</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-title"><div class="c-icon" style="background:rgba(79,158,255,0.15)">🕐</div>Recent Analyses</div>
        ${h.length===0?`<div style="text-align:center;padding:32px;color:var(--t3)">
          <div style="font-size:32px;margin-bottom:10px">📄</div>
          <div style="font-size:14px">No analyses yet</div>
          <button class="btn btn-primary" style="margin-top:16px" onclick="showPage('pg-analyze')">Analyze Now</button>
        </div>`
        :h.slice(-3).reverse().map(x=>`<div class="history-item" onclick="viewResult(${x.id})" style="padding:14px">
          <div class="hi-icon" style="background:rgba(79,158,255,0.1)">📄</div>
          <div class="hi-main"><div class="hi-title" style="font-size:14px">${truncate(x.resumeSnippet||'Resume',28)}</div>
          <div class="hi-sub">${x.date}</div></div>
          <div class="hi-score ${scoreClass(x.atsScore)}" style="font-size:18px;font-family:var(--font);font-weight:900">${x.atsScore}</div>
        </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title"><div class="c-icon" style="background:rgba(52,211,153,0.15)">📋</div>Job Pipeline</div>
        ${['applied','interview','offer'].map(stage=>{
          const jobs=APP.jobs.filter(j=>j.stage===stage);
          return `<div style="margin-bottom:12px">
            <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">${stage} (${jobs.length})</div>
            ${jobs.map(j=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--s2);border-radius:9px;margin-bottom:5px">
              <div style="width:8px;height:8px;border-radius:50%;background:${j.color};flex-shrink:0"></div>
              <div style="flex:1"><div style="font-size:13px;font-weight:600">${j.title}</div><div style="font-size:11px;color:var(--t2)">${j.company}</div></div>
            </div>`).join('')}
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><div class="c-icon" style="background:rgba(245,158,11,0.15)">⚡</div>Quick Actions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        ${[
          {icon:'✨',label:'Analyze Resume',action:"showPage('pg-analyze')"},
          {icon:'✍️',label:'Write Cover Letter',action:"showDashTab('coverletter')"},
          {icon:'🎤',label:'Interview Prep',action:"showDashTab('interview')"},
          {icon:'📋',label:'Job Tracker',action:"showDashTab('tracker')"},
          {icon:'🕐',label:'View History',action:"showDashTab('history')"},
          {icon:'👤',label:'Edit Profile',action:"showDashTab('profile')"},
        ].map(a=>`<button onclick="${a.action}" style="padding:16px;border-radius:12px;background:var(--s2);border:1px solid var(--border);color:var(--t);cursor:pointer;font-family:var(--body);font-size:13px;font-weight:500;transition:all .2s;text-align:center" onmouseover="this.style.borderColor='var(--a)';this.style.color='var(--a)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--t)'">
          <div style="font-size:22px;margin-bottom:7px">${a.icon}</div>${a.label}
        </button>`).join('')}
      </div>
    </div>
  </div>`;
}

// ─── HISTORY ───
function renderHistory(c){
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Analysis History</div><div class="section-sub">${APP.history.length} total analyses</div></div>
      <button class="btn btn-primary" onclick="showPage('pg-analyze')">+ New</button>
    </div>
    ${APP.history.length===0?`<div style="text-align:center;padding:80px 20px;color:var(--t3)">
      <div style="font-size:48px;margin-bottom:16px">📂</div>
      <div style="font-size:16px;font-family:var(--font);font-weight:800;margin-bottom:8px">No analyses yet</div>
      <div style="font-size:14px;margin-bottom:20px">Start by analyzing your first resume</div>
      <button class="btn btn-primary" onclick="showPage('pg-analyze')">Analyze Resume</button>
    </div>`:APP.history.slice().reverse().map(x=>`
      <div class="history-item" onclick="viewResult(${x.id})">
        <div class="hi-icon" style="background:rgba(79,158,255,0.1)">📄</div>
        <div class="hi-main">
          <div class="hi-title">${truncate(x.resumeSnippet||'Resume Analysis',40)}</div>
          <div class="hi-sub">${x.jdSnippet?'vs '+truncate(x.jdSnippet,30):'General Analysis'}</div>
          <div style="margin-top:6px" class="chips">
            ${(x.matchedKeywords||[]).slice(0,4).map(k=>`<span class="chip chip-blue">${k}</span>`).join('')}
          </div>
        </div>
        <div class="hi-meta">
          <div class="hi-score ${scoreClass(x.atsScore)}">${x.atsScore}</div>
          <div class="hi-date">${x.date}</div>
          <div style="margin-top:6px"><span class="chip ${x.atsScore>=80?'chip-green':x.atsScore>=60?'chip-blue':'chip-amber'}">${x.title||'Analysis'}</span></div>
        </div>
      </div>`).join('')}
  </div>`;
}

// ─── COVER LETTER ───
function renderCoverLetter(c){
  const lastResult=APP.currentResult;
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Cover Letter Generator</div><div class="section-sub">AI-crafted, personalized cover letters in seconds</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div class="card" style="margin-bottom:14px">
          <div class="card-title"><div class="c-icon" style="background:rgba(167,139,250,0.15)">✍️</div>Cover Letter Settings</div>
          <div class="form-group"><label class="form-label">Your Name</label>
            <input class="form-input" id="clName" value="${APP.user?.name||''}" placeholder="Your full name"></div>
          <div class="form-group"><label class="form-label">Target Company</label>
            <input class="form-input" id="clCompany" placeholder="e.g. Google, Stripe, Figma"></div>
          <div class="form-group"><label class="form-label">Target Role</label>
            <input class="form-input" id="clRole" placeholder="e.g. Senior Software Engineer"></div>
          <div class="form-group"><label class="form-label">Tone</label>
            <select class="form-input" id="clTone">
              <option>Professional</option><option>Enthusiastic</option><option>Concise</option><option>Creative</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Your Resume (paste or it'll use last analysis)</label>
            <textarea class="form-input" id="clResume" rows="6" placeholder="Paste resume text...">${lastResult?lastResult._resumeText||'':''}</textarea>
          </div>
          <button class="btn btn-primary" style="width:100%;padding:12px" onclick="generateCoverLetter()">✨ Generate Cover Letter</button>
        </div>
      </div>
      <div>
        <div style="display:flex;gap:8px;margin-bottom:10px" class="cl-toolbar">
          <button class="btn btn-ghost" style="font-size:12px" onclick="copyText('clOutput')">📋 Copy</button>
          <button class="btn btn-ghost" style="font-size:12px" onclick="downloadText('clOutput','cover_letter.txt')">⬇ Download</button>
          <button class="btn btn-ghost" style="font-size:12px" onclick="regenerateCL()">🔄 Regenerate</button>
        </div>
        <div class="cl-preview" id="clOutput" style="min-height:500px;font-size:14px;line-height:1.8;color:var(--t2)">Your generated cover letter will appear here...</div>
      </div>
    </div>
  </div>`;
}
function generateCoverLetter(){
  const name=document.getElementById('clName').value||APP.user?.name||'Candidate';
  const company=document.getElementById('clCompany').value||'the company';
  const role=document.getElementById('clRole').value||'the position';
  const resume=document.getElementById('clResume').value||APP.currentResult?._resumeText||'';
  
  const cl=`Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${role} position at ${company}. With my background in software development and passion for building innovative solutions, I believe I would be a valuable addition to your team.

${resume.length>0?`My experience includes working on various projects that have sharpened my technical skills in JavaScript, React, and Node.js. I have demonstrated the ability to deliver high-quality solutions on time and collaborate effectively with cross-functional teams.`:''}

I am excited about the opportunity to contribute to ${company} and would welcome the chance to discuss how my skills and experience align with your needs.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${name}`;
  
  document.getElementById('clOutput').textContent=cl;
  showToast('Cover letter generated!');
}
function copyText(id){
  const text=document.getElementById(id).textContent;
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!');
}
function downloadText(id,filename){
  const text=document.getElementById(id).textContent;
  const blob=new Blob([text],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}
function regenerateCL(){generateCoverLetter();}

// ─── INTERVIEW PREP ───
function renderInterview(c){
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Interview Prep</div><div class="section-sub">Practice with common questions</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="iq-card">
        <div class="iq-q"><span class="iq-num">1</span><div style="font-weight:600">Tell me about yourself</div></div>
        <button class="iq-toggle" onclick="this.nextElementSibling.classList.toggle('open')">Show Answer</button>
        <div class="iq-ans">Start with your current role, highlight key achievements, and end with what you're looking for in this position. Keep it under 2 minutes.</div>
      </div>
      <div class="iq-card">
        <div class="iq-q"><span class="iq-num">2</span><div style="font-weight:600">Why do you want to work here?</div></div>
        <button class="iq-toggle" onclick="this.nextElementSibling.classList.toggle('open')">Show Answer</button>
        <div class="iq-ans">Research the company, mention specific products/values you admire, and connect your skills to the role's requirements.</div>
      </div>
      <div class="iq-card">
        <div class="iq-q"><span class="iq-num">3</span><div style="font-weight:600">Describe a challenging project</div></div>
        <button class="iq-toggle" onclick="this.nextElementSibling.classList.toggle('open')">Show Answer</button>
        <div class="iq-ans">Use STAR method: Situation, Task, Action, Result. Focus on your specific contribution and measurable outcomes.</div>
      </div>
      <div class="iq-card">
        <div class="iq-q"><span class="iq-num">4</span><div style="font-weight:600">What are your strengths?</div></div>
        <button class="iq-toggle" onclick="this.nextElementSibling.classList.toggle('open')">Show Answer</button>
        <div class="iq-ans">Choose 2-3 strengths relevant to the job. Provide specific examples of how you've demonstrated these strengths.</div>
      </div>
    </div>
  </div>`;
}

// ─── JOB TRACKER ───
function renderTracker(c){
  ensureJobModal();
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Job Tracker</div><div class="section-sub">Manage your applications</div></div>
      <button class="btn btn-primary" onclick="openJobModal()">+ Add Job</button>
    </div>
    <div class="kanban">
      ${['applied','interview','offer','rejected'].map(stage=>`
        <div class="kanban-col">
          <div class="kanban-col-header">
            ${stage.charAt(0).toUpperCase()+stage.slice(1)}
            <span class="k-count">${APP.jobs.filter(j=>j.stage===stage).length}</span>
          </div>
          ${APP.jobs.filter(j=>j.stage===stage).map(j=>`
            <div class="kanban-card" onclick="openJobModal(${j.id})" style="cursor:pointer">
              <div style="width:30px;height:4px;background:${j.color};border-radius:2px;margin-bottom:8px"></div>
              <div class="kc-title">${j.title}</div>
              <div class="kc-sub">${j.company}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  </div>`;
}

function ensureJobModal(){
  if(document.getElementById('jobModal'))return;
  const m=document.createElement('div');
  m.id='jobModal';
  m.className='modal';
  m.innerHTML=`<div class="modal-overlay" onclick="closeModal('jobModal')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title" id="jobModalTitle">Add Job</div>
        <button class="btn-close" onclick="closeModal('jobModal')">✕</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="jobId">
        <div class="form-group"><label class="form-label">Company</label><input class="form-input" id="jobCompany" placeholder="e.g. Stripe"></div>
        <div class="form-group"><label class="form-label">Job Title</label><input class="form-input" id="jobTitle" placeholder="e.g. Frontend Engineer"></div>
        <div class="form-group"><label class="form-label">Stage</label>
          <select class="form-input" id="jobStage">
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
          <button class="btn btn-danger" id="btnDeleteJob" onclick="deleteJob()" style="display:none;margin-right:auto">Delete</button>
          <button class="btn btn-ghost" onclick="closeModal('jobModal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveJob()">Save</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);
}

function openJobModal(id){
  ensureJobModal();
  const title=document.getElementById('jobModalTitle');
  const delBtn=document.getElementById('btnDeleteJob');
  if(id){
    const job=APP.jobs.find(x=>x.id===id);
    if(!job)return;
    title.textContent='Edit Job';
    document.getElementById('jobId').value=job.id;
    document.getElementById('jobCompany').value=job.company;
    document.getElementById('jobTitle').value=job.title;
    document.getElementById('jobStage').value=job.stage;
    delBtn.style.display='block';
  }else{
    title.textContent='Add Job';
    document.getElementById('jobId').value='';
    document.getElementById('jobCompany').value='';
    document.getElementById('jobTitle').value='';
    document.getElementById('jobStage').value='applied';
    delBtn.style.display='none';
  }
  openModal('jobModal');
}

function saveJob(){
  const id=document.getElementById('jobId').value;
  const company=document.getElementById('jobCompany').value.trim();
  const title=document.getElementById('jobTitle').value.trim();
  const stage=document.getElementById('jobStage').value;
  
  if(!company||!title){showToast('Please fill in all fields','error');return;}
  
  if(id){
    const idx=APP.jobs.findIndex(x=>x.id==id);
    if(idx>-1){
      APP.jobs[idx]={...APP.jobs[idx],company,title,stage};
      showToast('Job updated');
    }
  }else{
    const colors=['#4f9eff','#a78bfa','#34d399','#f59e0b','#ec4899','#6366f1'];
    APP.jobs.push({
      id:Date.now(),
      company,
      title,
      stage,
      color:colors[Math.floor(Math.random()*colors.length)]
    });
    showToast('Job added');
  }
  saveState();
  closeModal('jobModal');
  showDashTab('tracker');
}

function deleteJob(){
  const id=document.getElementById('jobId').value;
  if(!confirm('Delete this job?'))return;
  APP.jobs=APP.jobs.filter(x=>x.id!=id);
  saveState();
  closeModal('jobModal');
  showDashTab('tracker');
  showToast('Job deleted');
}

// ─── PROFILE ───
function renderProfile(c){
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Profile</div></div>
    </div>
    <div class="profile-header">
      <div class="profile-avatar">${APP.user?APP.user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2):'U'}</div>
      <div>
        <div class="profile-name">${APP.user?.name||'User'}</div>
        <div class="profile-email">${APP.user?.email||''}</div>
        <div class="profile-badges">
          <span class="chip chip-blue">Free Plan</span>
          <span class="chip chip-green">${APP.history.length} Analyses</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── SETTINGS ───
function renderSettings(c){
  c.innerHTML=`<div class="fade-in">
    <div class="section-header">
      <div><div class="section-title">Settings</div></div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Notifications</div>
      <div class="setting-row">
        <div class="setting-info"><h4>Email Alerts</h4><p>Get notified about new features</p></div>
        <div class="toggle ${APP.settings.emailAlerts?'on':''}" onclick="this.classList.toggle('on');APP.settings.emailAlerts=!APP.settings.emailAlerts;saveState()"></div>
      </div>
      <div class="setting-row">
        <div class="setting-info"><h4>Weekly Report</h4><p>Receive weekly summary of activity</p></div>
        <div class="toggle ${APP.settings.weeklyReport?'on':''}" onclick="this.classList.toggle('on');APP.settings.weeklyReport=!APP.settings.weeklyReport;saveState()"></div>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Account</div>
      <div class="setting-row">
        <div class="setting-info"><h4>Delete Account</h4><p>Permanently delete your account and data</p></div>
        <button class="btn btn-danger" onclick="alert('Feature coming soon!')">Delete</button>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════
// FILE HANDLING
// ══════════════════════════════════════
function handleAnalyzeFile(e){
  const f=e.target.files[0];
  if(!f)return;
  const fileType=f.name.split('.').pop().toLowerCase();
  if(['pdf','doc','docx'].includes(fileType)){
    showToast('For best results with .pdf or .docx, please copy and paste the text directly.','info');
  }
  const reader=new FileReader();
  reader.onload=function(e2){
    const txt=e2.target.result;
    document.getElementById('analyzeResume').value=txt;
    countC(document.getElementById('analyzeResume'),'rC');
    document.getElementById('dzIcon').textContent='✅';
    document.getElementById('dzTitle').textContent=f.name;
    document.getElementById('dzSub').textContent='File loaded - you can edit below';
  };
  reader.readAsText(f);
}

// ══════════════════════════════════════
// ANALYSIS
// ══════════════════════════════════════
function startAnalysis(){
  const resume=document.getElementById('analyzeResume').value.trim();
  const jd=document.getElementById('analyzeJD').value.trim();
  const err=document.getElementById('analyzeErr');
  if(!resume){err.textContent='Please paste your resume text.';err.style.display='block';return;}
  err.style.display='none';

  document.getElementById('loadingOverlay').classList.add('active');

  // Simulate analysis time for better UX
  setTimeout(() => {
    const result = analyzeResume(resume, jd);
    result.id = Date.now();
    
    APP.history.push(result);
    APP.currentResult = result;
    saveState();
    updateNavUser();
    
    document.getElementById('loadingOverlay').classList.remove('active');
    viewResult(result.id);
  }, 1500);
}

function checkATSScoreOnly(){
  const resume=document.getElementById('analyzeResume').value.trim();
  const jd=document.getElementById('analyzeJD').value.trim();
  const err=document.getElementById('analyzeErr');
  
  if(!resume){
    err.textContent='Please paste your resume text.';
    err.style.display='block';
    return;
  }
  err.style.display='none';

  const result = analyzeResume(resume, jd);
  const score = result.atsScore;
  
  // Show score in a customized way
  alert(`Your current ATS Score is: ${score}/100\n\nSkills Match: ${result.skillMatchPercentage}%\nKeywords: ${result.keywordScore}%`);
}

// ══════════════════════════════════════
// RESULTS
// ══════════════════════════════════════
function viewResult(id){
  const r=APP.history.find(x=>x.id===id);
  if(!r)return;
  showPage('pg-results');
  const c=document.getElementById('resultsContent');
  c.innerHTML=`
    <div class="section-header">
      <div><div class="section-title">Analysis Results</div><div class="section-sub">${r.date}</div></div>
    </div>
    <div style="display:flex;gap:40px;align-items:flex-start;margin-bottom:40px">
      <div class="score-ring-wrap">
        <svg class="sr" viewBox="0 0 100 100"><defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--a)"/><stop offset="100%" stop-color="var(--a2)"/></linearGradient></defs><circle class="sr-bg" cx="50" cy="50" r="42"/><circle class="sr-fill" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="${264-(264*r.atsScore/100)}"/></svg>
        <div class="sr-num"><span class="big">${r.atsScore}</span><span class="sm">/100</span></div>
      </div>
      <div style="flex:1">
        <div class="ats-bar-wrap"><div class="ats-head"><span>Skills Match</span><span>${r.skillMatchPercentage}%</span></div><div class="ats-track"><div class="ats-fill" style="width:${r.skillMatchPercentage}%;background:var(--a)"></div></div></div>
        <div class="ats-bar-wrap"><div class="ats-head"><span>Keyword Match</span><span>${r.keywordScore}%</span></div><div class="ats-track"><div class="ats-fill" style="width:${r.keywordScore}%;background:var(--a2)"></div></div></div>
        <div class="ats-bar-wrap"><div class="ats-head"><span>Impact & Experience</span><span>${Math.round((r.impactScore+r.experienceScore)/2)}%</span></div><div class="ats-track"><div class="ats-fill" style="width:${Math.round((r.impactScore+r.experienceScore)/2)}%;background:var(--a3)"></div></div></div>
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="suggestions" onclick="switchTab(this,'suggestions')">Suggestions</button>
      <button class="tab-btn" data-tab="skills" onclick="switchTab(this,'skills')">Skills</button>
      <button class="tab-btn" data-tab="keywords" onclick="switchTab(this,'keywords')">Keywords</button>
      <button class="tab-btn" data-tab="formatting" onclick="switchTab(this,'formatting')">Formatting</button>
    </div>
    <div class="tab-pane active" id="tab-suggestions">
      ${r.suggestions.map(sug => `
        <div class="sug">
          <span class="sug-ico">${sug.icon}</span>
          <div><div class="sug-title">${sug.title}</div><div class="sug-text">${sug.text}</div></div>
        </div>
      `).join('')}
    </div>
    <div class="tab-pane" id="tab-skills">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="sc-card"><div class="card-title">Matched Skills</div>${r.matchedSkills.length?r.matchedSkills.map(s=>`<span class="chip chip-green">${s}</span>`).join(''):'<div style="color:var(--t3)">No skills from the job description were found.</div>'}</div>
        <div class="sc-card"><div class="card-title">Missing Skills</div>${r.missingSkills.length?r.missingSkills.map(s=>`<span class="chip chip-amber">${s}</span>`).join(''):'<div style="color:var(--t3)">Great job! All skills from the JD are on your resume.</div>'}</div>
      </div>
    </div>
    <div class="tab-pane" id="tab-keywords">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="sc-card"><div class="card-title">Matched Keywords</div>${r.matchedKeywords.length?r.matchedKeywords.slice(0,20).map(k=>`<span class="chip chip-blue">${k}</span>`).join(''):'<div style="color:var(--t3)">No keyword matches found.</div>'}</div>
        <div class="sc-card"><div class="card-title">Missing Keywords</div>${r.missingKeywords.length?r.missingKeywords.slice(0,20).map(k=>`<span class="chip chip-amber">${k}</span>`).join(''):'<div style="color:var(--t3)">All keywords are present!</div>'}</div>
      </div>
    </div>
    <div class="tab-pane" id="tab-formatting">
      <div class="sc-card" style="margin-bottom:16px">
        <div class="card-title">Resume Structure Check</div>
        <div style="margin-bottom:10px;color:var(--t2);font-size:14px">ATS systems look for specific standard sections to parse your resume correctly.</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${(r.detectedSections || []).map(s => `<span class="chip chip-green">✓ ${s.charAt(0).toUpperCase() + s.slice(1)}</span>`).join('')}
          ${(r.missingSections || []).map(s => `<span class="chip chip-amber">⚠ Missing: ${s.charAt(0).toUpperCase() + s.slice(1)}</span>`).join('')}
        </div>
        <div style="margin-top:16px;font-size:13px;color:var(--t3)">
          <strong>Formatting Score:</strong> ${r.formattingScore}/100
        </div>
      </div>
    </div>
  `;
}
function switchTab(btn,tab){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-'+tab).classList.add('active');
}

// Init on load
document.addEventListener('DOMContentLoaded',function(){
  setTimeout(initReveal,100);
});

// Expose functions to window for HTML event handlers
window.toggleTheme = toggleTheme;
window.showPage = showPage;
window.requireAuth = requireAuth;
window.goDashboard = goDashboard;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleAuth = toggleAuth;
window.doLogin = doLogin;
window.doSignup = doSignup;
window.doSignout = doSignout;
window.showDashTab = showDashTab;
window.viewResult = viewResult;
window.handleAnalyzeFile = handleAnalyzeFile;
window.countC = countC;
window.startAnalysis = startAnalysis;
window.checkATSScoreOnly = checkATSScoreOnly;
window.switchTab = switchTab;
window.generateCoverLetter = generateCoverLetter;
window.copyText = copyText;
window.downloadText = downloadText;
window.regenerateCL = regenerateCL;
window.openJobModal = openJobModal;
window.saveJob = saveJob;
window.deleteJob = deleteJob;
window.APP = APP;
