import React from "react";
import { Box, Typography } from "@mui/material";
import { Map, MapPin } from "lucide-react";
import { useTransportation } from "../../../hooks/useTransportation";

export function MapPlaceholder() {
  const { vehicles } = useTransportation();

  const getPinColor = (status: string) => {
    switch (status) {
      case "In Transit": return "#2563EB"; // blue
      case "At Job Site": return "#D97706"; // amber
      case "Returning": return "#9333EA"; // purple
      default: return "#16A34A"; // green
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        bgcolor: "#e2e8f0", // slate-200
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", // slate-300
        backgroundSize: "20px 20px",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        {/* Decorative paths to simulate routes */}
        <svg width="100%" height="100%">
          <path d="M 100 100 Q 200 50 300 200 T 500 300" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6,6" />
          <path d="M 400 100 Q 500 150 600 100 T 800 200" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6,6" />
        </svg>
      </Box>

      {/* Simulated vehicle pins */}
      {vehicles.map((veh, index) => {
        // distribute them somewhat randomly but consistently based on index
        const top = `${20 + (index * 25) % 60}%`;
        const left = `${15 + (index * 30) % 70}%`;
        const color = getPinColor(veh.status);

        return (
          <Box
            key={veh.id}
            sx={{
              position: "absolute",
              top,
              left,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "translate(-50%, -100%)", // point at the exact spot
              zIndex: 10,
              "&:hover .tooltip": {
                opacity: 1,
                transform: "translateY(0)",
              }
            }}
          >
            <div
              className="tooltip absolute bottom-full mb-2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap transition-all duration-200"
              style={{ opacity: 0, transform: "translateY(5px)", pointerEvents: "none" }}
            >
              <div className="font-bold">{veh.name}</div>
              <div className="text-slate-300">{veh.status}</div>
            </div>
            
            <div className="relative">
              <MapPin size={32} color={color} fill="white" strokeWidth={2} />
              <div 
                className="absolute top-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </Box>
        );
      })}

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          bgcolor: "white",
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          zIndex: 20,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Live Map Overview</Typography>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-xs text-slate-600">In Transit</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-600"></div><span className="text-xs text-slate-600">At Job Site</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div><span className="text-xs text-slate-600">Available</span></div>
        </div>
      </Box>

      {/* Central overlay text if empty */}
      {vehicles.length === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", color: "text.secondary", zIndex: 5 }}>
          <Map size={48} className="opacity-20 mb-2" />
          <Typography>No active vehicles on map</Typography>
        </Box>
      )}
    </Box>
  );
}
