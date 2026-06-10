import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Truck,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import { useTransportation } from "../../../hooks/useTransportation";
import { useHR } from "../../../hooks/useHR";
import { useProjects } from "../../../hooks/useProjects";
import { Vehicle, VehicleType, VehicleStatus } from "../../../types/transportation";
import { IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../routes/paths";

interface VehicleListProps {
  onAddVehicle: () => void;
  onEditVehicle: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
}

const COLUMNS = [
  { label: "Vehicle ID", field: "vehicleId" },
  { label: "Name", field: "name" },
  { label: "Type", field: "type" },
  { label: "License Plate", field: "licensePlate" },
  { label: "GPS Device ID", field: "gpsDeviceId" },
  { label: "Status", field: "status" },
  { label: "Assigned To", field: "assignedDriverId" },
];

export function StatusChip({ status }: { status: string }) {
  const getStyles = (status: string) => {
    switch (status) {
      case "Available":
      case "Completed":
        return { bg: "#F0FDF4", color: "#16A34A" };
      case "In Transit":
      case "En Route":
      case "In Progress":
        return { bg: "#EFF6FF", color: "#1D4ED8" };
      case "At Job Site":
      case "On Site":
        return { bg: "#FEF3C7", color: "#B45309" };
      case "Returning":
        return { bg: "#F5F3FF", color: "#6D28D9" };
      case "In Maintenance":
      case "Idle":
        return { bg: "#FEF2F2", color: "#DC2626" };
      default:
        return { bg: "#F1F5F9", color: "#475569" };
    }
  };

  const s = getStyles(status);
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

export function VehicleList({
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
}: VehicleListProps) {
  const navigate = useNavigate();
  const { vehicles } = useTransportation();
  const { employees } = useHR();
  const { projects } = useProjects();
  
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Vehicle>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return vehicles
      .filter((veh) => {
        const matchesSearch =
          veh.name.toLowerCase().includes(search.toLowerCase()) ||
          veh.vehicleId.toLowerCase().includes(search.toLowerCase()) ||
          veh.licensePlate.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || veh.status === statusFilter;
        const matchesType = typeFilter === "All" || veh.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        const av = a[sortField] || "";
        const bv = b[sortField] || "";
        return sortAsc
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [vehicles, search, sortField, sortAsc, statusFilter, typeFilter]);

  const handleSort = (field: keyof Vehicle) => {
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Vehicle / Asset Master</h1>
          <p className="text-sm text-slate-500 mt-1">Manage fleet vehicles, trailers, and equipment.</p>
        </div>
        <button
          onClick={onAddVehicle}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors"
          style={{ backgroundColor: "#2E7D32", fontSize: "13px" }}
        >
          <PlusCircle className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-72 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none focus:border-green-500 transition-colors"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px" }}
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none focus:border-green-500"
        >
          <option value="All">All Types</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Trailer">Trailer</option>
          <option value="Equipment Trailer">Equipment Trailer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none focus:border-green-500"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Transit">In Transit</option>
          <option value="At Job Site">At Job Site</option>
          <option value="In Maintenance">In Maintenance</option>
        </select>

        <div className="ml-auto px-4 py-2 rounded-xl" style={{ backgroundColor: "#E8F5E9" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#2E7D32" }}>
            {filtered.length} Vehicles
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
                    onClick={() => handleSort(col.field as keyof Vehicle)}
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
            {filtered.map((veh) => {
              const driver = employees.find(e => e.id === veh.assignedDriverId);
              const project = projects.find(p => p.id === veh.assignedProjectId);

              return (
                <tr key={veh.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-semibold" style={{ color: "#2E7D32" }}>
                    {veh.vehicleId}
                  </td>
                  <td className="p-4 text-slate-800 font-medium">
                    {veh.name}
                  </td>
                  <td className="p-4 text-slate-600">{veh.type}</td>
                  <td className="p-4 text-slate-600 font-mono text-xs">{veh.licensePlate}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{veh.gpsDeviceId}</td>
                  <td className="p-4">
                    <StatusChip status={veh.status} />
                  </td>
                  <td className="p-4 text-slate-600">
                    {driver ? (
                      <div>
                        <span className="font-medium text-slate-800">{driver.firstName} {driver.lastName}</span>
                        {project && <div className="text-xs text-slate-400 mt-0.5">{project.projectCode}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 sticky right-0 z-30 bg-white group-hover:bg-slate-50 border-l border-slate-200">
                    <div className="flex items-center justify-center gap-1">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(ROUTES.vehicleDetail(veh.id))}>
                          <Eye className="w-4 h-4 text-slate-400" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Vehicle">
                        <IconButton size="small" onClick={() => onEditVehicle(veh.id)}>
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Vehicle">
                        <IconButton size="small" onClick={() => onDeleteVehicle(veh.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Truck className="w-12 h-12 mb-3 opacity-20" />
            <p>No vehicles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
