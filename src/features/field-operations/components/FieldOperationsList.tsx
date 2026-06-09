import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  HardHat,
  X,
  Eye,
} from "lucide-react";
import { useProjects } from "../../../hooks/useProjects";
import { projectStatusFromApi } from "../../projects/constants/projectConstants";
import {
  projectToFieldOperationsTableRow,
  type FieldOperationsTableRow,
} from "../lib/fieldOperationsListHelpers";

interface FieldOperationsListProps {
  onSelectProject?: (projectId: string) => void;
}

const COLUMNS: { label: string; field: keyof FieldOperationsTableRow }[] = [
  { label: "Work Order #", field: "workOrderNumber" },
  { label: "Project Code", field: "projectCode" },
  { label: "Customer Name", field: "customerName" },
  { label: "Job Site Address", field: "jobSiteAddress" },
  { label: "Planned Start", field: "plannedStartDate" },
  { label: "Crew Leader", field: "crewLeader" },
  { label: "Crew Size", field: "crewCount" },
  { label: "Estimated Cost", field: "estimatedCost" },
  { label: "Activities", field: "activitiesProgress" },
  { label: "WO Sent", field: "workOrderSent" },
  { label: "Status", field: "status" },
];

const ALL = "All";

function matchesDateRange(date: string, from: string, to: string): boolean {
  if (!date || date === "—") return !from && !to;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function truncateAddress(address: string, max = 42): string {
  if (address.length <= max) return address;
  return `${address.slice(0, max)}…`;
}

export function FieldOperationsList({ onSelectProject }: FieldOperationsListProps) {
  const { projects } = useProjects();
  const [sortField, setSortField] = useState<keyof FieldOperationsTableRow>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [woSentFilter, setWoSentFilter] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const activeFilterCount = [
    statusFilter !== ALL,
    woSentFilter !== ALL,
    Boolean(dateFrom),
    Boolean(dateTo),
  ].filter(Boolean).length;

  const rowsWithProjects = useMemo(
    () =>
      projects.map((project, index) => ({
        project,
        row: projectToFieldOperationsTableRow(project, index),
      })),
    [projects]
  );

  const filteredRows = useMemo(() => {
    return rowsWithProjects
      .filter(({ project, row }) => {
        const searchLower = search.toLowerCase().trim();
        if (searchLower) {
          const matches =
            row.workOrderNumber.toLowerCase().includes(searchLower) ||
            row.projectCode.toLowerCase().includes(searchLower) ||
            row.customerName.toLowerCase().includes(searchLower) ||
            row.crewLeader.toLowerCase().includes(searchLower) ||
            row.jobSiteAddress.toLowerCase().includes(searchLower);
          if (!matches) return false;
        }

        if (statusFilter !== ALL && projectStatusFromApi(project.status) !== statusFilter) {
          return false;
        }

        if (woSentFilter === "Sent" && !row.workOrderSentRaw) return false;
        if (woSentFilter === "Pending" && row.workOrderSentRaw) return false;

        if (dateFrom || dateTo) {
          if (!matchesDateRange(project.plannedStartDate, dateFrom, dateTo)) return false;
        }

        return true;
      })
      .map(({ row }) => row);
  }, [rowsWithProjects, search, statusFilter, woSentFilter, dateFrom, dateTo]);

  const handleSort = (field: keyof FieldOperationsTableRow) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(
        field === "createdAt" ||
          field === "plannedStartDate" ||
          field === "estimatedCostRaw"
          ? false
          : true
      );
    }
  };

  const sorted = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];

      if (sortField === "createdAt") {
        const aTime = new Date(String(av)).getTime();
        const bTime = new Date(String(bv)).getTime();
        return sortAsc ? aTime - bTime : bTime - aTime;
      }

      if (sortField === "estimatedCostRaw" || sortField === "crewCount") {
        const aNum = Number(av) || 0;
        const bNum = Number(bv) || 0;
        return sortAsc ? aNum - bNum : bNum - aNum;
      }

      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filteredRows, sortField, sortAsc]);

  const clearFilters = () => {
    setStatusFilter(ALL);
    setWoSentFilter(ALL);
    setDateFrom("");
    setDateTo("");
  };

  if (projects.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <HardHat className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-foreground mb-2" style={{ fontSize: "16px", fontWeight: 600 }}>
          No projects yet
        </p>
        <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
          No projects are available for field operations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Field Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage work orders, pick lists, field documents, and on-site activity timelines.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
              placeholder="Search work order, project, customer, crew leader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: "13px" }}
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-slate-50 ${
              activeFilterCount > 0 ? "border-green-600 text-green-700" : "border-slate-200"
            }`}
            style={{ fontSize: "13px" }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: "#2E7D32" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="ml-auto px-4 py-2 rounded-xl" style={{ backgroundColor: "#E8F5E9" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#2E7D32" }}>
              {sorted.length} work orders
            </span>
          </div>
        </div>

        {filtersOpen && (
          <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Filter Field Operations</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Project Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                  style={{ fontSize: "13px" }}
                >
                  <option value={ALL}>All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Work Order Sent
                </label>
                <select
                  value={woSentFilter}
                  onChange={(e) => setWoSentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                  style={{ fontSize: "13px" }}
                >
                  <option value={ALL}>All</option>
                  <option value="Sent">Sent</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Planned Start From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                  style={{ fontSize: "13px" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Planned Start To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Filter className="w-10 h-10 mb-3 opacity-40" />
            <p style={{ fontSize: "14px", fontWeight: 600 }}>No work orders match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-green-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
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
                <th className="sticky top-0 right-0 z-30 p-4 w-[72px] text-center bg-slate-50 border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onSelectProject?.(row.id)}
                >
                  <td className="p-4 font-semibold" style={{ color: "#1565C0" }}>
                    {row.workOrderNumber}
                  </td>
                  <td className="p-4 font-medium" style={{ color: "#2E7D32" }}>
                    {row.projectCode}
                  </td>
                  <td className="p-4 text-slate-800 font-medium">{row.customerName}</td>
                  <td
                    className="p-4 text-slate-600 max-w-[220px] truncate"
                    title={row.jobSiteAddress}
                  >
                    {truncateAddress(row.jobSiteAddress)}
                  </td>
                  <td className="p-4 text-slate-600">{row.plannedStartDate}</td>
                  <td className="p-4 text-slate-800">{row.crewLeader}</td>
                  <td className="p-4 text-slate-600 text-center">{row.crewCount}</td>
                  <td className="p-4 text-slate-800 font-medium">{row.estimatedCost}</td>
                  <td className="p-4 text-slate-600">{row.activitiesProgress}</td>
                  <td className="p-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: row.workOrderSentRaw ? "#E8F5E9" : "#FFF7ED",
                        color: row.workOrderSentRaw ? "#2E7D32" : "#D97706",
                      }}
                    >
                      {row.workOrderSent}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: row.statusBg,
                        color: row.statusColor,
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="sticky right-0 z-10 w-[72px] bg-white group-hover:bg-slate-50 border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectProject?.(row.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                        aria-label="View field operations"
                        title="View field operations"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
