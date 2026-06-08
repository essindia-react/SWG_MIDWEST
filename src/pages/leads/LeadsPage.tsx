import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { LeadsList } from "../../features/leads/components/LeadsList";
import { LeadWorkspace } from "./LeadWorkspace";

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreating = searchParams.get("create") === "true";
  const workflowStep = searchParams.get("step");

  const openCreate = useCallback(() => {
    setSearchParams({ create: "true" });
  }, [setSearchParams]);

  const closeCreate = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  if (isCreating) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <LeadWorkspace onBack={closeCreate} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <LeadsList onAddLead={openCreate} workflowStep={workflowStep ?? undefined} />
    </div>
  );
}
