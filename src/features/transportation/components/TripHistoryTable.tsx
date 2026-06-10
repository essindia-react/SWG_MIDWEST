import React, { useMemo, useState } from "react";
import { useTransportation } from "../../../hooks/useTransportation";
import { useHR } from "../../../hooks/useHR";
import { formatDateTime } from "../../../lib/formatters";
import { Search, MapPin, Map as MapIcon, Eye, Edit2, Trash2 } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";

export function TripHistoryTable() {
  const { trips, vehicles } = useTransportation();
  const { employees } = useHR();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    return trips
      .filter((trip) => {
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        const driver = employees.find(e => e.id === trip.driverId);
        const driverName = driver ? `${driver.firstName} ${driver.lastName}`.toLowerCase() : "";
        const vehName = vehicle ? vehicle.name.toLowerCase() : "";

        const matchesSearch = driverName.includes(search.toLowerCase()) || vehName.includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [trips, vehicles, employees, search, statusFilter]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-72 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search trips by vehicle or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px" }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm outline-none focus:border-indigo-500"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
        </select>

        <div className="ml-auto px-4 py-2 rounded-xl" style={{ backgroundColor: "#EFF6FF" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1D4ED8" }}>
            {filtered.length} Trips
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4">Vehicle & Driver</th>
              <th className="p-4">Time</th>
              <th className="p-4">Route</th>
              <th className="p-4">Distance / Mileage</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center sticky right-0 bg-slate-50 border-l border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filtered.map((trip) => {
              const vehicle = vehicles.find(v => v.id === trip.vehicleId);
              const driver = employees.find(e => e.id === trip.driverId);

              return (
                <tr key={trip.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{vehicle?.name || "Unknown Vehicle"}</div>
                    <div className="text-xs text-slate-500">{driver ? `${driver.firstName} ${driver.lastName}` : "Unknown Driver"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-xs text-slate-700">{formatDateTime(trip.startTime)}</div>
                    <div className="font-mono text-xs text-slate-400 mt-0.5">
                      {trip.endTime ? `To: ${formatDateTime(trip.endTime)}` : "Ongoing..."}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      {trip.startLocation}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      {trip.endLocation || "En Route..."}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{trip.distanceTravelled.toFixed(1)} mi</div>
                    <div className="text-xs text-slate-400">Odo: {trip.mileage.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        trip.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="p-4 sticky right-0 z-30 bg-white group-hover:bg-slate-50 border-l border-slate-200">
                    <div className="flex items-center justify-center gap-1">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Trip">
                        <IconButton size="small">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Trip">
                        <IconButton size="small">
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
            <MapIcon className="w-12 h-12 mb-3 opacity-20" />
            <p>No trip history found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
