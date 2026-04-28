import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/applications";
const PRIO = [
    { v: "hot", label: "Hot 🔴", color: "var(--danger)" },
    { v: "warm", label: "Warm 🟡", color: "var(--warning)" },
    { v: "cold", label: "Cold 🔵", color: "var(--accent-secondary)" },
];
export function JobModal({ open, initial, defaultStatus, onClose, onSave }) {
    const [form, setForm] = useState(() => initial ?? {
        id: String(Date.now()),
        company: "",
        role: "",
        url: "",
        dateApplied: "",
        salary: "",
        priority: "warm",
        notes: "",
        reminder: "",
        status: defaultStatus ?? "wishlist",
        createdAt: new Date().toISOString(),
    });
    useEffect(() => {
        if (open) {
            setForm(initial ?? {
                id: String(Date.now()),
                company: "",
                role: "",
                url: "",
                dateApplied: "",
                salary: "",
                priority: "warm",
                notes: "",
                reminder: "",
                status: defaultStatus ?? "wishlist",
                createdAt: new Date().toISOString(),
            });
        }
    }, [open, initial, defaultStatus]);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);
    if (!open)
        return null;
    const submit = (e) => {
        e.preventDefault();
        if (!form.company.trim() || !form.role.trim())
            return;
        onSave(form);
    };
    return (<div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-[hsl(var(--bg)/0.7)] backdrop-blur-sm" onClick={onClose}/>
      <form onSubmit={submit} className="relative w-full max-w-xl bg-surface border border-token rounded-[20px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-cardtitle">{initial ? "Edit application" : "Add application"}</h2>
            <p className="text-xs text-muted-token mt-1">All fields stay on this device.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-token">
            <X className="h-4 w-4"/>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company" required>
            <input className="input-token w-full px-3 py-2.5 text-sm" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Northwind"/>
          </Field>
          <Field label="Role" required>
            <input className="input-token w-full px-3 py-2.5 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Senior Frontend Developer"/>
          </Field>
          <Field label="Job URL">
            <input className="input-token w-full px-3 py-2.5 text-sm" value={form.url ?? ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..."/>
          </Field>
          <Field label="Date applied">
            <input type="date" className="input-token w-full px-3 py-2.5 text-sm" value={form.dateApplied ?? ""} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}/>
          </Field>
          <Field label="Salary range">
            <input className="input-token w-full px-3 py-2.5 text-sm" value={form.salary ?? ""} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. $120k–$140k"/>
          </Field>
          <Field label="Reminder date">
            <input type="date" className="input-token w-full px-3 py-2.5 text-sm" value={form.reminder ?? ""} onChange={(e) => setForm({ ...form, reminder: e.target.value })}/>
          </Field>
          <Field label="Priority">
            <select className="input-token w-full px-3 py-2.5 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIO.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="input-token w-full px-3 py-2.5 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea className="input-token w-full px-3 py-2.5 text-sm" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Recruiter contact, interview format, anything to remember" rows={3}/>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="btn-ghost-token px-4 py-2.5 text-sm">Cancel</button>
          <button type="submit" className="btn-gradient px-5 py-2.5 text-sm font-semibold">Save</button>
        </div>
      </form>
    </div>);
}
function Field({ label, required, children }) {
    return (<label className="block">
      <span className="block text-xs font-medium text-muted-token mb-1.5">
        {label} {required && <span style={{ color: "hsl(var(--danger))" }}>*</span>}
      </span>
      {children}
    </label>);
}
