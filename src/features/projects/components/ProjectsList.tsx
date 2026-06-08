import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  FolderKanban,
  PlusCircle,
  X,
  Eye,
  Edit2,
} from "lucide-react";
import { useProjects } from "../../../hooks/useProjects";
import { isUserAddedProject } from "../../../lib/projectStorage";
import { projectToTableRow, type ProjectTableRow } from "../../../lib/projectHelpers";
import {
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  projectStatusFromApi,
} from "../constants/projectConstants";
import type { Project } from "../../../types/project";

interface ProjectsListProps {
  onAddProject?: () => void;
  onSelectProject?: (projectId: string) => void;
  onEditProject?: (projectId: string) => void;
  title?: string;
  subtitle?: string;
  showAddButton?: boolean;
  showEditAction?: boolean;
}

function ProjectRowActions({
  projectId,
  onView,
  onEdit,
}: {
  projectId: string;
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
        onClick={() => onView(projectId)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-700 hover:bg-green-50 transition-colors"
        aria-label="View project"
        title="View project"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onEdit(projectId)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Edit project"
        title="Edit project"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}

const COLUMNS: { label: string; field: keyof ProjectTableRow }[] = [
  { label: "Project Code", field: "projectCode" },
  { label: "Project Date", field: "projectDate" },
  { label: "Customer Name", field: "customerName" },
  { label: "Project Type", field: "projectType" },
  { label: "Status", field: "status" },
  { label: "Project Manager", field: "projectManager" },
  { label: "Project Value", field: "projectValue" },
  { label: "Planned Start", field: "plannedStartDate" },
  { label: "Planned End", field: "plannedEndDate" },
];

const ALL = "All";

function matchesDateRange(
  date: string,
  from: string,
  to: string
): boolean {
  if (!date) return !from && !to;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function ProjectsList({
  onAddProject,
  onSelectProject,
  onEditProject,
  title = "Project Management",
  subtitle = "Manage active projects, teams, milestones, and documentation.",
  showAddButton = true,
  showEditAction = true,
}: ProjectsListProps) {
  const { projects } = useProjects();
  const [sortField, setSortField] = useState<keyof ProjectTableRow>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const activeFilterCount = [
    statusFilter !== ALL,
    typeFilter !== ALL,
    Boolean(dateFrom),
    Boolean(dateTo),
  ].filter(Boolean).length;

  const filteredProjects = useMemo(() => {
    return projects.filter((project: Project) => {
      const searchLower = search.toLowerCase().trim();
      if (searchLower) {
        const matchesCustomer = project.customerName.toLowerCase().includes(searchLower);
        const matchesManager = project.projectManager.toLowerCase().includes(searchLower);
        if (!matchesCustomer && !matchesManager) return false;
      }

      if (statusFilter !== ALL) {
        const label = projectStatusFromApi(project.status);
        if (label !== statusFilter) return false;
      }

      if (typeFilter !== ALL && project.projectType !== typeFilter) {
        return false;
      }

      if (dateFrom || dateTo) {
        const inProjectDate = matchesDateRange(project.projectDate, dateFrom, dateTo);
        const inPlannedStart = matchesDateRange(project.plannedStartDate, dateFrom, dateTo);
        const inPlannedEnd = matchesDateRange(project.plannedEndDate, dateFrom, dateTo);
        if (!inProjectDate && !inPlannedStart && !inPlannedEnd) return false;
      }

      return true;
    });
  }, [projects, search, statusFilter, typeFilter, dateFrom, dateTo]);

  const tableRows = useMemo(
    () =>
      filteredProjects.map((p) => projectToTableRow(p, isUserAddedProject(p))),
    [filteredProjects]
  );

  const handleSort = (field: keyof ProjectTableRow) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(field === "projectDate" || field === "createdAt" ? false : true);
    }
  };

  const sorted = useMemo(() => {
    return [...tableRows].sort((a, b) => {
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
  }, [tableRows, sortField, sortAsc]);

  const clearFilters = () => {
    setStatusFilter(ALL);
    setTypeFilter(ALL);
    setDateFrom("");
    setDateTo("");
  };

  if (projects.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-foreground mb-2" style={{ fontSize: "16px", fontWeight: 600 }}>
          No projects yet
        </p>
        <p className="text-muted-foreground mb-6" style={{ fontSize: "14px" }}>
          {showAddButton
            ? "Create your first project to start managing milestones and teams."
            : "No projects are available for field operations yet."}
        </p>
        {showAddButton && (
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white"
            style={{ backgroundColor: "#2E7D32", fontSize: "13px" }}
          >
            <PlusCircle className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        {showAddButton && (
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors"
            style={{ backgroundColor: "#2E7D32", fontSize: "13px" }}
          >
            <PlusCircle className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
              placeholder="Search customer or manager..."
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
              {sorted.length} projects
            </span>
          </div>
        </div>

        {filtersOpen && (
          <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Filter Projects</span>
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
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                  style={{ fontSize: "13px" }}
                >
                  <option value={ALL}>All Statuses</option>
                  {PROJECT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Project Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
                  style={{ fontSize: "13px" }}
                >
                  <option value={ALL}>All Types</option>
                  {PROJECT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Date From
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
                  Date To
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
            <p className="text-xs text-slate-400 mt-2">
              Date filter matches project date, planned start, or planned end.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Filter className="w-10 h-10 mb-3 opacity-40" />
            <p style={{ fontSize: "14px", fontWeight: 600 }}>No projects match your filters</p>
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
                <th className="sticky top-0 right-0 z-30 p-4 w-[88px] text-center bg-slate-50 border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {sorted.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onSelectProject?.(project.id)}
                >
                  <td className="p-4 font-semibold" style={{ color: "#2E7D32" }}>
                    {project.projectCode}
                    {project.isUserAdded && (
                      <span
                        className="ml-2 px-1.5 py-0.5 rounded text-white"
                        style={{ fontSize: "9px", backgroundColor: "#2E7D32" }}
                      >
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{project.projectDate}</td>
                  <td className="p-4 text-slate-800 font-medium">{project.customerName}</td>
                  <td className="p-4 text-slate-600">{project.projectType}</td>
                  <td className="p-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: project.statusBg,
                        color: project.statusColor,
                      }}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{project.projectManager}</td>
                  <td className="p-4 text-slate-600">{project.projectValue}</td>
                  <td className="p-4 text-slate-600">{project.plannedStartDate}</td>
                  <td className="p-4 text-slate-600">{project.plannedEndDate}</td>
                  <td className="sticky right-0 z-10 w-[88px] bg-white group-hover:bg-slate-50 border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                    {showEditAction ? (
                      <ProjectRowActions
                        projectId={project.id}
                        onView={(id) => onSelectProject?.(id)}
                        onEdit={(id) => onEditProject?.(id)}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectProject?.(project.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                          aria-label="View field operations"
                          title="View field operations"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
