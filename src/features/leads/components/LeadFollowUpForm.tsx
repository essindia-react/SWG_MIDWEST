import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { LeadFollowUpActivity } from "../../../types/lead";

const PROPOSAL_REFS = ["PRP-9902", "PRP-9901"] as const;
const STATUS_UPDATES = ["Decision Pending", "Following Up", "Contract Signed"] as const;

export interface LeadFollowUpFormValues {
  proposalRef: string;
  statusUpdate: string;
  nextFollowUpDate: string;
  remarks: string;
}

interface LeadFollowUpFormProps {
  customerName: string;
  defaultProposalRef?: string;
  defaultNextFollowUpDate?: string;
  onSubmit: (values: LeadFollowUpFormValues) => void;
  onCancel: () => void;
}

export function createFollowUpActivity(values: LeadFollowUpFormValues): LeadFollowUpActivity {
  const title = values.statusUpdate || "Follow-up logged";
  const descriptionParts = [
    values.remarks.trim(),
    values.proposalRef ? `Proposal: ${values.proposalRef}` : null,
  ].filter(Boolean);

  return {
    id: `follow-up-${Date.now()}`,
    title,
    description: descriptionParts.join(" · ") || "Follow-up activity recorded.",
    date: new Date().toISOString().slice(0, 10),
    proposalRef: values.proposalRef || undefined,
    statusUpdate: values.statusUpdate || undefined,
  };
}

export function LeadFollowUpForm({
  customerName,
  defaultProposalRef = "",
  defaultNextFollowUpDate = "",
  onSubmit,
  onCancel,
}: LeadFollowUpFormProps) {
  const [form, setForm] = useState<LeadFollowUpFormValues>({
    proposalRef: defaultProposalRef || PROPOSAL_REFS[0],
    statusUpdate: STATUS_UPDATES[0],
    nextFollowUpDate: defaultNextFollowUpDate,
    remarks: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.remarks.trim()) return;
    onSubmit(form);
  };

  const fieldClass =
    "w-full rounded-lg border px-3 py-2 text-foreground outline-none transition-colors focus:ring-2";
  const labelClass = "mb-1 block";
  const labelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-5 shadow-lg"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4
          id="follow-up-form-title"
          className="text-foreground"
          style={{ fontSize: "14px", fontWeight: 700 }}
        >
          Log Follow-up Activity
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 transition-colors hover:bg-muted"
          aria-label="Close form"
        >
          <X className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} style={labelStyle}>
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            disabled
            className={fieldClass}
            style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA", opacity: 0.8 }}
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Proposal Ref
          </label>
          <select
            value={form.proposalRef}
            onChange={(e) => setForm((prev) => ({ ...prev, proposalRef: e.target.value }))}
            className={fieldClass}
            style={{ borderColor: "var(--border)", backgroundColor: "white" }}
          >
            {PROPOSAL_REFS.map((ref) => (
              <option key={ref} value={ref}>
                {ref}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Status Update
          </label>
          <select
            value={form.statusUpdate}
            onChange={(e) => setForm((prev) => ({ ...prev, statusUpdate: e.target.value }))}
            className={fieldClass}
            style={{ borderColor: "var(--border)", backgroundColor: "white" }}
          >
            {STATUS_UPDATES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} style={labelStyle}>
            Next Follow Up Date
          </label>
          <input
            type="date"
            value={form.nextFollowUpDate}
            onChange={(e) => setForm((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
            className={fieldClass}
            style={{ borderColor: "var(--border)", backgroundColor: "white" }}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} style={labelStyle}>
            Remarks
          </label>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="Summary of conversation..."
            rows={3}
            required
            className={`${fieldClass} resize-none`}
            style={{ borderColor: "var(--border)", backgroundColor: "white" }}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 transition-colors hover:bg-muted"
          style={{ borderColor: "var(--border)", fontSize: "13px", fontWeight: 500 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!form.remarks.trim()}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--brand-green)", fontSize: "13px", fontWeight: 600 }}
        >
          <Plus className="h-4 w-4" />
          Add to Log
        </button>
      </div>
    </form>
  );
}
