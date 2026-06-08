import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Trophy,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router";
import { useLeads } from "../../../hooks/useLeads";
import {
  getLeadFullName,
  getLeadSourceLabel,
  getNewLeadsToday,
  getProjectTypeLabel,
  getRecentNewLeads,
  getTotalPipelineValue,
} from "../../../lib/leadHelpers";
import { formatCurrency, formatRelativeTime } from "../../../lib/formatters";
import { ROUTES } from "../../../routes/paths";

const pipelineData = [
  { month: "Jan", leads: 42, won: 11, revenue: 185000 },
  { month: "Feb", leads: 55, won: 14, revenue: 220000 },
  { month: "Mar", leads: 61, won: 18, revenue: 295000 },
  { month: "Apr", leads: 48, won: 13, revenue: 210000 },
  { month: "May", leads: 72, won: 21, revenue: 340000 },
  { month: "Jun", leads: 68, won: 20, revenue: 318000 },
];

const sourceData = [
  { name: "Website Forms", value: 32, color: "#2E7D32" },
  { name: "Google Ads", value: 28, color: "#0284C7" },
  { name: "Referrals", value: 20, color: "#D97706" },
  { name: "Facebook Ads", value: 12, color: "#7C3AED" },
  { name: "Phone Calls", value: 5, color: "#DC2626" },
  { name: "Organic", value: 3, color: "#64748B" },
];

const salesRepData = [
  { name: "Alex J.", leads: 24, won: 8, revenue: 142000 },
  { name: "Maria S.", leads: 31, won: 10, revenue: 189000 },
  { name: "Chris W.", leads: 18, won: 5, revenue: 98000 },
  { name: "Emily C.", leads: 27, won: 9, revenue: 156000 },
];

const recentActivities = [
  { id: 1, type: "call", user: "Maria S.", lead: "Henderson Residence", time: "8m ago", detail: "Completed site visit call" },
  { id: 2, type: "email", user: "Alex J.", lead: "Riverside HOA", time: "23m ago", detail: "Sent proposal — $48,500" },
  { id: 3, type: "note", user: "Emily C.", lead: "Park Estates Dev.", time: "1h ago", detail: "Client requested 3-phase install" },
  { id: 4, type: "won", user: "Chris W.", lead: "Sunbelt Properties", time: "2h ago", detail: "Deal closed — $72,000" },
  { id: 5, type: "task", user: "Maria S.", lead: "Thornton Family", time: "3h ago", detail: "Follow-up call scheduled Fri 2pm" },
  { id: 6, type: "email", user: "Alex J.", lead: "Desert Vista HOA", time: "4h ago", detail: "Quote follow-up sent" },
];

const upcomingTasks = [
  { id: 1, title: "Site visit — Martinez Residence", due: "Today 10:00 AM", priority: "high", lead: "Martinez Residence" },
  { id: 2, title: "Call back Henderson re: pricing", due: "Today 2:00 PM", priority: "medium", lead: "Henderson Estate" },
  { id: 3, title: "Send revised quote to Riverside HOA", due: "Tomorrow 9:00 AM", priority: "high", lead: "Riverside HOA" },
  { id: 4, title: "Follow up with Park Estates", due: "Jun 7, 11:00 AM", priority: "medium", lead: "Park Estates Dev." },
  { id: 5, title: "Review installation plans", due: "Jun 8, 3:00 PM", priority: "low", lead: "Sunbelt Properties" },
];

const priorityColors: Record<string, string> = {
  high: "var(--status-red)",
  medium: "var(--status-orange)",
  low: "var(--status-green)",
};
const priorityBg: Record<string, string> = {
  high: "#FEF2F2",
  medium: "#FFF7ED",
  low: "#F0FDF4",
};

function ActivityIcon({ type }: { type: string }) {
  const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
    call: {
      bg: "#EFF6FF",
      icon: <Phone className="w-3.5 h-3.5" style={{ color: "var(--status-blue)" }} />,
    },
    email: {
      bg: "#F0FDF4",
      icon: <Mail className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />,
    },
    note: {
      bg: "#FFF7ED",
      icon: <FileText className="w-3.5 h-3.5" style={{ color: "var(--status-orange)" }} />,
    },
    won: {
      bg: "#F0FDF4",
      icon: <Trophy className="w-3.5 h-3.5" style={{ color: "var(--status-green)" }} />,
    },
    task: {
      bg: "#F5F3FF",
      icon: <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />,
    },
    "new-lead": {
      bg: "#F0FDF4",
      icon: <UserCircle className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />,
    },
  };
  const s = styles[type] || styles.note;
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: s.bg }}
    >
      {s.icon}
    </div>
  );
}

export function DashboardView() {
  const { leads, userAddedLeads } = useLeads();

  const newLeadsToday = useMemo(() => getNewLeadsToday(leads), [leads]);
  const recentNewLeads = useMemo(() => getRecentNewLeads(leads, 5), [leads]);
  const pipelineValue = useMemo(() => getTotalPipelineValue(leads), [leads]);

  const leadActivities = useMemo(
    () =>
      userAddedLeads.map((lead) => ({
        id: lead.id,
        leadId: lead.id,
        type: "new-lead" as const,
        user: "You",
        lead: getLeadFullName(lead),
        time: formatRelativeTime(lead.createdAt),
        detail: `New lead — ${getProjectTypeLabel(lead.projectType)} via ${getLeadSourceLabel(lead.leadSource)}`,
        sortTime: new Date(lead.createdAt).getTime(),
      })),
    [userAddedLeads]
  );

  const combinedActivities = useMemo(() => {
    const staticActs = recentActivities.map((act, i) => ({
      ...act,
      sortTime: Date.now() - (i + 1) * 60 * 60 * 1000,
    }));
    return [...leadActivities, ...staticActs]
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 6);
  }, [leadActivities]);

  const statCards = [
    {
      label: "Total Leads",
      value: String(leads.length),
      change: userAddedLeads.length > 0 ? `+${userAddedLeads.length}` : "+0",
      positive: true,
      icon: Users,
      color: "var(--brand-green)",
      bg: "var(--brand-light-green)",
    },
    {
      label: "Active Opportunities",
      value: String(leads.filter((l) => !["won", "lost"].includes(l.status)).length),
      change: "+8%",
      positive: true,
      icon: TrendingUp,
      color: "var(--status-blue)",
      bg: "#EFF6FF",
    },
    {
      label: "Revenue Pipeline",
      value: formatCurrency(pipelineValue),
      change: "+23%",
      positive: true,
      icon: DollarSign,
      color: "var(--brand-green)",
      bg: "var(--brand-light-green)",
    },
    {
      label: "Quotes Sent",
      value: String(leads.filter((l) => l.status === "quoted").length),
      change: "+5%",
      positive: true,
      icon: FileText,
      color: "var(--status-orange)",
      bg: "#FFF7ED",
    },
    {
      label: "Won Projects",
      value: String(leads.filter((l) => l.status === "won").length),
      change: "+18%",
      positive: true,
      icon: Trophy,
      color: "var(--status-green)",
      bg: "#F0FDF4",
    },
    {
      label: "Conversion Rate",
      value: "28.4%",
      change: "-2.1%",
      positive: false,
      icon: TrendingUp,
      color: "var(--status-red)",
      bg: "#FEF2F2",
    },
    {
      label: "New Leads Today",
      value: String(newLeadsToday.length),
      change: userAddedLeads.length > 0 ? `+${userAddedLeads.length} new` : "+0",
      positive: true,
      icon: Users,
      color: "var(--status-blue)",
      bg: "#EFF6FF",
    },
    {
      label: "Overdue Tasks",
      value: "12",
      change: "+4",
      positive: false,
      icon: AlertCircle,
      color: "var(--status-red)",
      bg: "#FEF2F2",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-4 border"
              style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: card.bg }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: card.color, width: 18, height: 18 }} />
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: card.positive ? "#F0FDF4" : "#FEF2F2",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: card.positive ? "var(--status-green)" : "var(--status-red)",
                  }}
                >
                  {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              <div className="text-foreground" style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1 }}>
                {card.value}
              </div>
              <div className="mt-1" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {recentNewLeads.length > 0 && (
        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                New Leads
              </h3>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                {recentNewLeads.length} lead{recentNewLeads.length !== 1 ? "s" : ""} awaiting first contact
              </p>
            </div>
            <Link
              to={ROUTES.leads}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-muted"
              style={{ fontSize: "12px", borderColor: "var(--border)", color: "var(--brand-green)", textDecoration: "none" }}
            >
              View all leads
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {recentNewLeads.map((lead) => {
              const isNewToday = newLeadsToday.some((l) => l.id === lead.id);
              return (
                <Link
                  key={lead.id}
                  to={ROUTES.leadDetail(lead.id)}
                  className="rounded-xl border p-3 block no-underline transition-colors hover:border-green-300"
                  style={{
                    borderColor: isNewToday ? "#86EFAC" : "var(--border)",
                    backgroundColor: isNewToday ? "#F0FDF4" : "#FAFAFA",
                    color: "inherit",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
                      <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {getLeadFullName(lead)}
                      </p>
                    </div>
                    {isNewToday && (
                      <span
                        className="px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          backgroundColor: "var(--brand-green)",
                          color: "#fff",
                          textTransform: "uppercase",
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                    <p className="truncate" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                      {lead.city}, OH
                    </p>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {getProjectTypeLabel(lead.projectType)}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: 2 }}>
                    {formatRelativeTime(lead.createdAt)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div
          className="col-span-2 bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                Pipeline Performance
              </h3>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Leads vs. Won vs. Revenue (6 months)</p>
            </div>
            <select
              className="border rounded-lg px-3 py-1.5 text-foreground"
              style={{ fontSize: "12px", borderColor: "var(--border)" }}
            >
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={pipelineData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="leads" stroke="#0284C7" strokeWidth={2} fill="url(#leadsGrad)" name="Leads" />
              <Area type="monotone" dataKey="won" stroke="#2E7D32" strokeWidth={2} fill="url(#wonGrad)" name="Won" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
            Lead Sources
          </h3>
          <p className="mb-4" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            This month
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {sourceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{s.name}</span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--foreground)" }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            Sales Performance
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={salesRepData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="leads" fill="#0284C7" name="Leads" radius={[3, 3, 0, 0]} />
              <Bar dataKey="won" fill="#2E7D32" name="Won" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {combinedActivities.map((act) => {
              const content = (
                <>
                  <ActivityIcon type={act.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>
                      {act.lead}
                    </p>
                    <p className="truncate" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                      {act.detail}
                    </p>
                  </div>
                  <span className="flex-shrink-0" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {act.time}
                  </span>
                </>
              );

              if ("leadId" in act && act.leadId) {
                return (
                  <Link
                    key={act.id}
                    to={ROUTES.leadDetail(act.leadId)}
                    className="flex items-start gap-3 rounded-lg p-1 -m-1 no-underline hover:bg-muted transition-colors"
                    style={{ color: "inherit" }}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={act.id} className="flex items-start gap-3">
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-5 border"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Upcoming Tasks
            </h3>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FEF2F2", color: "var(--status-red)", fontSize: "11px", fontWeight: 600 }}
            >
              12 overdue
            </span>
          </div>
          <div className="space-y-2.5">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border"
                style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA" }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityColors[task.priority] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{task.due}</span>
                  </div>
                </div>
                <div
                  className="px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: priorityBg[task.priority],
                    color: priorityColors[task.priority],
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
