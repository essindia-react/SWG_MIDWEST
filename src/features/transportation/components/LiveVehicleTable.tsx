import React, { useMemo, useState } from "react";
import { useTransportation } from "../../../hooks/useTransportation";
import { useProjects } from "../../../hooks/useProjects";
import { formatDateTime } from "../../../lib/formatters";
import { MapPin, Navigation, Clock, Eye, Activity } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../routes/paths";

export function LiveVehicleTable() {
  const navigate = useNavigate();
  const { vehicles } = useTransportation();
  const { projects } = useProjects();
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return vehicles.filter(v => filter === "All" || v.status === filter);
  }, [vehicles, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Transit": return "text-blue-600 bg-blue-50";
      case "At Job Site": return "text-amber-600 bg-amber-50";
      case "Returning": return "text-purple-600 bg-purple-50";
      case "Available": return "text-green-600 bg-green-50";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Live Fleet Status
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none focus:border-indigo-500"
        >
          <option value="All">All Statuses</option>
          <option value="In Transit">In Transit</option>
          <option value="At Job Site">At Job Site</option>
          <option value="Returning">Returning</option>
          <option value="Available">Idle / Available</option>
        </select>
      </div>
      
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
        <thead className="sticky top-0 z-10">
          <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="p-4">Vehicle</th>
            <th className="p-4">Current Location</th>
            <th className="p-4">Assigned Job Site</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Today's Mileage</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-100">
          {filtered.map((veh) => {
            const project = projects.find(p => p.id === veh.assignedProjectId);

            return (
              <tr key={veh.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{veh.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last update: {formatDateTime(veh.lastUpdated || veh.updatedAt)}
                  </div>
                </td>
                <td className="p-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {veh.currentLocation || "Location unknown"}
                  </div>
                </td>
                <td className="p-4 text-slate-600">
                  {project ? (
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-slate-400" />
                      {project.projectCode}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(veh.status)}`}>
                    {veh.status}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-medium text-slate-700">
                  {veh.todayMileage.toFixed(1)} mi
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip title="View Vehicle Details">
                      <IconButton size="small" onClick={() => navigate(ROUTES.vehicleDetail(veh.id))}>
                        <Eye className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
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
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Activity className="w-10 h-10 mb-2 opacity-20" />
          <p className="text-sm">No vehicles match the selected status.</p>
        </div>
      )}
    </div>
  );
}
