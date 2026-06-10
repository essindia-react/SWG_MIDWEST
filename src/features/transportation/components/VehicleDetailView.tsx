import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import {
  Truck,
  User,
  MapPin,
  Clock,
  Activity,
  Play,
  Navigation,
  CheckCircle2,
  CornerUpLeft,
} from "lucide-react";
import { useTransportation } from "../../../hooks/useTransportation";
import { useHR } from "../../../hooks/useHR";
import { useProjects } from "../../../hooks/useProjects";
import { formatDateTime } from "../../../lib/formatters";
import { StatusChip } from "./VehicleList";

export function VehicleDetailView({ vehicleId }: { vehicleId: string }) {
  const { getVehicleById } = useTransportation();
  const { employees } = useHR();
  const { projects } = useProjects();

  const vehicle = getVehicleById(vehicleId);
  
  if (!vehicle) {
    return <div className="p-6">Vehicle not found.</div>;
  }

  const driver = employees.find(e => e.id === vehicle.assignedDriverId);
  const project = projects.find(p => p.id === vehicle.assignedProjectId);

  // Mock timeline events for the UI
  const timelineEvents = [
    { id: "e1", type: "clock-in", title: "Driver Clock In", time: "07:00 AM", desc: "Columbus HQ", icon: Clock, color: "text-blue-500", bg: "bg-blue-100" },
    { id: "e2", type: "departed", title: "Vehicle Departed", time: "07:15 AM", desc: "Heading to Site A", icon: Play, color: "text-indigo-500", bg: "bg-indigo-100" },
    { id: "e3", type: "arrived", title: "Arrived at Site", time: "08:30 AM", desc: "Confirmed via GPS", icon: Navigation, color: "text-amber-500", bg: "bg-amber-100" },
    { id: "e4", type: "completed", title: "Work Completed", time: "03:45 PM", desc: "Driver updated status", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100" },
    { id: "e5", type: "returned", title: "Returned to Base", time: "Pending", desc: "Expected 04:30 PM", icon: CornerUpLeft, color: "text-slate-400", bg: "bg-slate-100" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
          <Truck className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{vehicle.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span className="font-mono">{vehicle.vehicleId}</span>
            <span>•</span>
            <span>{vehicle.type}</span>
            <span>•</span>
            <span className="font-mono">{vehicle.licensePlate}</span>
          </div>
        </div>
        <div className="ml-auto">
          <StatusChip status={vehicle.status} />
        </div>
      </div>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {/* Info Cards */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ height: '100%', borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "none" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <User className="w-4 h-4 text-slate-400" />
                    Assignment Information
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Assigned Driver</div>
                      <div className="font-medium text-slate-800">
                        {driver ? `${driver.firstName} ${driver.lastName}` : "Unassigned"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Assigned Project</div>
                      <div className="font-medium text-slate-800">
                        {project ? `${project.projectCode} - ${project.customerName}` : "Unassigned"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ height: '100%', borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "none" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Activity className="w-4 h-4 text-slate-400" />
                    Current Tracking
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Location</div>
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {vehicle.currentLocation || "Location unknown"}
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Today's Mileage</div>
                        <div className="font-medium text-slate-800 font-mono">{vehicle.todayMileage.toFixed(1)} mi</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Last Updated</div>
                        <div className="font-medium text-slate-800 text-sm">{formatDateTime(vehicle.lastUpdated || vehicle.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* Trip Timeline */}
          <Card sx={{ height: '100%', borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "none", bgcolor: "slate.50" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3 }}>
                Today's Trip Timeline
              </Typography>
              
              <div className="relative pl-3 space-y-6">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-6 left-[23px] w-0.5 bg-slate-200 z-0" />
                
                {timelineEvents.map((evt, idx) => {
                  const Icon = evt.icon;
                  const isPending = evt.time === "Pending";
                  return (
                    <div key={evt.id} className="relative z-10 flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPending ? 'bg-white border-2 border-slate-200' : evt.bg}`}>
                        <Icon className={`w-4 h-4 ${isPending ? 'text-slate-300' : evt.color}`} />
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isPending ? 'text-slate-400' : 'text-slate-800'}`}>
                          {evt.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-mono ${isPending ? 'text-slate-400' : 'text-indigo-600 font-semibold'}`}>
                            {evt.time}
                          </span>
                          <span className="text-xs text-slate-500">{evt.desc}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
