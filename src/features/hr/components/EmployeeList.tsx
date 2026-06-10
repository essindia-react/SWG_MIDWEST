import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  UserCircle,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import { useHR } from "../../../hooks/useHR";
import { Employee, EmployeeRole, EmployeeStatus } from "../../../types/hr";
import { formatPhone, formatDate, formatCurrency } from "../../../lib/formatters";
import { IconButton, Tooltip } from "@mui/material";

interface EmployeeListProps {
  onAddEmployee: () => void;
  onEditEmployee: (id: string) => void;
  onViewEmployee: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
}

const COLUMNS = [
  { label: "Employee ID", field: "employeeId" },
  { label: "Name", field: "firstName" },
  { label: "Role", field: "role" },
  { label: "Type", field: "employmentType" },
  { label: "Pay", field: "payRate" },
  { label: "Phone", field: "phone" },
  { label: "Status", field: "status" },
  { label: "Start Date", field: "startDate" },
];

function StatusChip({ status }: { status: EmployeeStatus }) {
  const styles: Record<EmployeeStatus, { bg: string; color: string }> = {
    Active: { bg: "#F0FDF4", color: "#16A34A" },
    Inactive: { bg: "#FEF3C7", color: "#B45309" },
    Terminated: { bg: "#FEF2F2", color: "#DC2626" },
  };
  const s = styles[status] || styles.Active;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

export function EmployeeList({
  onAddEmployee,
  onEditEmployee,
  onViewEmployee,
  onDeleteEmployee,
}: EmployeeListProps) {
  const { employees } = useHR();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Employee>("firstName");
  const [sortAsc, setSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
          emp.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
        const matchesRole = roleFilter === "All" || emp.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
      })
      .sort((a, b) => {
        const av = a[sortField];
        const bv = b[sortField];
        return sortAsc
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [employees, search, sortField, sortAsc, statusFilter, roleFilter]);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Employee Records</h1>
          <p className="text-sm text-slate-500 mt-1">Manage employee information, roles, and pay rates.</p>
        </div>
        <button
          onClick={onAddEmployee}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors"
          style={{ backgroundColor: "#2E7D32", fontSize: "13px" }}
        >
          <PlusCircle className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-72 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none focus:border-green-500 transition-colors"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px" }}
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none focus:border-green-500"
        >
          <option value="All">All Roles</option>
          <option value="Crew Leader">Crew Leader</option>
          <option value="Installer">Installer</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Office Staff">Office Staff</option>
          <option value="Driver">Driver</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none focus:border-green-500"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Terminated">Terminated</option>
        </select>

        <div className="ml-auto px-4 py-2 rounded-xl" style={{ backgroundColor: "#E8F5E9" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#2E7D32" }}>
            {filtered.length} Employees
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
                    onClick={() => handleSort(col.field as keyof Employee)}
                  >
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}
              <th className="p-4 text-center sticky right-0 z-30 bg-white border-l border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 font-semibold" style={{ color: "#2E7D32" }}>
                  {emp.employeeId}
                </td>
                <td className="p-4 text-slate-800 font-medium">
                  {emp.firstName} {emp.lastName}
                  <div className="text-xs text-slate-400 font-normal">{emp.email}</div>
                </td>
                <td className="p-4 text-slate-600">{emp.role}</td>
                <td className="p-4 text-slate-600">{emp.employmentType}</td>
                <td className="p-4 text-slate-600">
                  {formatCurrency(emp.payRate)}
                  <span className="text-xs text-slate-400 ml-1">/{emp.payType === "Hourly" ? "hr" : "yr"}</span>
                </td>
                <td className="p-4 text-slate-600">{emp.phone}</td>
                <td className="p-4">
                  <StatusChip status={emp.status} />
                </td>
                <td className="p-4 text-slate-600">{formatDate(emp.startDate)}</td>
                <td className="p-4 sticky right-0 z-30 bg-white group-hover:bg-slate-50 border-l border-slate-200">
                  <div className="flex items-center justify-center gap-1">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onViewEmployee(emp.id)}>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Employee">
                      <IconButton size="small" onClick={() => onEditEmployee(emp.id)}>
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Employee">
                      <IconButton size="small" onClick={() => onDeleteEmployee(emp.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <UserCircle className="w-12 h-12 mb-3 opacity-20" />
            <p>No employees found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
