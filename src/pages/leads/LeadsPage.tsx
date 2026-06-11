import React, { useCallback } from "react";
import { useSearchParams } from "react-router";
import { LeadsList } from "../../features/leads/components/LeadsList";
import { LeadWorkspace } from "./LeadWorkspace";

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreating = searchParams.get("create") === "true";
  const editLeadId = searchParams.get("edit");
  const workflowStep = searchParams.get("step");

  const openCreate = useCallback(() => {
    setSearchParams({ create: "true" });
  }, [setSearchParams]);

  const openEdit = useCallback(
    (leadId: string) => {
      setSearchParams({ edit: leadId });
    },
    [setSearchParams],
  );

  const closeWorkspace = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  if (isCreating || editLeadId) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <LeadWorkspace
          onBack={closeWorkspace}
          leadId={editLeadId ?? undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <LeadsList
        onAddLead={openCreate}
        onEditLead={openEdit}
        workflowStep={workflowStep ?? undefined}
      />
    </div>
  );
}
