import React, { useMemo, useState } from "react";
import { useHR } from "../../hooks/useHR";
import { TimesheetSummaryTable } from "../../features/hr/components/TimesheetSummaryTable";
import {
  Clock,
  Timer,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import { formatCurrency } from "../../lib/formatters";

export function TimesheetSummaryPage() {
  const { timesheets, employees } = useHR();
  
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return timesheets.filter((ts) => {
      const employee = employees.find((e) => e.id === ts.employeeId);
      const name = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : "";
      
      const matchesSearch = name.includes(search.toLowerCase());
      const matchesEmployee = employeeFilter === "All" || ts.employeeId === employeeFilter;
      const matchesStatus = statusFilter === "All" || ts.status === statusFilter;
      
      return matchesSearch && matchesEmployee && matchesStatus && ts.clockOutTime;
    });
  }, [timesheets, employees, search, employeeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = filtered.reduce((acc, ts) => acc + (ts.totalHours || 0), 0);
    const regular = filtered.reduce((acc, ts) => acc + Math.min(ts.totalHours || 0, 8), 0);
    const ot = filtered.reduce((acc, ts) => acc + Math.max(0, (ts.totalHours || 0) - 8), 0);
    const pending = filtered.filter((ts) => ts.status === "Pending").length;
    
    return { total, regular, ot, pending };
  }, [filtered]);

  const statCards = [
    { label: "Regular Hours", value: `${stats.regular.toFixed(1)}h`, icon: Clock, color: "#0284C7", bg: "#EFF6FF" },
    { label: "Overtime Hours", value: `${stats.ot.toFixed(1)}h`, icon: AlertCircle, color: "#D97706", bg: "#FFF7ED" },
    { label: "Total Hours", value: `${stats.total.toFixed(1)}h`, icon: Timer, color: "#2E7D32", bg: "#F0FDF4" },
    { label: "Pending Approvals", value: stats.pending, icon: CheckCircle2, color: "#7C3AED", bg: "#F5F3FF" },
  ];

  return (
    <div className="p-6 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Timesheet Summary</h1>
        <p className="text-sm text-slate-500 mt-1">Review, approve, and sync employee work hours with payroll.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex-shrink-0 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500 transition-colors"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="All">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>

          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed opacity-60">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">This Week (Jun 3 - Jun 9)</span>
          </div>
        </div>
      </div>

      <TimesheetSummaryTable filteredTimesheets={filtered} />
    </div>
  );
}
