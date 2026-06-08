import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, Target } from "lucide-react";

const monthlyLeads = [
  { month: "Jan", website: 12, google: 10, facebook: 5, referral: 8, phone: 4, organic: 3 },
  { month: "Feb", website: 15, google: 13, facebook: 7, referral: 10, phone: 5, organic: 5 },
  { month: "Mar", website: 18, google: 17, facebook: 9, referral: 9, phone: 5, organic: 3 },
  { month: "Apr", website: 14, google: 12, facebook: 6, referral: 7, phone: 6, organic: 3 },
  { month: "May", website: 22, google: 20, facebook: 11, referral: 11, phone: 5, organic: 3 },
  { month: "Jun", website: 20, google: 18, facebook: 10, referral: 10, phone: 5, organic: 5 },
];

const conversionBySource = [
  { source: "Referral", leads: 55, converted: 22, rate: 40, cpa: 0, revenue: 385000 },
  { source: "Website Forms", leads: 101, converted: 29, rate: 28.7, cpa: 420, revenue: 495000 },
  { source: "Google Ads", leads: 90, converted: 18, rate: 20, cpa: 680, revenue: 298000 },
  { source: "Phone Calls", leads: 25, converted: 8, rate: 32, cpa: 0, revenue: 142000 },
  { source: "Facebook Ads", leads: 48, converted: 7, rate: 14.6, cpa: 540, revenue: 118000 },
  { source: "Organic", leads: 29, converted: 5, rate: 17.2, cpa: 0, revenue: 95000 },
];

const revenueByMonth = [
  { month: "Jan", actual: 185000, projected: 200000 },
  { month: "Feb", actual: 220000, projected: 210000 },
  { month: "Mar", actual: 295000, projected: 270000 },
  { month: "Apr", actual: 210000, projected: 250000 },
  { month: "May", actual: 340000, projected: 310000 },
  { month: "Jun", actual: 318000, projected: 330000 },
];

const funnelData = [
  { stage: "New Inquiry", count: 348, percent: 100, color: "#64748B" },
  { stage: "Contacted", count: 289, percent: 83, color: "#0284C7" },
  { stage: "Qualified", count: 198, percent: 57, color: "#7C3AED" },
  { stage: "Site Visit", count: 142, percent: 41, color: "#D97706" },
  { stage: "Estimate Sent", count: 98, percent: 28, color: "#EA580C" },
  { stage: "Won", count: 61, percent: 18, color: "#16A34A" },
];

const sourceColors: Record<string, string> = {
  website: "#2E7D32",
  google: "#0284C7",
  facebook: "#7C3AED",
  referral: "#16A34A",
  phone: "#D97706",
  organic: "#64748B",
};

const kpis = [
  {
    label: "Total Revenue (YTD)",
    value: "$1,568,000",
    change: "+23.4%",
    positive: true,
    icon: DollarSign,
    color: "var(--brand-green)",
    bg: "var(--brand-light-green)",
  },
  {
    label: "Avg. Deal Size",
    value: "$25,705",
    change: "+8.2%",
    positive: true,
    icon: Target,
    color: "var(--status-blue)",
    bg: "#EFF6FF",
  },
  {
    label: "Lead Conversion Rate",
    value: "28.4%",
    change: "-2.1%",
    positive: false,
    icon: Percent,
    color: "var(--status-red)",
    bg: "#FEF2F2",
  },
  {
    label: "Avg. Cost Per Lead",
    value: "$412",
    change: "-12.5%",
    positive: true,
    icon: TrendingDown,
    color: "var(--status-green)",
    bg: "#F0FDF4",
  },
];

export function AnalyticsView() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-5 border"
              style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: kpi.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: kpi.positive ? "#F0FDF4" : "#FEF2F2",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: kpi.positive ? "var(--status-green)" : "var(--status-red)",
                  }}
                >
                  {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--foreground)" }}>
                {kpi.value}
              </div>
              <p className="mt-1" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Lead Volume by Source */}
        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
            Lead Volume by Source
          </h3>
          <p className="mb-4" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            Monthly breakdown — 6 months
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyLeads} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="website" stackId="a" fill={sourceColors.website} name="Website" radius={[0, 0, 0, 0]} />
              <Bar dataKey="google" stackId="a" fill={sourceColors.google} name="Google Ads" />
              <Bar dataKey="facebook" stackId="a" fill={sourceColors.facebook} name="Facebook" />
              <Bar dataKey="referral" stackId="a" fill={sourceColors.referral} name="Referral" />
              <Bar dataKey="phone" stackId="a" fill={sourceColors.phone} name="Phone" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Actual vs Projected */}
        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
            Revenue: Actual vs. Projected
          </h3>
          <p className="mb-4" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            Monthly revenue performance
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByMonth} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
                formatter={(v: number) => [`$${(v / 1000).toFixed(0)}k`]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="actual" stroke="#2E7D32" strokeWidth={2.5} fill="url(#actualGrad)" name="Actual" />
              <Line type="monotone" dataKey="projected" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Conversion Funnel */}
        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
            Pipeline Funnel
          </h3>
          <p className="mb-4" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            Stage-by-stage conversion
          </p>
          <div className="space-y-2.5">
            {funnelData.map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: "12px", color: "var(--foreground)" }}>{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>{stage.count}</span>
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{stage.percent}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${stage.percent}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Conversion Table */}
        <div
          className="col-span-2 bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
            Source Performance
          </h3>
          <p className="mb-4" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            Lead source ROI analysis — YTD
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Source", "Leads", "Converted", "Conv. Rate", "CPA", "Revenue"].map((h) => (
                    <th
                      key={h}
                      className="pb-2 text-left"
                      style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)", paddingRight: "16px" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {conversionBySource.map((row, i) => (
                  <tr
                    key={row.source}
                    style={{ borderBottom: i < conversionBySource.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: Object.values(sourceColors)[i] || "#64748B" }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>
                          {row.source}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4" style={{ fontSize: "13px", color: "var(--foreground)" }}>
                      {row.leads}
                    </td>
                    <td className="py-3 pr-4" style={{ fontSize: "13px", color: "var(--foreground)" }}>
                      {row.converted}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: "#F1F5F9" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.rate}%`,
                              backgroundColor: row.rate > 25 ? "var(--status-green)" : row.rate > 15 ? "var(--status-orange)" : "var(--status-red)",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: row.rate > 25 ? "var(--status-green)" : row.rate > 15 ? "var(--status-orange)" : "var(--status-red)",
                          }}
                        >
                          {row.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4" style={{ fontSize: "13px", color: "var(--foreground)" }}>
                      {row.cpa ? `$${row.cpa}` : "—"}
                    </td>
                    <td className="py-3" style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand-green)" }}>
                      ${(row.revenue / 1000).toFixed(0)}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
