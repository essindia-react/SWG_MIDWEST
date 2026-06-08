import React from "react";
import { useState } from "react";
import {
  Mail,
  Phone,
  Search,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Paperclip,
  Send, 
  Plus,
  ChevronDown,
  Filter,
  Clock,
  CheckCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const threads = [
  {
    id: "1",
    name: "Robert Henderson",
    subject: "RE: Henderson Estate Turf Proposal",
    preview: "Thank you Maria, the quote looks great. I have a couple questions about the drainage...",
    time: "10:24 AM",
    unread: true,
    starred: false,
    status: "replied",
    tags: ["Quote Sent", "Hot Lead"],
    lead: "Henderson Estate",
  },
  {
    id: "2",
    name: "Riverside HOA Board",
    subject: "RE: Phase 2 Installation Proposal — $210,000",
    preview: "The board reviewed the proposal at yesterday's meeting. We'd like to move forward but...",
    time: "9:12 AM",
    unread: true,
    starred: true,
    status: "replied",
    tags: ["Negotiation", "HOA"],
    lead: "Riverside HOA",
  },
  {
    id: "3",
    name: "Auto Follow-Up",
    subject: "Day 3 Follow-Up: Desert Vista HOA Inquiry",
    preview: "This is an automated follow-up for Desert Vista HOA. No response recorded in past 72 hours.",
    time: "Yesterday",
    unread: false,
    starred: false,
    status: "auto",
    tags: ["Automated"],
    lead: "Desert Vista HOA",
  },
  {
    id: "4",
    name: "Tony Rivera",
    subject: "Pool Surround Project — New Requirements",
    preview: "Hi Chris, we're expanding the scope. Can we add the front entrance area as well? Also...",
    time: "Yesterday",
    unread: false,
    starred: true,
    status: "needs_reply",
    tags: ["Scope Change"],
    lead: "Rivera Pool & Turf",
  },
  {
    id: "5",
    name: "Park Estates Dev.",
    subject: "Contract Terms Discussion",
    preview: "Our legal team reviewed the terms. Section 4.2 regarding warranties needs adjustment...",
    time: "Jun 3",
    unread: false,
    starred: false,
    status: "needs_reply",
    tags: ["Contract", "Negotiation"],
    lead: "Park Estates Dev.",
  },
  {
    id: "6",
    name: "Karen Thornton",
    subject: "Interested in Backyard Turf Installation",
    preview: "Hi, we found you through our neighbors the Johnsons. We're interested in getting artificial turf...",
    time: "Jun 3",
    unread: false,
    starred: false,
    status: "needs_reply",
    tags: ["New Inquiry"],
    lead: "Thornton Family",
  },
];

const emailBody = `Hi Robert,

Thank you for reaching out about the Henderson Estate project! Based on our site assessment last Thursday, I'm pleased to present our proposal for your premium artificial turf installation.

**Project Summary:**
• Coverage Area: 1,800 sq ft (rear yard)
• Material: Southwest Greens K9 Premier™ (50oz face weight)
• Infill: Durafill™ Antimicrobial with DramaFill cushioning
• Drainage System: AquaFlow® subsurface drainage grid
• Installation Timeline: 2–3 days (week of June 16th)

**Investment Summary:**
• Materials: $28,400
• Labor & Installation: $14,200
• Drainage System: $4,800
• Haul-away & Site Prep: $2,600
• **Total Investment: $50,000**
• **After Military Discount (8%): $46,000**

This includes our full 15-year warranty on materials and a 5-year workmanship guarantee.

Please let me know if you have any questions or would like to discuss any modifications to the scope.

Best regards,
Maria Santos
Senior Sales Representative
Southwest Greens`;

const templates = [
  { id: "1", name: "Initial Response", subject: "Thank you for your interest in Southwest Greens!" },
  { id: "2", name: "Quote Follow-Up", subject: "Following up on your Southwest Greens proposal" },
  { id: "3", name: "Site Visit Confirmation", subject: "Confirming your site visit appointment" },
  { id: "4", name: "Won Deal Kickoff", subject: "Welcome to the Southwest Greens family!" },
  { id: "5", name: "Re-Engagement", subject: "We still have your spot open — limited availability" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  replied: { label: "Replied", color: "var(--status-green)", bg: "#F0FDF4" },
  auto: { label: "Automated", color: "#64748B", bg: "#F8FAFC" },
  needs_reply: { label: "Needs Reply", color: "var(--status-orange)", bg: "#FFF7ED" },
};

export function CommunicationsView() {
  const [selected, setSelected] = useState("1");
  const [composing, setComposing] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "templates">("inbox");

  const selectedThread = threads.find((t) => t.id === selected);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r flex flex-col bg-white" style={{ borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Communications
            </h3>
            <button
              onClick={() => setComposing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: "var(--brand-green)", fontSize: "12px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Compose
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className="w-full pl-8 pr-3 py-2 border rounded-lg"
              placeholder="Search messages..."
              style={{ fontSize: "12px", borderColor: "var(--border)" }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {(["inbox", "sent", "templates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 capitalize transition-colors"
              style={{
                fontSize: "12px",
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "var(--brand-green)" : "var(--muted-foreground)",
                borderBottom: activeTab === tab ? "2px solid var(--brand-green)" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "templates" ? (
            <div className="p-3 space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                    {t.name}
                  </p>
                  <p className="mt-0.5 truncate" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {t.subject}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            threads.map((thread) => {
              const status = statusConfig[thread.status];
              return (
                <button
                  key={thread.id}
                  onClick={() => setSelected(thread.id)}
                  className="w-full text-left p-4 border-b transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: selected === thread.id ? "var(--brand-light-green)" : thread.unread ? "#FAFFF9" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selected !== thread.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    if (selected !== thread.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = thread.unread ? "#FAFFF9" : "transparent";
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: "var(--brand-green)", fontSize: "11px", fontWeight: 700 }}
                    >
                      {thread.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="truncate"
                          style={{ fontSize: "12px", fontWeight: thread.unread ? 700 : 500, color: "var(--foreground)" }}
                        >
                          {thread.name}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--muted-foreground)", flexShrink: 0, marginLeft: "8px" }}>
                          {thread.time}
                        </span>
                      </div>
                      <p className="truncate" style={{ fontSize: "12px", fontWeight: thread.unread ? 600 : 400, color: "var(--foreground)" }}>
                        {thread.subject}
                      </p>
                      <p className="truncate mt-0.5" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                        {thread.preview}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{ fontSize: "9px", fontWeight: 600, backgroundColor: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                        {thread.tags.slice(0, 1).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded"
                            style={{ fontSize: "9px", backgroundColor: "var(--brand-light-green)", color: "var(--brand-green)" }}
                          >
                            {tag}
                          </span>
                        ))}
                        {thread.unread && (
                          <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ backgroundColor: "var(--brand-green)" }} />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Email View */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {composing ? (
          /* Compose */
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>New Email</h3>
              <button onClick={() => setComposing(false)} className="text-muted-foreground hover:text-foreground" style={{ fontSize: "13px" }}>
                Cancel
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                {[
                  { label: "To", placeholder: "recipient@email.com" },
                  { label: "Subject", placeholder: "Email subject..." },
                ].map((field) => (
                  <div key={field.label} className="flex items-center gap-4 border-b py-2" style={{ borderColor: "var(--border)" }}>
                    <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--muted-foreground)", width: "60px" }}>
                      {field.label}
                    </label>
                    <input
                      className="flex-1 text-foreground outline-none"
                      placeholder={field.placeholder}
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                ))}
                <textarea
                  className="w-full text-foreground placeholder:text-muted-foreground outline-none resize-none"
                  rows={16}
                  placeholder="Write your message..."
                  style={{ fontSize: "13px", lineHeight: 1.7 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white"
                style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted" style={{ fontSize: "13px", borderColor: "var(--border)" }}>
                <Clock className="w-3.5 h-3.5" />
                Schedule
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted" style={{ fontSize: "13px", borderColor: "var(--border)" }}>
                <Paperclip className="w-3.5 h-3.5" />
                Attach
              </button>
            </div>
          </div>
        ) : selectedThread ? (
          <>
            {/* Email Header */}
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
                    {selectedThread.subject}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: statusConfig[selectedThread.status].bg,
                        color: statusConfig[selectedThread.status].color,
                      }}
                    >
                      {statusConfig[selectedThread.status].label}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      Lead: {selectedThread.lead}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border hover:bg-muted" style={{ borderColor: "var(--border)" }}>
                    <Star className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg border hover:bg-muted" style={{ borderColor: "var(--border)" }}>
                    <Archive className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                {/* Sender */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: "var(--brand-green)", fontSize: "13px", fontWeight: 700 }}
                  >
                    MS
                  </div>
                  <div>
                    <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                      Maria Santos → Robert Henderson
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      Today at 10:24 AM · maria@southwestgreens.com
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div
                  className="text-foreground whitespace-pre-wrap"
                  style={{ fontSize: "14px", lineHeight: 1.75, color: "#374151" }}
                >
                  {emailBody}
                </div>
              </div>
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-2 mb-3" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  <Reply className="w-3.5 h-3.5" />
                  Replying to {selectedThread.name}
                </div>
                <textarea
                  rows={3}
                  placeholder="Write your reply..."
                  className="w-full text-foreground placeholder:text-muted-foreground resize-none outline-none"
                  style={{ fontSize: "13px" }}
                />
                <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted" style={{ fontSize: "12px", borderColor: "var(--border)" }}>
                    <Clock className="w-3.5 h-3.5" />
                    Schedule
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted" style={{ fontSize: "12px", borderColor: "var(--border)" }}>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
