import React from "react";
import { TripHistoryTable } from "../../features/transportation/components/TripHistoryTable";

export function TripHistoryPage() {
  return (
    <div className="p-6 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Trip History</h1>
        <p className="text-sm text-slate-500 mt-1">Review past trips, mileage, and driver assignments.</p>
      </div>

      <TripHistoryTable />
    </div>
  );
}
