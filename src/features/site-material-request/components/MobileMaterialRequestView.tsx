import React, { useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Package,
  Send,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { ROUTES } from "../../../routes/paths";
import type { AssignedPickItem } from "../../tasks/lib/taskPickListHelpers";
import {
  DEMO_ACTIVE_JOB,
  MATERIAL_REQUEST_REASONS,
  MATERIAL_REQUEST_UNITS,
  MATERIAL_REQUEST_URGENCIES,
} from "../constants/materialRequestConstants";
import { createMaterialRequest } from "../lib/materialRequestStore";
import type { MaterialRequestFormData } from "../types/materialRequest";

const initialForm: MaterialRequestFormData = {
  itemName: "",
  quantityNeeded: "",
  unit: "sq ft",
  reason: "",
  urgency: "",
  notes: "",
  photoAttached: false,
};

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex justify-center items-start min-h-screen overflow-y-auto p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="rounded-3xl overflow-hidden flex flex-col"
        style={{
          width: "390px",
          minHeight: "780px",
          backgroundColor: "white",
          boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 0 0 12px #1B1B1B",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-3 pb-1"
          style={{ backgroundColor: "var(--brand-dark-green)" }}
        >
          <span
            className="text-white"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            9:41
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[4, 3, 2, 1].map((h) => (
                <div
                  key={h}
                  className="w-1 bg-white rounded-sm"
                  style={{ height: `${h * 3}px`, opacity: h === 1 ? 0.4 : 1 }}
                />
              ))}
            </div>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="9"
                rx="2"
                stroke="white"
                strokeOpacity="0.5"
              />
              <rect x="1.5" y="1.5" width="12" height="7" rx="1" fill="white" />
              <rect
                x="17"
                y="3"
                width="2"
                height="4"
                rx="1"
                fill="white"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block mb-1"
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--muted-foreground)",
      }}
    >
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <FieldLabel>{label}</FieldLabel>
      <div
        className="px-3 py-2 rounded-lg"
        style={{
          fontSize: "13px",
          backgroundColor: "var(--muted)",
          color: "var(--foreground)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MobileSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <div className="mb-3">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border outline-none"
        style={{
          fontSize: "13px",
          borderColor: "var(--border)",
          backgroundColor: "white",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function MobileInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border outline-none"
        style={{ fontSize: "13px", borderColor: "var(--border)" }}
      />
    </div>
  );
}

export interface MobileMaterialRequestTaskContext {
  projectCode: string;
  projectName: string;
  taskId: string;
  taskName: string;
  milestoneName: string;
  requestedBy: string;
  assignedMaterials: AssignedPickItem[];
}

export function MobileMaterialRequestView({
  standalone = false,
  embedded = false,
  taskContext,
  onClose,
}: {
  standalone?: boolean;
  embedded?: boolean;
  taskContext?: MobileMaterialRequestTaskContext;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ??
    ROUTES.tasksMobile;

  const [form, setForm] = useState<MaterialRequestFormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const materialOptions = taskContext?.assignedMaterials ?? [];

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate(returnTo);
  };

  const updateForm = <K extends keyof MaterialRequestFormData>(
    key: K,
    value: MaterialRequestFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const qty = Number(form.quantityNeeded);
    if (!form.itemName || !qty || qty <= 0 || !form.reason || !form.urgency) {
      toast.error("Please fill in all required fields");
      return;
    }

    const request = createMaterialRequest(
      {
        itemName: form.itemName,
        quantityNeeded: qty,
        unit: form.unit,
        reason: form.reason,
        urgency: form.urgency,
        photoAttached: form.photoAttached,
        notes: form.notes,
      },
      taskContext
        ? {
            projectCode: taskContext.projectCode,
            projectName: taskContext.projectName,
            requestedBy: taskContext.requestedBy,
            taskId: taskContext.taskId,
            taskName: taskContext.taskName,
          }
        : undefined
    );

    setRequestNumber(request.requestNumber);
    setSubmitted(true);
    toast.success("Material request submitted — office notified");
  };

  const handleNewRequest = () => {
    setForm(initialForm);
    setSubmitted(false);
    setRequestNumber("");
  };

  const closeButton =
    standalone || embedded ? (
      <button
        type="button"
        onClick={handleClose}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-0 cursor-pointer flex-shrink-0"
        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        aria-label="Close"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    ) : null;

  const content = submitted ? (
    <>
      <div
        className="px-5 pt-4 pb-3 flex items-center gap-3"
        style={{ backgroundColor: "var(--brand-dark-green)" }}
      >
        <Package className="w-5 h-5 text-white flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white" style={{ fontSize: "11px", opacity: 0.7 }}>
            Request Submitted
          </p>
          <p
            className="text-white"
            style={{ fontSize: "16px", fontWeight: 700 }}
          >
            {requestNumber}
          </p>
        </div>
        {closeButton}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(46, 125, 50, 0.12)" }}
        >
          <CheckCircle2
            className="w-8 h-8"
            style={{ color: "var(--brand-green)" }}
          />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
          Request Sent
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--muted-foreground)",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          Your material request has been sent to the office. You&apos;ll receive
          a notification when it&apos;s reviewed.
        </p>
        <button
          onClick={handleNewRequest}
          className="w-full py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "var(--brand-green)", fontSize: "14px" }}
        >
          Submit Another Request
        </button>
      </div>
    </>
  ) : (
    <>
      <div
        className="px-5 pt-3 pb-4"
        style={{ backgroundColor: "var(--brand-dark-green)" }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {!standalone && (
              <ArrowLeft className="w-4 h-4 text-white opacity-70" />
            )}
            <p
              className="text-white"
              style={{ fontSize: "11px", opacity: 0.7 }}
            >
              Field Crew App
            </p>
          </div>
          {closeButton}
        </div>
        <p className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
          Material Request
        </p>
        <p
          className="text-white mt-1"
          style={{ fontSize: "11px", opacity: 0.65 }}
        >
          Request additional materials while on-site
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ReadOnlyField
          label="Project"
          value={
            taskContext
              ? `${taskContext.projectCode} — ${taskContext.projectName}`
              : `${DEMO_ACTIVE_JOB.projectCode} — ${DEMO_ACTIVE_JOB.projectName}`
          }
        />
        {taskContext && (
          <ReadOnlyField
            label="Task"
            value={`${taskContext.taskName} (${taskContext.milestoneName})`}
          />
        )}
        <ReadOnlyField
          label="Requested By"
          value={taskContext?.requestedBy ?? DEMO_ACTIVE_JOB.crewMember}
        />
        <ReadOnlyField
          label="Request Date & Time"
          value={new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        />

        <div className="mb-3">
          <FieldLabel>Item Name</FieldLabel>
          <select
            value={form.itemName}
            onChange={(e) => {
              const itemName = e.target.value;
              const assigned = materialOptions.find((item) => item.itemName === itemName);
              updateForm("itemName", itemName);
              if (assigned) updateForm("unit", assigned.unit);
            }}
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ fontSize: "13px", borderColor: "var(--border)" }}
          >
            <option value="">Select material...</option>
            {materialOptions.map((item) => (
              <option key={item.sourceLineId} value={item.itemName}>
                {item.itemName}
              </option>
            ))}
          </select>
          <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "6px" }}>
            {taskContext
              ? "From project budget materials (inventory catalog)"
              : "Open from a task to request project-assigned materials"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MobileInput
            label="Quantity Needed"
            value={form.quantityNeeded}
            onChange={(value) => updateForm("quantityNeeded", value)}
            type="number"
            placeholder="0"
          />
          <MobileSelect
            label="Unit"
            value={form.unit}
            onChange={(value) => updateForm("unit", value)}
            options={MATERIAL_REQUEST_UNITS}
            placeholder="Select unit"
          />
        </div>

        <MobileSelect
          label="Reason"
          value={form.reason}
          onChange={(value) =>
            updateForm("reason", value as MaterialRequestFormData["reason"])
          }
          options={MATERIAL_REQUEST_REASONS}
          placeholder="Select reason"
        />

        <MobileSelect
          label="Urgency"
          value={form.urgency}
          onChange={(value) =>
            updateForm("urgency", value as MaterialRequestFormData["urgency"])
          }
          options={MATERIAL_REQUEST_URGENCIES}
          placeholder="Select urgency"
        />

        <div className="mb-3">
          <FieldLabel>Photo (Optional)</FieldLabel>
          <button
            type="button"
            onClick={() => updateForm("photoAttached", !form.photoAttached)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed"
            style={{
              borderColor: form.photoAttached
                ? "var(--brand-green)"
                : "var(--border)",
              backgroundColor: form.photoAttached
                ? "rgba(46, 125, 50, 0.06)"
                : "white",
              fontSize: "13px",
              color: form.photoAttached
                ? "var(--brand-green)"
                : "var(--muted-foreground)",
            }}
          >
            <Camera className="w-4 h-4" />
            {form.photoAttached ? "Photo attached" : "Take photo of issue"}
          </button>
        </div>

        <div className="mb-4">
          <FieldLabel>Notes</FieldLabel>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            rows={3}
            placeholder="Additional details..."
            className="w-full px-3 py-2 rounded-lg border outline-none resize-none"
            style={{ fontSize: "13px", borderColor: "var(--border)" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold mb-4"
          style={{ backgroundColor: "var(--brand-green)", fontSize: "14px" }}
        >
          <Send className="w-4 h-4" />
          Submit Request
        </button>
      </div>
    </>
  );

  if (embedded) {
    return <>{content}</>;
  }

  if (standalone) {
    return <PhoneFrame>{content}</PhoneFrame>;
  }

  return (
    <div
      className="flex justify-center items-start h-full overflow-y-auto p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="rounded-3xl overflow-hidden flex flex-col"
        style={{
          width: "390px",
          minHeight: "780px",
          backgroundColor: "white",
          boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 0 0 12px #1B1B1B",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-3 pb-1"
          style={{ backgroundColor: "var(--brand-dark-green)" }}
        >
          <span
            className="text-white"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            9:41
          </span>
          <div className="flex gap-0.5">
            {[4, 3, 2, 1].map((h) => (
              <div
                key={h}
                className="w-1 bg-white rounded-sm"
                style={{ height: `${h * 3}px`, opacity: h === 1 ? 0.4 : 1 }}
              />
            ))}
          </div>
        </div>
        {content}
      </div>

      <div className="ml-8 max-w-64 flex-shrink-0 self-center">
        <h3
          className="text-foreground mb-3"
          style={{ fontSize: "16px", fontWeight: 700 }}
        >
          Crew Material Request
        </h3>
        <p
          className="mb-4"
          style={{
            fontSize: "13px",
            color: "var(--muted-foreground)",
            lineHeight: 1.7,
          }}
        >
          Mobile form for crew members on-site to request additional materials.
          Submissions notify the office for review and approval.
        </p>
        <div className="space-y-2">
          {[
            "Auto-filled project from active job",
            "Product list or free-text entry",
            "Urgency and reason tracking",
            "Optional photo upload",
            "Instant office notification",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "var(--brand-green)" }}
              />
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
