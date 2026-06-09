import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLeads } from "../../../hooks/useLeads";
import { LEAD_STATUS_CONFIG, PRIORITY_CONFIG } from "../../../lib/constants";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import {
  getLeadDisplayAddress,
  getLeadFullName,
  getLeadSourceLabel,
  getProjectTypeLabel,
  getRepById,
  leadToTags,
} from "../../../lib/leadHelpers";
import {
  getDefaultLeadStageIndex,
  getLeadStageDetail,
  getLeadWorkspaceStepProgress,
} from "../../../lib/leadWorkspaceHelpers";
import { ROUTES } from "../../../routes/paths";
import {
  Phone,
  Mail,
  MapPin,
  Tag,
  User,
  FileText,
  ArrowLeft,
  DollarSign,
  FileCheck,
  ChevronRight,
} from "lucide-react";

interface LeadDetailViewProps {
  leadId: string;
}

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const navigate = useNavigate();
  const { getLeadById } = useLeads();
  const lead = getLeadById(leadId);

  const stageProgress = useMemo(() => (lead ? getLeadWorkspaceStepProgress(lead) : []), [lead]);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);

  useEffect(() => {
    if (lead) {
      setSelectedStageIndex(getDefaultLeadStageIndex(lead));
    }
  }, [leadId, lead]);

  const stageDetail = useMemo(
    () => (lead ? getLeadStageDetail(lead, selectedStageIndex) : null),
    [lead, selectedStageIndex]
  );

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
            {/* Back to Pipeline */}
            Back
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
        <div className="p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
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
      </div>

      {/* Center Panel — Stage Details */}
      <div className="flex-1 overflow-y-auto bg-emerald-50">
        <div className="mx-auto p-6">
          {stageDetail && (
            <>
              <div className="flex items-center justify-between mb-6 mx-3">
                <div>
                  <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
                    {stageDetail.label}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                    {stageDetail.done ? "Stage completed" : "Stage in progress"} 
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: stageDetail.done ? "var(--brand-light-green)" : "#F1F5F9",
                    color: stageDetail.done ? "var(--brand-green)" : "#64748B",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {stageDetail.done ? "Complete" : "Pending"}
                </span>
              </div>

              {!stageDetail.done && stageDetail.fields.every((f) => f.value === "—") ? (
                <div
                  className="rounded-xl border p-10 text-center"
                  style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA" }}
                >
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "var(--brand-light-green)" }}
                  >
                    <FileCheck className="w-6 h-6" style={{ color: "var(--brand-green)" }} />
                  </div>
                  <p className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {stageDetail.emptyMessage ?? "No details yet"}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                    Complete this stage in the lead workflow to see details here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      className="grid grid-cols-2 gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: "#FAFAFA" }}
                    >
                      {stageDetail.fields.map((field) => (
                        <div key={field.label}>
                          <p
                            style={{
                              fontSize: "10px",
                              color: "var(--muted-foreground)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {field.label}
                          </p>
                          <p style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {stageDetail.listItems && stageDetail.listItems.length > 0 && (
                    <div
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--border)", backgroundColor: "white" }}
                    >
                      <p
                        className="mb-3"
                        style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}
                      >
                        Related Items
                      </p>
                      <div className="space-y-2">
                        {stageDetail.listItems.map((item, index) => (
                          <div
                            key={`${item.primary}-${index}`}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ backgroundColor: "#FAFAFA" }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: "var(--brand-light-green)" }}
                            >
                              <FileText className="w-4 h-4" style={{ color: "var(--brand-green)" }} />
                            </div>
                            <div className="min-w-0">
                              <p style={{ fontSize: "13px", fontWeight: 600 }} className="truncate">
                                {item.primary}
                              </p>
                              {item.secondary && (
                                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                                  {item.secondary}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="w-5 h-5 text-white opacity-80" />
            <p className="text-white" style={{ fontSize: "26px", fontWeight: 700 }}>
              {formatCurrency(lead.estimatedValue)}
            </p>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="p-4">
          <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }} className="mb-1">
            Stage Progress
          </h4>
          <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "12px" }}>
            Click a stage to view its details
          </p>
          <div className="space-y-1.5">
            {stageProgress.map((step) => {
              const isSelected = selectedStageIndex === step.index;
              return (
                <button
                  key={step.index}
                  type="button"
                  onClick={() => setSelectedStageIndex(step.index)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left"
                  style={{
                    backgroundColor: isSelected ? "var(--brand-light-green)" : "transparent",
                    border: isSelected ? "1px solid rgba(46,125,50,0.2)" : "1px solid transparent",
                  }}
                >
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
                    className="flex-1"
                    style={{
                      fontSize: "12px",
                      color: isSelected
                        ? "var(--brand-green)"
                        : step.done
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                      fontWeight: isSelected ? 600 : step.done ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{
                      color: isSelected ? "var(--brand-green)" : "var(--muted-foreground)",
                      opacity: isSelected ? 1 : 0.5,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
