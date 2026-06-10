import React, { useMemo } from "react";
import { useTransportation } from "../../hooks/useTransportation";
import { LiveVehicleTable } from "../../features/transportation/components/LiveVehicleTable";
import { MapPlaceholder } from "../../features/transportation/components/MapPlaceholder";
import {
  Truck,
  Navigation,
  MapPin,
  CornerUpLeft,
  Coffee,
} from "lucide-react";

export function GPSDashboardPage() {
  const { vehicles } = useTransportation();
  
  const stats = useMemo(() => {
    const total = vehicles.length;
    const enRoute = vehicles.filter((v) => v.status === "In Transit").length;
    const onSite = vehicles.filter((v) => v.status === "At Job Site").length;
    const returning = vehicles.filter((v) => v.status === "Returning").length;
    const idle = vehicles.filter((v) => v.status === "Available" || v.status === "In Maintenance").length;
    
    return { total, enRoute, onSite, returning, idle };
  }, [vehicles]);

  const statCards = [
    { label: "Total Vehicles", value: stats.total, icon: Truck, color: "#475569", bg: "#F1F5F9" },
    { label: "En Route", value: stats.enRoute, icon: Navigation, color: "#2563EB", bg: "#EFF6FF" },
    { label: "On Site", value: stats.onSite, icon: MapPin, color: "#D97706", bg: "#FFF7ED" },
    { label: "Returning", value: stats.returning, icon: CornerUpLeft, color: "#9333EA", bg: "#FAF5FF" },
    { label: "Idle / Maint.", value: stats.idle, icon: Coffee, color: "#16A34A", bg: "#F0FDF4" },
  ];

  return (
    <div className="p-6 flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">GPS Tracking Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Live overview of fleet locations and current statuses.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 flex-shrink-0">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <LiveVehicleTable />
        </div>
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Live Map
          </h3>
          <MapPlaceholder />
        </div>
      </div>
    </div>
  );
}
