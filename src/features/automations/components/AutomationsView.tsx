import React from "react";
import { useState } from "react";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  ChevronRight,
  Mail,
  Phone,
  Bell,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  MoreHorizontal,
  Users,
  Star,
} from "lucide-react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  steps: number;
  status: "active" | "paused" | "draft";
  runs: number;
  lastRun: string;
  successRate: number;
}

const automations: Automation[] = [
  {
    id: "1",
    name: "New Lead Welcome Sequence",
    trigger: "New Lead Created",
    steps: 5,
    status: "active",
    runs: 342,
    lastRun: "2m ago",
    successRate: 94,
  },
  {
    id: "2",
    name: "No Response Follow-Up (3-Day)",
    trigger: "No Response After 3 Days",
    steps: 4,
    status: "active",
    runs: 189,
    lastRun: "1h ago",
    successRate: 67,
  },
  {
    id: "3",
    name: "Quote Sent Follow-Up",
    trigger: "Quote Status: Sent",
    steps: 6,
    status: "active",
    runs: 98,
    lastRun: "3h ago",
    successRate: 78,
  },
  {
    id: "4",
    name: "Site Visit Completion Tasks",
    trigger: "Site Visit Completed",
    steps: 3,
    status: "active",
    runs: 67,
    lastRun: "Yesterday",
    successRate: 100,
  },
  {
    id: "5",
    name: "Win Celebration & Onboarding",
    trigger: "Deal Stage: Won",
    steps: 7,
    status: "paused",
    runs: 41,
    lastRun: "Jun 2",
    successRate: 100,
  },
  {
    id: "6",
    name: "Re-engagement — Lost Leads (60 Days)",
    trigger: "Lead Lost > 60 Days",
    steps: 3,
    status: "draft",
    runs: 0,
    lastRun: "Never",
    successRate: 0,
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "var(--status-green)", bg: "#F0FDF4" },
  paused: { label: "Paused", color: "var(--status-orange)", bg: "#FFF7ED" },
  draft: { label: "Draft", color: "#64748B", bg: "#F8FAFC" },
};

const workflowSteps = [
  {
    id: "trigger",
    type: "trigger",
    label: "Trigger",
    title: "New Lead Created",
    description: "Fires when a new lead enters the CRM from any source",
    icon: Zap,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    id: "delay1",
    type: "delay",
    label: "Wait",
    title: "Wait 5 minutes",
    description: "Allow time for duplicate detection",
    icon: Clock,
    color: "#64748B",
    bg: "#F8FAFC",
  },
  {
    id: "action1",
    type: "action",
    label: "Action",
    title: "Send Welcome Email",
    description: "Template: 'Thank you for your interest in Southwest Greens'",
    icon: Mail,
    color: "var(--brand-green)",
    bg: "var(--brand-light-green)",
  },
  {
    id: "delay2",
    type: "delay",
    label: "Wait",
    title: "Wait 2 hours",
    description: "Allow time for email open",
    icon: Clock,
    color: "#64748B",
    bg: "#F8FAFC",
  },
  {
    id: "action2",
    type: "action",
    label: "Action",
    title: "Create Task: Call Lead",
    description: "Assign to lead's sales rep — Priority: High, Due: Today +2h",
    icon: Phone,
    color: "var(--status-blue)",
    bg: "#EFF6FF",
  },
  {
    id: "condition",
    type: "condition",
    label: "Condition",
    title: "Lead Responded?",
    description: "Check if email opened or call connected",
    icon: GitBranch,
    color: "#D97706",
    bg: "#FFF7ED",
  },
  {
    id: "action3",
    type: "action",
    label: "Action",
    title: "Notify Sales Rep (Push)",
    description: "Yes: Update stage to 'Qualified' / No: Start No-Response Sequence",
    icon: Bell,
    color: "#DC2626",
    bg: "#FEF2F2",
  },
];

export function AutomationsView() {
  const [selected, setSelected] = useState<string | null>("1");
  const [automationList, setAutomationList] = useState(automations);

  const toggleStatus = (id: string) => {
    setAutomationList((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "paused" : "active" }
          : a
      )
    );
  };

  const selectedAutomation = automationList.find((a) => a.id === selected);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — Automation List */}
      <div
        className="w-80 flex-shrink-0 border-r flex flex-col bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Automations
            </h3>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: "var(--brand-green)", fontSize: "12px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Active", value: automationList.filter((a) => a.status === "active").length, color: "var(--status-green)", bg: "#F0FDF4" },
              { label: "Total Runs", value: automationList.reduce((s, a) => s + a.runs, 0), color: "var(--brand-green)", bg: "var(--brand-light-green)" },
              { label: "Paused", value: automationList.filter((a) => a.status === "paused").length, color: "var(--status-orange)", bg: "#FFF7ED" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-2 rounded-lg"
                style={{ backgroundColor: stat.bg }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: stat.color }}>{stat.value}</span>
                <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {automationList.map((auto) => {
            const status = statusConfig[auto.status];
            const isSelected = selected === auto.id;
            return (
              <button
                key={auto.id}
                onClick={() => setSelected(auto.id)}
                className="w-full text-left p-4 border-b transition-colors"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: isSelected ? "var(--brand-light-green)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? "var(--brand-green)" : "var(--muted)" }}
                    >
                      <Zap className="w-3.5 h-3.5" style={{ color: isSelected ? "white" : "var(--muted-foreground)" }} />
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                        {auto.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ fontSize: "10px", fontWeight: 600, backgroundColor: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                  Trigger: {auto.trigger}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {auto.steps} steps
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {auto.runs} runs
                  </span>
                  {auto.successRate > 0 && (
                    <span style={{ fontSize: "11px", color: "var(--status-green)", fontWeight: 600 }}>
                      {auto.successRate}% success
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow Builder */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
        {selectedAutomation ? (
          <div className="p-6">
            {/* Automation Header */}
            <div
              className="bg-white rounded-xl border p-5 mb-6"
              style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
                    {selectedAutomation.name}
                  </h2>
                  <p className="mt-1" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                    Trigger: {selectedAutomation.trigger}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {[
                      { label: "Total Runs", value: selectedAutomation.runs },
                      { label: "Steps", value: selectedAutomation.steps },
                      { label: "Success Rate", value: `${selectedAutomation.successRate}%` },
                      { label: "Last Run", value: selectedAutomation.lastRun },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-2">
                        <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{stat.label}:</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(selectedAutomation.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      fontSize: "13px",
                      borderColor: "var(--border)",
                      backgroundColor: selectedAutomation.status === "active" ? "#FFF7ED" : "#F0FDF4",
                      color: selectedAutomation.status === "active" ? "var(--status-orange)" : "var(--status-green)",
                    }}
                  >
                    {selectedAutomation.status === "active" ? (
                      <><Pause className="w-4 h-4" /> Pause</>
                    ) : (
                      <><Play className="w-4 h-4" /> Activate</>
                    )}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="flex flex-col items-center max-w-lg mx-auto">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="w-full">
                    <div
                      className="bg-white rounded-xl border p-4 cursor-pointer transition-all hover:border-green-300"
                      style={{
                        borderColor: step.type === "trigger" ? step.color + "60" : "var(--border)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: step.bg }}
                        >
                          <Icon className="w-5 h-5" style={{ color: step.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="px-2 py-0.5 rounded uppercase"
                              style={{ fontSize: "9px", fontWeight: 700, backgroundColor: step.bg, color: step.color, letterSpacing: "0.06em" }}
                            >
                              {step.label}
                            </span>
                          </div>
                          <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {step.title}
                          </p>
                          <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                            {step.description}
                          </p>
                        </div>
                        <button className="p-1.5 rounded-lg hover:bg-muted">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Connector */}
                    {index < workflowSteps.length - 1 && (
                      <div className="flex flex-col items-center py-2">
                        <div className="w-px h-6" style={{ backgroundColor: "var(--border)" }} />
                        <button
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full border hover:bg-white transition-colors"
                          style={{ fontSize: "11px", color: "var(--brand-green)", borderColor: "#86EFAC", backgroundColor: "var(--brand-light-green)" }}
                        >
                          <Plus className="w-3 h-3" />
                          Add Step
                        </button>
                        <div className="w-px h-6" style={{ backgroundColor: "var(--border)" }} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* End Node */}
              <div
                className="mt-4 px-6 py-3 rounded-xl border flex items-center gap-2"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--brand-light-green)" }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--brand-green)" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand-green)" }}>
                  Automation Complete
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Zap className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
              Select an automation to view
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
