import React from "react";
import { useParams } from "react-router";
import { LeadDetailView } from "../../features/leads/components/LeadDetailView";

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <LeadDetailView leadId={id} />
    </div>
  );
}
