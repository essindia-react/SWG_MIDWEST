import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../routes/paths";
import {
  MoreHorizontal,
  MapPin,
  User,
  TrendingUp,
  Plus,
  Filter,
  Search,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useLeads } from "../../../hooks/useLeads";
import { getCustomerById } from "../../projects/constants/projectConstants";
import {
  customerToLeadFormInput,
  findLeadForCustomer,
  leadToPipelineCard,
  type PipelineLeadCard,
  type PipelineStage,
} from "../../../lib/leadHelpers";
import { formatCurrency } from "../../../lib/formatters";
import { AddPipelineLeadModal } from "./AddPipelineLeadModal";

type Stage = PipelineStage;
type Lead = PipelineLeadCard;

const stages: { id: Stage; label: string; color: string; bg: string }[] = [
  { id: "new", label: "New Inquiry", color: "#64748B", bg: "#F8FAFC" },
  { id: "site_visit", label: "Site Visit", color: "#D97706", bg: "#FFFBEB" },
  {
    id: "design",
    label: "Design",
    color: "#0284C7",
    bg: "#EFF6FF",
  },
  {
    id: "estimate_sent",
    label: "Estimation",
    color: "#EA580C",
    bg: "#FFF7ED",
  },
  {
    id: "proposal_sent",
    label: "Proposal Sent",
    color: "#0284C7",
    bg: "#EFF6FF",
  },
  { id: "won", label: "Won", color: "#16A34A", bg: "#F0FDF4" },
  { id: "lost", label: "Lost", color: "#94A3B8", bg: "#F8FAFC" },
];

const priorityColors: Record<string, string> = {
  urgent: "var(--status-red)",
  high: "var(--status-red)",
  medium: "var(--status-orange)",
  low: "var(--status-green)",
};

const sourceColors: Record<string, string> = {
  "Google Ads": "#0284C7",
  Referral: "#16A34A",
  Website: "#2E7D32",
  "Facebook Ads": "#7C3AED",
  Organic: "#64748B",
  "Phone Call": "#D97706",
};

function LeadCard({
  lead,
  onDragStart,
  onClick,
}: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (lead: Lead) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onClick(lead)}
      className="bg-white rounded-xl border p-3.5 cursor-pointer transition-all hover:border-green-300 active:opacity-80 group"
      style={{
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 12px rgba(46,125,50,0.12)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#86EFAC";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: priorityColors[lead.priority] }}
            />
            <p
              className="text-foreground truncate"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              {lead.name}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <MapPin
              className="w-3 h-3 flex-shrink-0"
              style={{ color: "var(--muted-foreground)" }}
            />
            <p
              className="truncate"
              style={{ fontSize: "11px", color: "var(--muted-foreground)" }}
            >
              {lead.address}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Value */}
      <div
        className="text-foreground mb-2.5"
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--brand-green)",
        }}
      >
        ${lead.value.toLocaleString()}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {lead.tags.map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded"
            style={{
              fontSize: "10px",
              fontWeight: 500,
              backgroundColor: "var(--brand-light-green)",
              color: "var(--brand-green)",
            }}
          >
            {tag}
          </span>
        ))}
        <span
          className="px-1.5 py-0.5 rounded"
          style={{
            fontSize: "10px",
            fontWeight: 500,
            backgroundColor: sourceColors[lead.source]
              ? `${sourceColors[lead.source]}15`
              : "#F1F5F9",
            color: sourceColors[lead.source] || "#64748B",
          }}
        >
          {lead.source}
        </span>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white"
            style={{
              backgroundColor: "var(--brand-green)",
              fontSize: "9px",
              fontWeight: 700,
            }}
          >
            {lead.repInitials}
          </div>
          <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
            {lead.rep}
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
          {lead.lastActivity}
        </span>
      </div>

      {/* Days in stage warning */}
      {lead.daysInStage > 5 && (
        <div
          className="mt-2 flex items-center gap-1 px-2 py-1 rounded"
          style={{ backgroundColor: "#FFF7ED" }}
        >
          <AlertCircle
            className="w-3 h-3"
            style={{ color: "var(--status-orange)" }}
          />
          <span
            style={{
              fontSize: "10px",
              color: "var(--status-orange)",
              fontWeight: 500,
            }}
          >
            {lead.daysInStage} days in stage
          </span>
        </div>
      )}
    </div>
  );
}

export function PipelineBoard() {
  const navigate = useNavigate();
  const { leads: crmLeads, addLead, updateLeadPipelineStage } = useLeads();
  const leads = useMemo(() => crmLeads.map(leadToPipelineCard), [crmLeads]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [addLeadStage, setAddLeadStage] = useState<Stage | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (dragId) {
      updateLeadPipelineStage(dragId, stage);
    }
    setDragId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverStage(null);
  };

  const handleSelectCustomer = (customerId: string) => {
    if (!addLeadStage) return;

    const customer = getCustomerById(customerId);
    if (!customer) return;

    const existingLead = findLeadForCustomer(crmLeads, customer);
    if (existingLead) {
      updateLeadPipelineStage(existingLead.id, addLeadStage);
    } else {
      addLead(customerToLeadFormInput(customer, addLeadStage));
    }

    setAddLeadStage(null);
  };

  const stageLeads = (stage: Stage) => leads.filter((l) => l.stage === stage);
  const stageValue = (stage: Stage) =>
    stageLeads(stage).reduce((sum, l) => sum + l.value, 0);
  const totalPipeline = leads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-4 bg-white border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="relative flex-1 max-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-foreground"
            placeholder="Search leads..."
            style={{ fontSize: "13px", borderColor: "var(--border)" }}
          />
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-muted"
          style={{ fontSize: "13px", borderColor: "var(--border)" }}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-muted"
          style={{ fontSize: "13px", borderColor: "var(--border)" }}
        >
          <User className="w-3.5 h-3.5" />
          All Reps
          <ChevronDown className="w-3 h-3" />
        </button>
        <div
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ backgroundColor: "var(--brand-light-green)" }}
        >
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "var(--brand-green)" }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--brand-green)",
            }}
          >
            Pipeline: {formatCurrency(totalPipeline)}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {stages.map((stage) => {
            const cards = stageLeads(stage.id);
            const value = stageValue(stage.id);
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-xl border w-64 flex-shrink-0"
                style={{
                  backgroundColor: isOver ? "#F0FDF4" : "#F8FAFC",
                  borderColor: isOver ? "#86EFAC" : "var(--border)",
                  minHeight: "500px",
                  transition: "all 0.15s ease",
                }}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragLeave={() => setDragOverStage(null)}
              >
                {/* Stage Header */}
                <div
                  className="px-4 py-3 border-b rounded-t-xl"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: stage.bg,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: stage.color,
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded-full text-white"
                      style={{
                        backgroundColor: stage.color,
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {cards.length}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    ${value.toLocaleString()}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {cards.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onDragStart={handleDragStart}
                      onClick={(l) => navigate(ROUTES.leadDetail(l.id))}
                    />
                  ))}

                  {/* Add Card Button */}
                  <button
                    onClick={() => setAddLeadStage(stage.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed transition-colors"
                    style={{
                      borderColor: stage.color + "50",
                      color: "var(--muted-foreground)",
                    }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = stage.bg;
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "transparent";
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span style={{ fontSize: "12px" }}>Add lead</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddPipelineLeadModal
        open={addLeadStage !== null}
        stage={addLeadStage}
        onClose={() => setAddLeadStage(null)}
        onSelectCustomer={handleSelectCustomer}
      />
    </div>
  );
}
