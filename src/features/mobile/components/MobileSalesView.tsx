import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  Plus,
  Mic,
  MessageSquare,
  Calendar,
  ArrowLeft,
  Circle,
  AlertCircle,
  User,
  FileText,
  TrendingUp,
} from "lucide-react";

type MobileView = "today" | "lead" | "calllog" | "notes";

const todayTasks = [
  { id: "1", title: "Site visit — Henderson Estate", time: "10:00 AM", type: "visit", lead: "Henderson Estate", done: false, priority: "high" },
  // { id: "2", title: "Follow-up call — Riverside HOA board", time: "11:30 AM", type: "call", lead: "Riverside HOA", done: false, priority: "high" },
  { id: "3", title: "Send revised quote to Park Estates", time: "1:00 PM", type: "email", lead: "Park Estates Dev.", done: false, priority: "medium" },
  { id: "4", title: "Call Thornton re: site visit scheduling", time: "2:30 PM", type: "call", lead: "Thornton Family", done: true, priority: "low" },
  { id: "5", title: "Check on Martinez installation progress", time: "4:00 PM", type: "followup", lead: "Martinez Residence", done: false, priority: "medium" },
];

const myLeads = [
  { id: "1", name: "Henderson Estate", value: 54000, stage: "Site Visit", lastContact: "2h ago", priority: "high" },
  // { id: "2", name: "Riverside HOA", value: 210000, stage: "Negotiation", lastContact: "4h ago", priority: "high" },
  { id: "3", name: "Park Estates Dev.", value: 178000, stage: "Estimate Sent", lastContact: "Yesterday", priority: "medium" },
  { id: "4", name: "Thornton Family", value: 22000, stage: "Qualified", lastContact: "2 days ago", priority: "low" },
];

const callLog = [
  { id: "1", name: "Robert Henderson", phone: "(602) 555-0187", time: "Today 10:34 AM", duration: "14 min", outcome: "Connected — Site visit confirmed for tomorrow", type: "outbound" },
  // { id: "2", name: "HOA Board (Riverside)", phone: "(480) 555-0522", time: "Today 9:10 AM", duration: "—", outcome: "Voicemail left — callback requested", type: "outbound" },
  { id: "3", name: "Karen Thornton", phone: "(480) 555-0198", time: "Yesterday 3:45 PM", duration: "8 min", outcome: "Connected — Interested, scheduling site visit", type: "inbound" },
  { id: "4", name: "Park Estates Dev.", phone: "(623) 555-0601", time: "Yesterday 11:20 AM", duration: "22 min", outcome: "Connected — Contract language discussed, legal review underway", type: "outbound" },
];

const quickNotes = [
  { id: "1", lead: "Henderson Estate", time: "Today 10:30 AM", text: "Client wants dog-friendly turf. Has military ID — verify discount eligibility. Prefers morning installation." },
  { id: "2", lead: "Riverside HOA", time: "Jun 4, 3:00 PM", text: "Board approved Phase 1 in principle. Financing terms are key — they want 90-day net terms. Follow up with finance team." },
  { id: "3", lead: "Park Estates", time: "Jun 3, 1:15 PM", text: "Dev team wants 3-phase completion. Phase 1 by July 4th is critical for their open house." },
];

const priorityColors: Record<string, string> = {
  high: "var(--status-red)",
  medium: "var(--status-orange)",
  low: "var(--status-green)",
};

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }> = {
  visit: { icon: MapPin, color: "var(--status-orange)" },
  call: { icon: Phone, color: "var(--status-blue)" },
  email: { icon: Mail, color: "var(--brand-green)" },
  followup: { icon: Clock, color: "#7C3AED" },
};

export function MobileSalesView() {
  const [view, setView] = useState<MobileView>("today");
  const [tasks, setTasks] = useState(todayTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="flex justify-center items-start h-full overflow-y-auto p-8" style={{ backgroundColor: "var(--background)" }}>
      {/* Phone Frame */}
      <div
        className="rounded-3xl overflow-hidden flex flex-col"
        style={{
          width: "390px",
          height: "780px",
          backgroundColor: "white",
          boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 0 0 12px #1B1B1B",
          flexShrink: 0,
        }}
      >
        {/* Status Bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1" style={{ backgroundColor: "var(--brand-dark-green)" }}>
          <span className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[4, 3, 2, 1].map((h) => (
                <div key={h} className="w-1 bg-white rounded-sm" style={{ height: `${h * 3}px`, opacity: h === 1 ? 0.4 : 1 }} />
              ))}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.9">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="white" strokeWidth="2" fill="none" />
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <rect x="0.5" y="0.5" width="16" height="9" rx="2" stroke="white" strokeOpacity="0.5" />
              <rect x="1.5" y="1.5" width="12" height="7" rx="1" fill="white" />
              <rect x="17" y="3" width="2" height="4" rx="1" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
        </div>

        {/* App Header */}
        <div
          className="px-5 pt-3 pb-4"
          style={{ backgroundColor: "var(--brand-dark-green)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white" style={{ fontSize: "11px", opacity: 0.7 }}>Southwest Greens CRM</p>
              <p className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>Good Morning, Alex</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", fontSize: "12px", fontWeight: 700 }}
            >
              AJ
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 mt-3">
            {[
              { label: "Tasks", value: tasks.filter((t) => !t.done).length, icon: "⚡" },
              { label: "My Leads", value: myLeads.length, icon: "👥" },
              { label: "Pipeline", value: "$464k", icon: "💰" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 py-2 px-2 rounded-xl text-center"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav Tabs */}
        <div
          className="flex border-b px-2"
          style={{ borderColor: "var(--border)", backgroundColor: "white" }}
        >
          {[
            { id: "today" as MobileView, label: "Today", icon: Calendar },
            { id: "lead" as MobileView, label: "Leads", icon: User },
            { id: "calllog" as MobileView, label: "Calls", icon: Phone },
            { id: "notes" as MobileView, label: "Notes", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="flex-1 flex flex-col items-center py-2.5 transition-colors"
                style={{
                  color: view === tab.id ? "var(--brand-green)" : "var(--muted-foreground)",
                  borderBottom: view === tab.id ? "2px solid var(--brand-green)" : "2px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span style={{ fontSize: "10px", fontWeight: view === tab.id ? 600 : 400 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {view === "today" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Today's Tasks</p>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  {tasks.filter((t) => t.done).length}/{tasks.length} done
                </span>
              </div>
              {tasks.map((task) => {
                const TypeIcon = typeConfig[task.type]?.icon || Clock;
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: task.done ? "#FAFAFA" : "white",
                      boxShadow: task.done ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0">
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
                      ) : (
                        <Circle className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-foreground"
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          textDecoration: task.done ? "line-through" : "none",
                          color: task.done ? "var(--muted-foreground)" : "var(--foreground)",
                        }}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-3.5 h-3.5 rounded flex items-center justify-center"
                          style={{ backgroundColor: typeConfig[task.type]?.color + "20" || "#F1F5F9" }}
                        >
                          <TypeIcon className="w-2.5 h-2.5" style={{ color: typeConfig[task.type]?.color || "#64748B" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{task.time}</span>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColors[task.priority] }} />
                      </div>
                    </div>
                    <button className="mt-0.5 p-1.5 rounded-lg" style={{ backgroundColor: "var(--brand-light-green)" }}>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />
                    </button>
                  </div>
                );
              })}
              {/* New Task FAB */}
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                style={{ backgroundColor: "var(--brand-light-green)", color: "var(--brand-green)", fontSize: "13px", fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          )}

          {view === "lead" && (
            <div className="p-4 space-y-3">
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>My Leads</p>
              {myLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 rounded-xl border"
                  style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColors[lead.priority] }} />
                        <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{lead.name}</p>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--brand-green)", fontWeight: 700 }}>${lead.value.toLocaleString()}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ fontSize: "10px", fontWeight: 600, backgroundColor: "var(--brand-light-green)", color: "var(--brand-green)" }}
                    >
                      {lead.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Last: {lead.lastContact}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#EFF6FF" }}
                      >
                        <Phone className="w-3.5 h-3.5" style={{ color: "var(--status-blue)" }} />
                      </button>
                      <button
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--brand-light-green)" }}
                      >
                        <Mail className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "calllog" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Call Log</p>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "var(--brand-green)", color: "white", fontSize: "11px" }}
                >
                  <Mic className="w-3 h-3" />
                  Log Call
                </button>
              </div>
              {callLog.map((call) => (
                <div
                  key={call.id}
                  className="p-3.5 rounded-xl border"
                  style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        backgroundColor: call.type === "inbound" ? "var(--status-blue)" : "var(--brand-green)",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {call.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{call.name}</p>
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            fontSize: "9px",
                            fontWeight: 600,
                            backgroundColor: call.type === "inbound" ? "#EFF6FF" : "var(--brand-light-green)",
                            color: call.type === "inbound" ? "var(--status-blue)" : "var(--brand-green)",
                          }}
                        >
                          {call.type}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{call.time} · {call.duration}</p>
                      <p className="mt-1" style={{ fontSize: "12px", color: "var(--foreground)" }}>{call.outcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "notes" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Quick Notes</p>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "var(--brand-green)", color: "white", fontSize: "11px" }}
                >
                  <Plus className="w-3 h-3" />
                  New
                </button>
              </div>
              {/* Compose */}
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--border)", backgroundColor: "#FAFFF9" }}
              >
                <textarea
                  rows={2}
                  placeholder="Quick note..."
                  className="w-full text-foreground placeholder:text-muted-foreground resize-none outline-none bg-transparent"
                  style={{ fontSize: "13px" }}
                />
                <div className="flex items-center gap-2 mt-2">
                  <select
                    className="text-muted-foreground border rounded-lg px-2 py-1"
                    style={{ fontSize: "11px", borderColor: "var(--border)" }}
                  >
                    <option>Link to lead...</option>
                    {myLeads.map((l) => <option key={l.id}>{l.name}</option>)}
                  </select>
                  <button
                    className="ml-auto px-3 py-1 rounded-lg text-white"
                    style={{ backgroundColor: "var(--brand-green)", fontSize: "11px" }}
                  >
                    Save
                  </button>
                </div>
              </div>
              {quickNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl border"
                  style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{ fontSize: "10px", fontWeight: 600, backgroundColor: "var(--brand-light-green)", color: "var(--brand-green)" }}
                    >
                      {note.lead}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{note.time}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--foreground)", lineHeight: 1.55 }}>{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Nav (iOS style) */}
        <div
          className="border-t pb-2 pt-1"
          style={{ borderColor: "var(--border)", backgroundColor: "white" }}
        >
          <div className="grid grid-cols-5 gap-0">
            {[
              { icon: TrendingUp, label: "Pipeline" },
              { icon: Calendar, label: "Schedule" },
              { icon: null, label: "New", isAction: true },
              { icon: MessageSquare, label: "Comms" },
              { icon: User, label: "Profile" },
            ].map((item, i) => {
              if (item.isAction) {
                return (
                  <button
                    key={i}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white -mt-4 shadow-lg"
                      style={{ backgroundColor: "var(--brand-green)" }}
                    >
                      <Plus className="w-5 h-5" />
                    </div>
                  </button>
                );
              }
              const Icon = item.icon!;
              return (
                <button key={i} className="flex flex-col items-center py-2 gap-0.5">
                  <Icon className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                  <span style={{ fontSize: "9px", color: "var(--muted-foreground)" }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description aside */}
      <div className="ml-8 max-w-64 flex-shrink-0 self-center">
        <h3 className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>Mobile Sales View</h3>
        <p className="mb-4" style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
          Optimized for field reps on the go. Quick access to today's tasks, lead details, call logging, and notes — all in one thumb-friendly interface.
        </p>
        <div className="space-y-2">
          {[
            "Today's task list with check-off",
            "My leads with quick-call/email",
            "Call logging with outcome notes",
            "Quick notes linked to leads",
            "iOS-style bottom navigation",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
