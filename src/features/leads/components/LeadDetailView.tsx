import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useLeads } from "../../../hooks/useLeads";
import { LEAD_STATUS_CONFIG, PRIORITY_CONFIG } from "../../../lib/constants";
import { formatCurrency, formatDate, formatRelativeTime } from "../../../lib/formatters";
import {
  getLeadDisplayAddress,
  getLeadFullName,
  getLeadSourceLabel,
  getProjectTypeLabel,
  getRepById,
  leadToTags,
} from "../../../lib/leadHelpers";
import { ROUTES } from "../../../routes/paths";
import type { Lead } from "../../../types/lead";
import {
  Phone,
  Mail,
  MapPin,
  Tag,
  User,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  Star,
  Edit2,
  ArrowLeft,
  Clock,
  TrendingUp,
  DollarSign,
  Percent,
  Send,
  PlusCircle,
  Video,
  Home,
} from "lucide-react";

interface LeadDetailViewProps {
  leadId: string;
}

function buildLeadTimeline(lead: Lead) {
  const rep = getRepById(lead.assignedRep);
  const items = [
    {
      id: "created",
      user: rep.name,
      userInitials: rep.initials,
      time: formatRelativeTime(lead.createdAt),
      title: "New Lead Created",
      body: `Lead #${lead.leadNumber} captured via ${getLeadSourceLabel(lead.leadSource)}. Project: ${getProjectTypeLabel(lead.projectType)}.${lead.customerRequirements ? ` Requirements: ${lead.customerRequirements}` : ""}`,
      icon: PlusCircle,
      iconBg: "#F0FDF4",
      iconColor: "var(--brand-green)",
    },
  ];

  const wd = lead.workflowData;
  if (wd?.visitDate || wd?.siteVisitScheduledDate) {
    const visitDate = wd.visitDate || wd.siteVisitScheduledDate;
    items.unshift({
      id: "site-visit",
      user: wd.surveyedBy || rep.name,
      userInitials: rep.initials,
      time: visitDate ? formatDate(visitDate) : formatRelativeTime(lead.updatedAt),
      title: `Site Visit ${wd.visitStatus ?? "Scheduled"}`,
      body: `Site visit ${(wd.visitStatus ?? "scheduled").toLowerCase()}${wd.visitTime ? ` at ${wd.visitTime}` : ""} for ${getLeadDisplayAddress(lead)}.`,
      icon: Home,
      iconBg: "#FFF7ED",
      iconColor: "var(--status-orange)",
    });
  }

  if (lead.internalNotes) {
    items.unshift({
      id: "notes",
      user: rep.name,
      userInitials: rep.initials,
      time: formatRelativeTime(lead.updatedAt),
      title: "Internal Notes",
      body: lead.internalNotes,
      icon: FileText,
      iconBg: "#EFF6FF",
      iconColor: "var(--status-blue)",
    });
  }

  return items;
}

const STAGE_PROGRESS = [
  { label: "New Inquiry", statuses: ["new"] },
  { label: "Contact Attempted", statuses: ["contacted", "nurturing"] },
  { label: "Qualified", statuses: ["consulted"] },
  { label: "Site Visit", statuses: ["consulted"] },
  { label: "Estimate Sent", statuses: ["quoted"] },
  { label: "Negotiation", statuses: ["quoted"] },
  { label: "Won", statuses: ["won"] },
] as const;

function getStageProgress(lead: Lead) {
  const statusOrder = ["new", "contacted", "nurturing", "consulted", "quoted", "won"];
  const currentIndex = statusOrder.indexOf(lead.status);
  return STAGE_PROGRESS.map((step, index) => ({
    label: step.label,
    done: lead.status === "won" ? true : index <= currentIndex,
  }));
}

function getCloseProbability(status: Lead["status"]): number {
  const map: Record<Lead["status"], number> = {
    new: 10,
    contacted: 25,
    nurturing: 20,
    consulted: 45,
    quoted: 62,
    won: 100,
    lost: 0,
  };
  return map[status];
}

const openTasks = [
  { id: 1, title: "Send final quote with material samples", due: "Jun 6, 5:00 PM", priority: "high" },
  { id: 2, title: "Follow up on drainage concern", due: "Jun 7, 9:00 AM", priority: "medium" },
  { id: 3, title: "Schedule contract signing call", due: "Jun 8, 2:00 PM", priority: "medium" },
];

const teamMembers = [
  { name: "Maria Santos", role: "Sales Rep", initials: "MS", color: "var(--brand-green)" },
  { name: "Alex Johnson", role: "Sales Mgr", initials: "AJ", color: "#0284C7" },
  { name: "Carlos Ruiz", role: "Estimator", initials: "CR", color: "#7C3AED" },
];

const priorityColors: Record<string, string> = {
  high: "var(--status-red)",
  medium: "var(--status-orange)",
  low: "var(--status-green)",
};
const priorityBg: Record<string, string> = {
  high: "#FEF2F2",
  medium: "#FFF7ED",
  low: "#F0FDF4",
};

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const navigate = useNavigate();
  const { getLeadById } = useLeads();
  const lead = getLeadById(leadId);

  const timeline = useMemo(() => (lead ? buildLeadTimeline(lead) : []), [lead]);
  const stageProgress = useMemo(() => (lead ? getStageProgress(lead) : []), [lead]);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-foreground mb-2" style={{ fontSize: "16px", fontWeight: 600 }}>
          Lead not found
        </p>
        <p className="text-muted-foreground mb-4" style={{ fontSize: "14px" }}>
          The lead you are looking for does not exist or was removed.
        </p>
        <button
          onClick={() => navigate(ROUTES.leads)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>
      </div>
    );
  }

  const rep = getRepById(lead.assignedRep);
  const statusConfig = LEAD_STATUS_CONFIG[lead.status];
  const priorityConfig = PRIORITY_CONFIG[lead.priority];
  const tags = leadToTags(lead);
  const probability = getCloseProbability(lead.status);
  const leadName = getLeadFullName(lead);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div
        className="w-72 flex-shrink-0 border-r overflow-y-auto bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Back */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => navigate(ROUTES.leads)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pipeline
          </button>

          {/* Stage Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: statusConfig.bg, fontSize: "12px", fontWeight: 600, color: statusConfig.color }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
            {statusConfig.label}
          </div>

          <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
            {lead.company || leadName}
          </h2>
          <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            Lead #{lead.leadNumber} · Created {formatDate(lead.createdAt)}
          </p>
        </div>

        {/* Contact Info */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border)" }}>
          <h4 style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Contact Information
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{leadName}</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                  {lead.propertyType.charAt(0).toUpperCase() + lead.propertyType.slice(1)}
                </p>
              </div>
            </div>

            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-green-700 transition-colors" style={{ color: "var(--foreground)" }}>
              <Phone className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />
              <span style={{ fontSize: "13px" }}>{lead.phone}</span>
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-green-700 transition-colors" style={{ color: "var(--foreground)" }}>
              <Mail className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />
              <span style={{ fontSize: "13px" }}>{lead.email}</span>
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
              <span style={{ fontSize: "13px", color: "var(--foreground)" }}>{getLeadDisplayAddress(lead)}</span>
            </div>
          </div>
        </div>

        {/* Lead Source & Tags */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border)" }}>
          <h4 style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Lead Details
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Source</span>
              <span
                className="px-2 py-0.5 rounded"
                style={{ backgroundColor: "#EFF6FF", color: "#0284C7", fontSize: "11px", fontWeight: 600 }}
              >
                {getLeadSourceLabel(lead.leadSource)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Priority</span>
              <span
                className="px-2 py-0.5 rounded"
                style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color, fontSize: "11px", fontWeight: 600 }}
              >
                {priorityConfig.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Property Size</span>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>
                {lead.squareFootageEstimate ? `~${lead.squareFootageEstimate.toLocaleString()} sq ft` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Project Type</span>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>{getProjectTypeLabel(lead.projectType)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Assigned Rep</span>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>{rep.name}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--brand-light-green)", color: "var(--brand-green)", fontSize: "11px" }}
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h4 style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }} className="mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            {[
              { icon: Phone, label: "Log Call", color: "var(--status-blue)", bg: "#EFF6FF" },
              { icon: Mail, label: "Send Email", color: "var(--brand-green)", bg: "var(--brand-light-green)" },
              { icon: Calendar, label: "Schedule Meeting", color: "#7C3AED", bg: "#F5F3FF" },
              { icon: FileText, label: "Create Quote", color: "var(--status-orange)", bg: "#FFF7ED" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-muted"
                  style={{ borderColor: "var(--border)", fontSize: "13px" }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: action.bg }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  </div>
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center Panel — Timeline */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
              Activity Timeline
            </h3>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Add Note
            </button>
          </div>

          {/* Compose Area */}
          <div
            className="rounded-xl border p-4 mb-6"
            style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <textarea
              rows={3}
              placeholder="Add a note, log a call, or record an update..."
              className="w-full text-foreground placeholder:text-muted-foreground resize-none outline-none"
              style={{ fontSize: "13px", backgroundColor: "transparent" }}
            />
            <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              {[
                { icon: Phone, label: "Call", color: "var(--status-blue)", bg: "#EFF6FF" },
                { icon: Mail, label: "Email", color: "var(--brand-green)", bg: "var(--brand-light-green)" },
                { icon: Calendar, label: "Meeting", color: "#7C3AED", bg: "#F5F3FF" },
                { icon: Home, label: "Site Visit", color: "var(--status-orange)", bg: "#FFF7ED" },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-muted"
                    style={{ fontSize: "12px", borderColor: "var(--border)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: type.color }} />
                    {type.label}
                  </button>
                );
              })}
              <button
                className="ml-auto px-4 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: "var(--brand-green)", fontSize: "12px" }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute left-6 top-0 bottom-0 w-px"
              style={{ backgroundColor: "var(--border)" }}
            />
            <div className="space-y-6">
              {timeline.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex gap-4 relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white z-10"
                      style={{ backgroundColor: item.iconBg, boxShadow: "0 0 0 2px var(--border)" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.iconColor }} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div
                        className="rounded-xl border p-4"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "white",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: "var(--brand-green)", fontSize: "8px", fontWeight: 700 }}
                              >
                                {item.userInitials}
                              </div>
                              <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                                {item.user} · {item.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="w-72 flex-shrink-0 border-l overflow-y-auto bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Deal Value */}
        <div
          className="p-4 border-b"
          style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--brand-dark-green), var(--brand-green))" }}
        >
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Estimated Value</p>
          <p className="text-white" style={{ fontSize: "26px", fontWeight: 700 }}>
            {formatCurrency(lead.estimatedValue)}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>Probability</p>
              <div className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-white" />
                <p className="text-white" style={{ fontSize: "14px", fontWeight: 700 }}>{probability}%</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>Next Follow-up</p>
              <p className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>
                {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : "Not set"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <div className="h-full rounded-full" style={{ width: `${probability}%`, backgroundColor: "#4CAF50" }} />
            </div>
          </div>
        </div>

        {/* Open Tasks */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>Open Tasks</h4>
            <button
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              style={{ fontSize: "12px" }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {openTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border"
                style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA" }}
              >
                <input type="checkbox" className="mt-0.5 rounded flex-shrink-0" style={{ accentColor: "var(--brand-green)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                    <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{task.due}</span>
                  </div>
                </div>
                <div
                  className="px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: priorityBg[task.priority],
                    color: priorityColors[task.priority],
                    fontSize: "9px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>Team</h4>
            <button className="text-muted-foreground hover:text-foreground" style={{ fontSize: "12px" }}>
              Manage
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: rep.color, fontSize: "11px", fontWeight: 700 }}
              >
                {rep.initials}
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{rep.name}</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Sales Rep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="p-4">
          <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }} className="mb-3">
            Stage Progress
          </h4>
          <div className="space-y-2">
            {stageProgress.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: step.done ? "var(--brand-green)" : "var(--border)",
                  }}
                >
                  {step.done && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: step.done ? "var(--foreground)" : "var(--muted-foreground)",
                    fontWeight: step.done ? 500 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
