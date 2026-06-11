import React, { useState } from "react";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Calendar,
  User,
  ChevronDown,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Circle,
  Search,
} from "lucide-react";

type TaskStatus = "pending" | "completed" | "overdue";
type Priority = "high" | "medium" | "low";
type View = "list" | "kanban";

interface Task {
  id: string;
  title: string;
  lead: string;
  assignee: string;
  assigneeInitials: string;
  due: string;
  priority: Priority;
  status: TaskStatus;
  type: "call" | "email" | "visit" | "followup" | "quote" | "other";
  description?: string;
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Follow-up call — Henderson pricing discussion",
    lead: "Henderson Estate",
    assignee: "Maria S.",
    assigneeInitials: "MS",
    due: "Today 2:00 PM",
    priority: "high",
    status: "pending",
    type: "call",
    description: "Customer wants to discuss pricing on drainage system and cooling infill options.",
  },
  {
    id: "2",
    title: "Email design samples to Park Estates Dev.",
    lead: "Park Estates Dev.",
    assignee: "Chris W.",
    assigneeInitials: "CW",
    due: "Yesterday 3:00 PM",
    priority: "medium",
    status: "overdue",
    type: "email",
  },
  {
    id: "3",
    title: "Rivera hardscape estimate review",
    lead: "Rivera Pool & Turf",
    assignee: "Chris W.",
    assigneeInitials: "CW",
    due: "Jun 7, 11:00 AM",
    priority: "medium",
    status: "pending",
    type: "followup",
    description: "Tony reviewing phased install estimate for showroom refresh.",
  },
  {
    id: "4",
    title: "Contract review — Park Estates Dev.",
    lead: "Park Estates Dev.",
    assignee: "Chris W.",
    assigneeInitials: "CW",
    due: "Jun 8, 2:00 PM",
    priority: "high",
    status: "pending",
    type: "other",
    description: "Board reviewing putting green proposal before fall tour deadline.",
  },
  {
    id: "5",
    title: "Onboarding call — Sunbelt Properties (Won!)",
    lead: "Sunbelt Properties",
    assignee: "Chris W.",
    assigneeInitials: "CW",
    due: "Jun 9, 10:00 AM",
    priority: "medium",
    status: "pending",
    type: "call",
  },
  {
    id: "6",
    title: "Send welcome package to Sunbelt Properties",
    lead: "Sunbelt Properties",
    assignee: "Alex J.",
    assigneeInitials: "AJ",
    due: "Jun 3, 4:00 PM",
    priority: "low",
    status: "completed",
    type: "email",
  },
];

const priorityColors: Record<Priority, string> = {
  high: "var(--status-red)",
  medium: "var(--status-orange)",
  low: "var(--status-green)",
};
const priorityBg: Record<Priority, string> = {
  high: "#FEF2F2",
  medium: "#FFF7ED",
  low: "#F0FDF4",
};

const typeConfig: Record<Task["type"], { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, color: string; bg: string }> = {
  call: { icon: Phone, color: "var(--status-blue)", bg: "#EFF6FF" },
  email: { icon: Mail, color: "var(--brand-green)", bg: "var(--brand-light-green)" },
  visit: { icon: MapPin, color: "var(--status-orange)", bg: "#FFF7ED" },
  followup: { icon: Clock, color: "#7C3AED", bg: "#F5F3FF" },
  quote: { icon: CheckSquare, color: "var(--status-green)", bg: "#F0FDF4" },
  other: { icon: MoreHorizontal, color: "#64748B", bg: "#F8FAFC" },
};

const repColors: Record<string, string> = {
  MS: "#2E7D32",
  AJ: "#0284C7",
  EC: "#7C3AED",
  CW: "#D97706",
};

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const TypeIcon = typeConfig[task.type].icon;
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-green-200"
      style={{
        backgroundColor: isCompleted ? "#FAFAFA" : "white",
        borderColor: isOverdue ? "#FECACA" : "var(--border)",
        boxShadow: isCompleted ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 transition-colors"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
        ) : (
          <Circle className="w-5 h-5" style={{ color: isOverdue ? "var(--status-red)" : "var(--muted-foreground)" }} />
        )}
      </button>

      {/* Type Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: typeConfig[task.type].bg }}
      >
        <TypeIcon className="w-4 h-4" style={{ color: typeConfig[task.type].color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-foreground"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: isCompleted ? "line-through" : "none",
              color: isCompleted ? "var(--muted-foreground)" : "var(--foreground)",
            }}
          >
            {task.title}
          </p>
          {isOverdue && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF2F2" }}>
              <AlertCircle className="w-3 h-3" style={{ color: "var(--status-red)" }} />
              <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--status-red)" }}>Overdue</span>
            </div>
          )}
        </div>
        {task.description && (
          <p className="mt-0.5 truncate" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span
            className="px-2 py-0.5 rounded"
            style={{ fontSize: "10px", fontWeight: 500, backgroundColor: "var(--brand-light-green)", color: "var(--brand-green)" }}
          >
            {task.lead}
          </span>
        </div>
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Clock className="w-3.5 h-3.5" style={{ color: isOverdue ? "var(--status-red)" : "var(--muted-foreground)" }} />
        <span
          style={{
            fontSize: "12px",
            color: isOverdue ? "var(--status-red)" : "var(--muted-foreground)",
            fontWeight: isOverdue ? 600 : 400,
          }}
        >
          {task.due}
        </span>
      </div>

      {/* Priority */}
      <div
        className="px-2.5 py-1 rounded-full flex-shrink-0"
        style={{
          backgroundColor: priorityBg[task.priority],
          color: priorityColors[task.priority],
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        {task.priority}
      </div>

      {/* Assignee */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{
          backgroundColor: repColors[task.assigneeInitials] || "var(--brand-green)",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        {task.assigneeInitials}
      </div>

      {/* More */}
      <button className="p-1 rounded hover:bg-muted flex-shrink-0">
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function TasksView() {
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [filter, setFilter] = useState<"all" | "my" | "overdue" | "today">("all");

  const toggleTask = (id: string) => {
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const filtered = taskList.filter((t) => {
    if (filter === "overdue") return t.status === "overdue";
    if (filter === "today") return t.due.startsWith("Today");
    if (filter === "my") return t.assigneeInitials === "AJ";
    return true;
  });

  const counts = {
    all: taskList.length,
    my: taskList.filter((t) => t.assigneeInitials === "AJ").length,
    overdue: taskList.filter((t) => t.status === "overdue").length,
    today: taskList.filter((t) => t.due.startsWith("Today")).length,
  };

  const pending = filtered.filter((t) => t.status !== "completed");
  const completed = filtered.filter((t) => t.status === "completed");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border bg-white" style={{ borderColor: "var(--border)" }}>
          {(["all", "my", "today", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg capitalize transition-all"
              style={{
                fontSize: "13px",
                fontWeight: filter === f ? 600 : 400,
                backgroundColor: filter === f ? "var(--brand-green)" : "transparent",
                color: filter === f ? "white" : "var(--muted-foreground)",
              }}
            >
              {f === "overdue" ? "Overdue" : f === "today" ? "Today" : f === "my" ? "My Tasks" : "All Tasks"}
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: filter === f ? "rgba(255,255,255,0.25)" : "var(--muted)",
                  color: filter === f ? "white" : "var(--muted-foreground)",
                }}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className="pl-8 pr-4 py-2 border rounded-lg bg-white"
              placeholder="Search tasks..."
              style={{ fontSize: "13px", borderColor: "var(--border)" }}
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white hover:bg-muted" style={{ fontSize: "13px", borderColor: "var(--border)" }}>
            <User className="w-3.5 h-3.5" />
            Assignee
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks", value: counts.all, color: "var(--brand-green)", bg: "var(--brand-light-green)" },
          { label: "Due Today", value: counts.today, color: "var(--status-blue)", bg: "#EFF6FF" },
          { label: "Overdue", value: counts.overdue, color: "var(--status-red)", bg: "#FEF2F2" },
          { label: "Completed", value: completed.length, color: "var(--status-green)", bg: "#F0FDF4" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border"
            style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: stat.bg }}
            >
              <span style={{ fontSize: "16px", fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
            <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {/* Pending */}
        <div>
          <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            Pending ({pending.length})
          </h4>
          <div className="space-y-2">
            {pending.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </div>
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h4 className="mb-3" style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted-foreground)" }}>
              Completed ({completed.length})
            </h4>
            <div className="space-y-2">
              {completed.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
