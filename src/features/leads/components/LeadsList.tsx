import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  ArrowUpDown,
  UserCircle,
  AlertCircle,
  PlusCircle,
  Eye,
  Edit2,
} from "lucide-react";
import { getLeadWorkflowSection } from "../constants/leadWorkflowSections";
import { useLeads } from "../../../hooks/useLeads";
import {
  leadStatusToPipelineStage,
  leadToTableRow,
  type LeadTableRow,
} from "../../../lib/leadHelpers";
import { ROUTES } from "../../../routes/paths";

interface LeadsListProps {
  onAddLead?: () => void;
  onEditLead?: (leadId: string) => void;
  workflowStep?: string;
}

function LeadRowActions({
  leadId,
  onView,
  onEdit,
}: {
  leadId: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center justify-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onView(leadId)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-700 hover:bg-green-50 transition-colors"
        aria-label="View lead"
        title="View lead"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onEdit(leadId)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Edit lead"
        title="Edit lead"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}

const COLUMNS: { label: string; field: keyof LeadTableRow }[] = [
  { label: "Lead No", field: "leadNumber" },
  { label: "Lead Date", field: "leadDate" },
  { label: "Customer Name", field: "customerName" },
  { label: "Contact Person", field: "contactPerson" },
  { label: "Status", field: "status" },
  { label: "Created By", field: "createdBy" },
  { label: "Lead Source", field: "leadSource" },
  { label: "Lead Type (services)", field: "leadType" },
  { label: "City", field: "city" },
];

export function LeadsList({ onAddLead, onEditLead, workflowStep }: LeadsListProps) {
  const isWorkflowView = Boolean(workflowStep);
  const activeWorkflow = isWorkflowView ? getLeadWorkflowSection(workflowStep) : null;
  const navigate = useNavigate();
  const { leads } = useLeads();
  const [sortField, setSortField] = useState<keyof LeadTableRow>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  const tableRows = useMemo(() => {
    const rows = leads.map(leadToTableRow);
    if (!isWorkflowView || !activeWorkflow) return rows;

    const stageSet = new Set(activeWorkflow.pipelineStages);
    return rows.filter((row) => {
      const lead = leads.find((item) => item.id === row.id);
      if (!lead) return false;
      return stageSet.has(leadStatusToPipelineStage(lead.status));
    });
  }, [leads, isWorkflowView, activeWorkflow]);

  const handleSort = (field: keyof LeadTableRow) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(field === "leadDate" || field === "createdAt" ? false : true);
    }
  };

  const filtered = tableRows
    .filter(
      (l) =>
        l.customerName.toLowerCase().includes(search.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        l.leadNumber.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()) ||
        l.leadSource.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (sortField === "createdAt") {
        const aTime = new Date(String(av)).getTime();
        const bTime = new Date(String(bv)).getTime();
        return sortAsc ? aTime - bTime : bTime - aTime;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  if (leads.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <UserCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-foreground mb-2" style={{ fontSize: "16px", fontWeight: 600 }}>
          No leads yet
        </p>
        <p className="text-muted-foreground mb-6" style={{ fontSize: "14px" }}>
          Add your first lead to start building your pipeline.
        </p>
        <button
          onClick={onAddLead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white"
          style={{ backgroundColor: "#2E7D32", fontSize: "13px" }}
        >
          <PlusCircle className="w-4 h-4" />
          New Lead
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            {isWorkflowView && activeWorkflow ? activeWorkflow.label : "Leads"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isWorkflowView && activeWorkflow
              ? activeWorkflow.description
              : "Manage and track your active project leads."}
          </p>
        </div>
        <button
          onClick={onAddLead}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors"
          style={{ backgroundColor: "#2E7D32", fontSize: "13px" }}
        >
          <PlusCircle className="w-5 h-5" />
          New Lead
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
          style={{ fontSize: "13px" }}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <div
          className="ml-auto px-4 py-2 rounded-xl"
          style={{ backgroundColor: "#E8F5E9" }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#2E7D32" }}>
            {filtered.length} leads
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              {COLUMNS.map((col) => (
                <th key={col.label} className="p-4">
                  <button
                    className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                    onClick={() => handleSort(col.field)}
                  >
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}
              <th className="p-4 text-center sticky right-0 z-30 bg-white border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                style={{
                  backgroundColor: lead.isStale ? "#FFFBEB" : undefined,
                }}
                onClick={() => navigate(ROUTES.leadDetail(lead.id))}
              >
                <td className="p-4 font-semibold" style={{ color: "#2E7D32" }}>
                  #{lead.leadNumber}
                  {lead.isUserAdded && (
                    <span
                      className="ml-2 px-1.5 py-0.5 rounded text-white"
                      style={{ fontSize: "9px", backgroundColor: "#2E7D32" }}
                    >
                      NEW
                    </span>
                  )}
                </td>
                <td className="p-4 text-slate-600">{lead.leadDate}</td>
                <td className="p-4 text-slate-800 font-medium">
                  <div className="flex items-center gap-1.5">
                    {lead.customerName}
                    {lead.isStale && (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-600">{lead.contactPerson}</td>
                <td className="p-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: lead.statusBg,
                      color: lead.statusColor,
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${lead.createdByColor}22`,
                        color: lead.createdByColor,
                      }}
                    >
                      {lead.createdByInitials}
                    </div>
                    <span className="text-slate-600">{lead.createdBy}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{lead.leadSource}</td>
                <td className="p-4 text-slate-600">{lead.leadType}</td>
                <td className="p-4 text-slate-600">{lead.city}</td>
                <td className="p-4 sticky right-0 z-30 bg-white border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  <LeadRowActions
                    leadId={lead.id}
                    onView={(id) => navigate(ROUTES.leadDetail(id))}
                    onEdit={(id) => onEditLead?.(id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
