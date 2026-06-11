import React, { useEffect, useMemo, useState } from "react";
import { Search, User, X } from "lucide-react";
import { PROJECT_CUSTOMERS } from "../../projects/constants/projectConstants";
import type { PipelineStage } from "../../../lib/leadHelpers";

const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "New Inquiry",
  site_visit: "Site Visit",
  design: "Design",
  estimate_sent: "Estimation",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

interface AddPipelineLeadModalProps {
  open: boolean;
  stage: PipelineStage | null;
  onClose: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export function AddPipelineLeadModal({
  open,
  stage,
  onClose,
  onSelectCustomer,
}: AddPipelineLeadModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const customers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PROJECT_CUSTOMERS;
    return PROJECT_CUSTOMERS.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.code.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query),
    );
  }, [search]);

  if (!open || !stage) return null;

  const stageLabel = STAGE_LABELS[stage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-xl border shadow-xl overflow-hidden"
        style={{ borderColor: "var(--border)" }}
        role="dialog"
        aria-modal
        aria-labelledby="add-pipeline-lead-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2
              id="add-pipeline-lead-title"
              className="text-foreground"
              style={{ fontSize: "16px", fontWeight: 600 }}
            >
              Add lead
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              Select a customer to add to {stageLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-foreground"
              placeholder="Search customers..."
              style={{ fontSize: "13px", borderColor: "var(--border)" }}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {customers.length === 0 ? (
            <p
              className="px-3 py-6 text-center"
              style={{ fontSize: "13px", color: "var(--muted-foreground)" }}
            >
              No customers match your search.
            </p>
          ) : (
            customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelectCustomer(customer.id)}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors hover:bg-muted"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--brand-light-green)" }}
                >
                  <User
                    className="w-4 h-4"
                    style={{ color: "var(--brand-green)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-foreground truncate"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    {customer.name}
                  </p>
                  <p
                    className="truncate"
                    style={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                  >
                    {customer.code}
                  </p>
                  <p
                    className="truncate mt-0.5"
                    style={{ fontSize: "11px", color: "var(--muted-foreground)" }}
                  >
                    {customer.email}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
