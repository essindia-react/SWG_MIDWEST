import React from "react";
import { useParams, useNavigate } from "react-router";
import { VehicleDetailView } from "../../features/transportation/components/VehicleDetailView";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../../routes/paths";

export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="mb-6 flex-shrink-0 flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.vehicleMaster)}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehicle Details</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed overview, tracking, and history.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full">
        {id ? <VehicleDetailView vehicleId={id} /> : <div>Invalid Vehicle ID</div>}
      </div>
    </div>
  );
}
