import React from "react";
import { ClockControl } from "../../features/hr/components/ClockControl";
import { TimesheetList } from "../../features/hr/components/TimesheetList";
import { useHR } from "../../hooks/useHR";

export function ClockInOutPage() {
  const { employees } = useHR();
  const currentUser = employees[0]; // Assuming first employee for UI demo

  return (
    <div className="p-6 flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Clock In / Out</h1>
        <p className="text-sm text-slate-500 mt-1">Record your daily work hours and project assignments.</p>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <ClockControl />
        <TimesheetList employeeId={currentUser?.id} />
      </div>
    </div>
  );
}
