import React from "react";
import { useHR } from "../../../hooks/useHR";
import { useProjects } from "../../../hooks/useProjects";
import { formatDateTime, formatDate } from "../../../lib/formatters";
import { TimesheetEntry, TimesheetStatus } from "../../../types/hr";
import { CheckCircle, XCircle, Timer, FileText, Send, Eye } from "lucide-react";
import { IconButton, Tooltip, Button } from "@mui/material";
import { toast } from "sonner";

interface TimesheetSummaryTableProps {
  filteredTimesheets: TimesheetEntry[];
}

export function TimesheetSummaryTable({ filteredTimesheets }: TimesheetSummaryTableProps) {
  const { employees, updateTimesheetStatus } = useHR();
  const { projects } = useProjects();

  const handleApprove = (id: string) => {
    updateTimesheetStatus(id, "Approved", "Jane Smith (Manager)");
    toast.success("Timesheet approved");
  };

  const handleReject = (id: string) => {
    updateTimesheetStatus(id, "Rejected", "Jane Smith (Manager)");
    toast.error("Timesheet rejected");
  };

  const handlePushToQuickBooks = (id: string) => {
    toast.success("Timesheet data synced with QuickBooks Online", {
      description: "Transaction ID: QB-882910",
      duration: 4000,
    });
  };

  return (
    <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="p-4">Employee</th>
            <th className="p-4">Date</th>
            <th className="p-4">Project</th>
            <th className="p-4">Work Type</th>
            <th className="p-4">Hours</th>
            <th className="p-4">OT</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-100">
          {filteredTimesheets.map((ts) => {
            const employee = employees.find((e) => e.id === ts.employeeId);
            const project = projects.find((p) => p.id === ts.projectId);
            const isOT = (ts.totalHours || 0) > 8; // Simple daily OT flag for UI

            return (
              <tr key={ts.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 font-medium text-slate-800">
                  {employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"}
                  <div className="text-xs text-slate-400 font-normal">{employee?.role}</div>
                </td>
                <td className="p-4 text-slate-600 font-medium">{formatDate(ts.clockInTime)}</td>
                <td className="p-4 text-slate-600">{project ? project.projectCode : ts.projectId}</td>
                <td className="p-4 text-slate-600">{ts.workType}</td>
                <td className="p-4 text-slate-800 font-bold">
                  {ts.totalHours ? `${ts.totalHours.toFixed(2)}h` : "—"}
                </td>
                <td className="p-4">
                  {isOT && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">
                      OT Flagged
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      ts.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : ts.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ts.status}
                  </span>
                  {ts.approvedBy && (
                    <div className="text-[10px] text-slate-400 mt-1 italic">By {ts.approvedBy}</div>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {ts.status === "Pending" && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(ts.id)}
                            sx={{ color: "#16A34A", bgcolor: "#F0FDF4", "&:hover": { bgcolor: "#DCFCE7" } }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            onClick={() => handleReject(ts.id)}
                            sx={{ color: "#DC2626", bgcolor: "#FEF2F2", "&:hover": { bgcolor: "#FEE2E2" } }}
                          >
                            <XCircle className="w-4 h-4" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {ts.status === "Approved" && (
                      <Button
                        size="small"
                        startIcon={<Send className="w-3 h-3" />}
                        onClick={() => handlePushToQuickBooks(ts.id)}
                        sx={{ fontSize: "11px", textTransform: "none", fontWeight: 700 }}
                        color="success"
                      >
                        Push to QB
                      </Button>
                    )}
                    <Tooltip title="View Session Details">
                      <IconButton size="small">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filteredTimesheets.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <FileText className="w-12 h-12 mb-3 opacity-20" />
          <p>No timesheets match your current filters.</p>
        </div>
      )}
    </div>
  );
}
