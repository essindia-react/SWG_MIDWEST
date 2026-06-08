export const ROUTES = {
  dashboard: "/",
  leads: "/leads",
  leadDetail: (id: string) => `/leads/${id}`,
  pipeline: "/pipeline",
  projects: "/projects",
  fieldOperations: "/field-operations",
  tasks: "/tasks",
  calendar: "/calendar",
  communications: "/communications",
  quotes: "/quotes",
  automations: "/automations",
  analytics: "/analytics",
  mobile: "/mobile",
  settings: "/settings",
} as const;

export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.leads]: "All Leads",
  [ROUTES.pipeline]: "Lead Pipeline",
  [ROUTES.projects]: "Project Management",
  [ROUTES.fieldOperations]: "Field Operations",
  [ROUTES.tasks]: "Task Management",
  [ROUTES.calendar]: "Calendar & Scheduling",
  [ROUTES.communications]: "Communications Center",
  [ROUTES.quotes]: "Quotes & Proposals",
  [ROUTES.automations]: "Automation Builder",
  [ROUTES.analytics]: "Lead Source Analytics",
  [ROUTES.mobile]: "Mobile Sales View",
  [ROUTES.settings]: "Settings",
};

const LEAD_WORKFLOW_TITLES: Record<string, string> = {
  "site-visit": "Site Visit",
  design: "Design",
  estimation: "Estimation",
  proposal: "Proposal",
  documents: "Documents",
};

export function getPageTitle(pathname: string, search = ""): string {
  if (/^\/leads\/[^/]+$/.test(pathname)) {
    return "Lead Detail";
  }
  if (pathname === ROUTES.leads) {
    const step = new URLSearchParams(search).get("step");
    if (step && LEAD_WORKFLOW_TITLES[step]) {
      return LEAD_WORKFLOW_TITLES[step];
    }
  }
  return ROUTE_TITLES[pathname] ?? "Dashboard";
}
