import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "../../../types/lead";
import {
  formatActivityDate,
  getLeadActivityTimeline,
  type LeadActivityItem,
} from "../lib/leadActivityHelpers";
import {
  createFollowUpActivity,
  LeadFollowUpForm,
  type LeadFollowUpFormValues,
} from "./LeadFollowUpForm";

interface LeadActivityTimelineProps {
  lead: Lead;
  onAddFollowUp?: (values: LeadFollowUpFormValues) => void;
}

function ActivityCard({
  item,
  align,
}: {
  item: LeadActivityItem;
  align: "left" | "right";
}) {
  const Icon = item.icon;

  return (
    <div
      className={`relative rounded-xl border bg-white p-4 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg ${
        align === "left" ? "md:text-right" : "md:text-left"
      }`}
      style={{
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className={`mb-2 flex items-center gap-2 ${
          align === "left" ? "md:flex-row-reverse md:justify-start" : ""
        }`}
      >
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5"
          style={{
            backgroundColor: "var(--brand-light-green)",
            color: "var(--brand-green)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {formatActivityDate(item.date)}
        </span>
      </div>
      <h4
        className="text-foreground mb-1"
        style={{ fontSize: "14px", fontWeight: 700 }}
      >
        {item.title}
      </h4>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted-foreground)",
          lineHeight: 1.5,
        }}
      >
        {item.description}
      </p>
      <div
        className={`mt-3 flex items-center gap-1.5 ${
          align === "left" ? "md:justify-end" : ""
        }`}
        style={{
          fontSize: "11px",
          color: "var(--brand-green)",
          fontWeight: 600,
        }}
      >
        <Icon className="w-3 h-3" />
        Activity logged
      </div>
    </div>
  );
}

function TimelineNode({ item }: { item: LeadActivityItem }) {
  const Icon = item.icon;

  return (
    <div className="relative z-10 flex items-center justify-center">
      <div
        className="absolute h-10 w-10 rounded-full transition-transform duration-300 ease-out group-hover:scale-125"
        style={{
          backgroundColor: "var(--brand-light-green)",
          boxShadow: "0 0 0 4px rgba(232, 245, 233, 0.8)",
        }}
      />
      <div
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-transform duration-300 ease-out group-hover:scale-110"
        style={{ borderColor: "var(--brand-green)" }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--brand-green)" }} />
      </div>
    </div>
  );
}

function TimelineRow({
  item,
  index,
}: {
  item: LeadActivityItem;
  index: number;
}) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.05,
      }}
      className="group relative"
    >
      <div className="relative pl-14 pb-10 last:pb-0 md:hidden">
        <div className="absolute left-[19px] top-5 z-10 -translate-x-1/2">
          <TimelineNode item={item} />
        </div>
        <ActivityCard item={item} align="right" />
      </div>

      <div className="relative hidden pb-16 last:pb-0 md:grid md:grid-cols-[1fr_48px_1fr] md:items-start md:gap-0">
        <div
          className={`col-start-1 ${isLeft ? "" : "invisible pointer-events-none"}`}
        >
          {isLeft && (
            <div className="pr-8">
              <ActivityCard item={item} align="left" />
            </div>
          )}
        </div>

        <div className="col-start-2 flex justify-center pt-2">
          <TimelineNode item={item} />
        </div>

        <div
          className={`col-start-3 ${!isLeft ? "" : "invisible pointer-events-none"}`}
        >
          {!isLeft && (
            <div className="pl-8">
              <ActivityCard item={item} align="right" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AddFollowUpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add follow-up activity"
      className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95"
      style={{
        borderColor: "var(--brand-green)",
        boxShadow: "0 0 0 4px rgba(232, 245, 233, 0.9)",
      }}
    >
      <Plus className="h-5 w-5" style={{ color: "var(--brand-green)" }} />
    </button>
  );
}

export function LeadActivityTimeline({
  lead,
  onAddFollowUp,
}: LeadActivityTimelineProps) {
  const [formOpen, setFormOpen] = useState(false);
  const activities = useMemo(() => getLeadActivityTimeline(lead), [lead]);

  const customerName = `${lead.firstName} ${lead.lastName}`.trim();

  const handleSubmit = (values: LeadFollowUpFormValues) => {
    if (onAddFollowUp) {
      onAddFollowUp(values);
    } else {
      createFollowUpActivity(values);
      toast.success("Follow-up logged");
    }
    setFormOpen(false);
  };

  return (
    <div className="relative mx-auto max-w-4xl py-2">
      <div
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 md:block"
        style={{
          background:
            "linear-gradient(to bottom, var(--brand-light-green), var(--brand-green), var(--brand-light-green))",
        }}
      />

      <div
        className="pointer-events-none absolute left-5 top-0 h-full w-0.5 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, var(--brand-light-green), var(--brand-green), var(--brand-light-green))",
        }}
      />

      {/* Desktop: + on center line */}
      <div className="relative mb-4 hidden md:flex md:justify-center">
        <AddFollowUpButton onClick={() => setFormOpen(true)} />
      </div>

      {/* Mobile: + on left line */}
      <div className="relative mb-4 flex justify-start pl-[14px] md:hidden">
        <AddFollowUpButton onClick={() => setFormOpen(true)} />
      </div>

      {activities.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA" }}
        >
          <p
            className="text-foreground mb-1"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            No activity yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
            Follow-up calls, emails, and notes will appear here.
          </p>
        </div>
      ) : (
        <div className="relative pb-4">
          {activities.map((item, index) => (
            <TimelineRow key={item.id} item={item} index={index} />
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setFormOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg"
            role="dialog"
            aria-modal
            aria-labelledby="follow-up-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <LeadFollowUpForm
              customerName={customerName}
              defaultProposalRef={lead.workflowData?.proposalId}
              defaultNextFollowUpDate={lead.nextFollowUpDate ?? ""}
              onSubmit={handleSubmit}
              onCancel={() => setFormOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
