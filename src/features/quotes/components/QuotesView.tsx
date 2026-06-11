import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  ChevronDown,
  AlertCircle,
  Star,
  Building2,
} from "lucide-react";

type QuoteStatus = "draft" | "sent" | "viewed" | "approved" | "declined" | "expired";

interface Quote {
  id: string;
  number: string;
  lead: string;
  contact: string;
  amount: number;
  status: QuoteStatus;
  sentDate: string;
  expiryDate: string;
  viewedDate?: string;
  rep: string;
  repInitials: string;
  followUpDate?: string;
  lineItems: { description: string; sqft?: number; unit: string; unitPrice: number; total: number }[];
}

const quotes: Quote[] = [
  {
    id: "1",
    number: "QT-2026-0087",
    lead: "Henderson Estate",
    contact: "Robert Henderson",
    amount: 42850,
    status: "sent",
    sentDate: "Jun 5, 2026",
    expiryDate: "Jun 19, 2026",
    rep: "Maria S.",
    repInitials: "MS",
    followUpDate: "Jun 12, 2026",
    lineItems: [
      { description: "SWG Pet Pro 80 — Emerald Turf", sqft: 1800, unit: "sq ft", unitPrice: 5.25, total: 9450 },
      { description: "Cooling Infill Blend", unit: "lump sum", unitPrice: 1035, total: 1035 },
      { description: "Drainage Correction & Base Prep", unit: "lump sum", unitPrice: 10450, total: 10450 },
      { description: "Crew Labor & Installation", unit: "lump sum", unitPrice: 21915, total: 21915 },
    ],
  },
  {
    id: "2",
    number: "QT-2026-0085",
    lead: "Park Estates Dev.",
    contact: "Robert Fox",
    amount: 178000,
    status: "sent",
    sentDate: "Jun 2, 2026",
    expiryDate: "Jun 16, 2026",
    viewedDate: "Jun 3, 2026",
    rep: "Chris W.",
    repInitials: "CW",
    followUpDate: "Jun 10, 2026",
    lineItems: [
      { description: "SWG Tour Pro 12 — Bent Putting Green Turf", sqft: 4200, unit: "sq ft", unitPrice: 18.50, total: 77700 },
      { description: "Grading & Drainage System", unit: "lump sum", unitPrice: 5600, total: 5600 },
      { description: "LED Cup Lighting Package", unit: "lump sum", unitPrice: 3200, total: 3200 },
      { description: "Professional Installation Labor", unit: "lump sum", unitPrice: 91500, total: 91500 },
    ],
  },
  {
    id: "3",
    number: "QT-2026-0083",
    lead: "Rivera Pool & Turf",
    contact: "Tony Rivera",
    amount: 62000,
    status: "viewed",
    sentDate: "Jun 4, 2026",
    expiryDate: "Jun 18, 2026",
    viewedDate: "Jun 5, 2026",
    rep: "Chris W.",
    repInitials: "CW",
    followUpDate: "Jun 14, 2026",
    lineItems: [
      { description: "SWG Landscape Premium 55 Turf Borders", sqft: 2800, unit: "sq ft", unitPrice: 8.75, total: 24500 },
      { description: "Belgard Holland Paver Walkway", sqft: 600, unit: "sq ft", unitPrice: 12.50, total: 7500 },
      { description: "Concrete Demo & Drainage", unit: "lump sum", unitPrice: 7300, total: 7300 },
      { description: "Phased Installation Labor", unit: "lump sum", unitPrice: 22700, total: 22700 },
    ],
  },
  {
    id: "4",
    number: "QT-2026-0080",
    lead: "Sunbelt Properties",
    contact: "Project Manager",
    amount: 72000,
    status: "approved",
    sentDate: "May 22, 2026",
    expiryDate: "Jun 5, 2026",
    viewedDate: "May 25, 2026",
    rep: "Chris W.",
    repInitials: "CW",
    lineItems: [
      { description: "SWG Sports Pro 60 — Field Green Turf", sqft: 5200, unit: "sq ft", unitPrice: 7.25, total: 37700 },
      { description: "Shock Pad 10mm Underlayment", sqft: 5200, unit: "sq ft", unitPrice: 1.85, total: 9620 },
      { description: "Grading, Drainage & Line Markings", unit: "lump sum", unitPrice: 16600, total: 16600 },
      { description: "Professional Installation Labor", unit: "lump sum", unitPrice: 8080, total: 8080 },
    ],
  },
];

const statusConfig: Record<QuoteStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  draft: { label: "Draft", color: "#64748B", bg: "#F8FAFC", icon: FileText },
  sent: { label: "Sent", color: "#0284C7", bg: "#EFF6FF", icon: Send },
  viewed: { label: "Viewed", color: "#7C3AED", bg: "#F5F3FF", icon: Eye },
  approved: { label: "Approved", color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  declined: { label: "Declined", color: "#DC2626", bg: "#FEF2F2", icon: XCircle },
  expired: { label: "Expired", color: "#D97706", bg: "#FFF7ED", icon: Clock },
};

const repColors: Record<string, string> = {
  EC: "#7C3AED",
  MS: "#2E7D32",
  CW: "#D97706",
  AJ: "#0284C7",
};

export function QuotesView() {
  const [selected, setSelected] = useState<Quote | null>(quotes[0]);
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | "all">("all");

  const filtered = quotes.filter((q) => filterStatus === "all" || q.status === filterStatus);

  const totalValue = quotes.reduce((s, q) => s + q.amount, 0);
  const approvedValue = quotes.filter((q) => q.status === "approved").reduce((s, q) => s + q.amount, 0);
  const pendingValue = quotes.filter((q) => ["sent", "viewed"].includes(q.status)).reduce((s, q) => s + q.amount, 0);

  return (
    <div className="flex h-full overflow-hidden">
      {/* List Panel */}
      <div
        className="w-80 flex-shrink-0 border-r flex flex-col bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Quotes & Proposals
            </h3>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: "var(--brand-green)", fontSize: "12px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Total", value: `$${(totalValue / 1000).toFixed(0)}k`, color: "var(--brand-green)", bg: "var(--brand-light-green)" },
              { label: "Approved", value: `$${(approvedValue / 1000).toFixed(0)}k`, color: "var(--status-green)", bg: "#F0FDF4" },
              { label: "Pending", value: `$${(pendingValue / 1000).toFixed(0)}k`, color: "var(--status-orange)", bg: "#FFF7ED" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-2 rounded-lg" style={{ backgroundColor: s.bg }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className="w-full pl-8 pr-3 py-2 border rounded-lg"
              placeholder="Search quotes..."
              style={{ fontSize: "12px", borderColor: "var(--border)" }}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="px-3 py-2 border-b flex flex-wrap gap-1" style={{ borderColor: "var(--border)" }}>
          {(["all", "draft", "sent", "viewed", "approved", "declined"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-2.5 py-1 rounded-full capitalize transition-all"
              style={{
                fontSize: "11px",
                fontWeight: filterStatus === s ? 600 : 400,
                backgroundColor: filterStatus === s ? "var(--brand-green)" : "var(--muted)",
                color: filterStatus === s ? "white" : "var(--muted-foreground)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quote List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((quote) => {
            const status = statusConfig[quote.status];
            const StatusIcon = status.icon;
            const isSelected = selected?.id === quote.id;
            const isOverdue = quote.status === "sent" && quote.followUpDate === "Jun 6, 2026";

            return (
              <button
                key={quote.id}
                onClick={() => setSelected(quote)}
                className="w-full text-left p-4 border-b transition-colors"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: isSelected ? "var(--brand-light-green)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                      {quote.lead}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{quote.number}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: status.bg }}>
                    <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
                    <span style={{ fontSize: "10px", fontWeight: 600, color: status.color }}>{status.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand-green)" }}>
                    ${quote.amount.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{quote.sentDate}</span>
                </div>
                {isOverdue && (
                  <div
                    className="mt-2 flex items-center gap-1 px-2 py-1 rounded"
                    style={{ backgroundColor: "#FEF2F2" }}
                  >
                    <AlertCircle className="w-3 h-3" style={{ color: "var(--status-red)" }} />
                    <span style={{ fontSize: "10px", color: "var(--status-red)", fontWeight: 500 }}>
                      Follow-up overdue
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-y-auto bg-white">
        {selected ? (
          <div className="max-w-3xl mx-auto p-6">
            {/* Quote Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: statusConfig[selected.status].bg,
                      color: statusConfig[selected.status].color,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {(() => {
                      const Icon = statusConfig[selected.status].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                    {statusConfig[selected.status].label}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>{selected.number}</span>
                </div>
                <h2 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{selected.lead}</h2>
                <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Contact: {selected.contact}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected.status === "draft" && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
                  >
                    <Send className="w-4 h-4" />
                    Send Quote
                  </button>
                )}
                {(selected.status === "sent" || selected.status === "viewed") && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted"
                    style={{ fontSize: "13px", borderColor: "var(--border)" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend
                  </button>
                )}
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted"
                  style={{ fontSize: "13px", borderColor: "var(--border)" }}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button className="p-2 rounded-lg border hover:bg-muted" style={{ borderColor: "var(--border)" }}>
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Quote Value", value: `$${selected.amount.toLocaleString()}`, icon: DollarSign, color: "var(--brand-green)", bg: "var(--brand-light-green)" },
                { label: "Sent Date", value: selected.sentDate, icon: Send, color: "var(--status-blue)", bg: "#EFF6FF" },
                { label: "Expires", value: selected.expiryDate, icon: Calendar, color: "var(--status-orange)", bg: "#FFF7ED" },
                { label: "Sales Rep", value: selected.rep, icon: User, color: "#7C3AED", bg: "#F5F3FF" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border p-3"
                    style={{ borderColor: "var(--border)", backgroundColor: item.bg }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{item.label}</span>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Line Items */}
            {selected.lineItems.length > 0 && (
              <div
                className="rounded-xl border overflow-hidden mb-6"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA" }}>
                  <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                    Line Items
                  </h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                      {["Description", "Quantity", "Unit Price", "Total"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left"
                          style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lineItems.map((item, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: i < selected.lineItems.length - 1 ? "1px solid var(--border)" : "none" }}
                      >
                        <td className="px-5 py-3">
                          <p className="text-foreground" style={{ fontSize: "13px" }}>{item.description}</p>
                          {item.sqft && (
                            <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{item.sqft.toLocaleString()} sq ft</p>
                          )}
                        </td>
                        <td className="px-5 py-3" style={{ fontSize: "13px", color: "var(--foreground)" }}>
                          {item.sqft ? `${item.sqft.toLocaleString()} sq ft` : item.unit}
                        </td>
                        <td className="px-5 py-3" style={{ fontSize: "13px", color: "var(--foreground)" }}>
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-5 py-3" style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                          ${item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total Footer */}
                <div
                  className="px-5 py-4 border-t flex justify-end"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--brand-light-green)" }}
                >
                  <div className="text-right">
                    <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Total Amount</p>
                    <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--brand-green)" }}>
                      ${selected.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up section */}
            {selected.followUpDate && (
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: "#FCD34D", backgroundColor: "#FFFBEB" }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: "var(--status-orange)" }} />
                  <div>
                    <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                      Follow-up Reminder
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      Scheduled for {selected.followUpDate} — Contact client about proposal status
                    </p>
                  </div>
                  <button
                    className="ml-auto px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "var(--status-orange)", color: "white", fontSize: "12px" }}
                  >
                    View Task
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Select a quote to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
