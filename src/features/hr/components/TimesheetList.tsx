import React, { useMemo } from "react";
import { useHR } from "../../../hooks/useHR";
import { useProjects } from "../../../hooks/useProjects";
import { formatDateTime, formatDate } from "../../../lib/formatters";
import { TimesheetStatus } from "../../../types/hr";
import { Clock, CheckCircle, XCircle, Timer } from "lucide-react";

function TimesheetStatusChip({ status }: { status: TimesheetStatus }) {
  const styles: Record<TimesheetStatus, { bg: string; color: string; icon: any }> = {
    Approved: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
    Pending: { bg: "#EFF6FF", color: "#1D4ED8", icon: Timer },
    Rejected: { bg: "#FEF2F2", color: "#DC2626", icon: XCircle },
  };
  const s = styles[status] || styles.Pending;
  const Icon = s.icon;
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export function TimesheetList({ employeeId }: { employeeId?: string }) {
  const { timesheets, employees } = useHR();
  const { projects } = useProjects();

  const filtered = useMemo(() => {
    let result = [...timesheets];
    if (employeeId) {
      result = result.filter(ts => ts.employeeId === employeeId);
    }
    return result.sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime());
  }, [timesheets, employeeId]);

  return (
    <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm mt-6">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-600" />
          Recent Shifts
        </h3>
      </div>
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="p-4">Employee</th>
            <th className="p-4">Project</th>
            <th className="p-4">Work Type</th>
            <th className="p-4">Clock In</th>
            <th className="p-4">Clock Out</th>
            <th className="p-4">Total Hours</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-100">
          {filtered.map((ts) => {
            const employee = employees.find(e => e.id === ts.employeeId);
            const project = projects.find(p => p.id === ts.projectId);
            return (
              <tr key={ts.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">
                  {employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"}
                </td>
                <td className="p-4 text-slate-600">
                  {project ? project.projectCode : ts.projectId}
                </td>
                <td className="p-4 text-slate-600">{ts.workType}</td>
                <td className="p-4 text-slate-500 font-mono text-xs">
                  {formatDateTime(ts.clockInTime)}
                </td>
                <td className="p-4 text-slate-500 font-mono text-xs">
                  {ts.clockOutTime ? formatDateTime(ts.clockOutTime) : "—"}
                </td>
                <td className="p-4 text-slate-800 font-bold">
                  {ts.totalHours ? `${ts.totalHours.toFixed(2)}h` : "In Progress"}
                </td>
                <td className="p-4">
                  <TimesheetStatusChip status={ts.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Clock className="w-10 h-10 mb-2 opacity-10" />
          <p className="text-sm italic">No shift history found.</p>
        </div>
      )}
    </div>
  );
}
