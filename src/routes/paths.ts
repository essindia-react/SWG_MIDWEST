export const ROUTES = {
  dashboard: "/",
  leads: "/leads",
  leadDetail: (id: string) => `/leads/${id}`,
  pipeline: "/pipeline",
  projects: "/projects",
  fieldOperations: "/field-operations",
  tasks: "/tasks",
  tasksMobile: "/tasks/mobile",
  mobileTaskManagement: "/mobile-task-management",
  calendar: "/calendar",
  communications: "/communications",
  quotes: "/quotes",
  invoicing: "/invoicing",
  automations: "/automations",
  analytics: "/analytics",
  mobile: "/mobile",
  siteMaterialRequest: "/site-material-request",
  siteMaterialRequestMobile: "/site-material-request/mobile",
  inventory: "/inventory",
  inventoryTab: (tab: string) => `/inventory?tab=${tab}`,
  purchaseRequisition: "/purchase-requisition",
  settings: "/settings",
  employees: "/hr/employees",
  clockInOut: "/hr/clock-in-out",
  timesheetSummary: "/hr/timesheets",
  vehicleMaster: "/transportation/vehicles",
  gpsDashboard: "/transportation/dashboard",
  tripHistory: "/transportation/trips",
  vehicleDetail: (id: string) => `/transportation/vehicles/${id}`,
} as const;

export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.leads]: "All Leads",
  [ROUTES.pipeline]: "Lead Pipeline",
  [ROUTES.projects]: "Project Management",
  [ROUTES.fieldOperations]: "Field Operations",
  [ROUTES.tasks]: "Task Management",
  [ROUTES.mobileTaskManagement]: "Mobile Task Management",
  [ROUTES.calendar]: "Calendar & Scheduling",
  [ROUTES.communications]: "Communications Center",
  [ROUTES.quotes]: "Quotes & Proposals",
  [ROUTES.invoicing]: "Invoicing & Milestone Payments",
  [ROUTES.automations]: "Automation Builder",
  [ROUTES.analytics]: "Lead Source Analytics",
  [ROUTES.mobile]: "Mobile Sales View",
  [ROUTES.siteMaterialRequest]: "Site Material Request",
  [ROUTES.inventory]: "Inventory Management",
  [ROUTES.purchaseRequisition]: "Purchase Requisitions",
  [ROUTES.settings]: "Settings",
  [ROUTES.employees]: "Employee Records",
  [ROUTES.clockInOut]: "Clock In / Out",
  [ROUTES.timesheetSummary]: "Timesheet Summary",
  [ROUTES.vehicleMaster]: "Vehicle / Asset Master",
  [ROUTES.gpsDashboard]: "GPS Tracking Dashboard",
  [ROUTES.tripHistory]: "Trip History",
};

const LEAD_WORKFLOW_TITLES: Record<string, string> = {
  "site-visit": "Site Visit",
  design: "Design",
  estimation: "Estimation",
  proposal: "Proposal",
  documents: "Documents",
};

const INVENTORY_TAB_TITLES: Record<string, string> = {
  master: "Products",
  "stock-ledger": "Stock Ledger",
  "material-requests": "Material Requests",
  "product-swaps": "Product Swaps",
  reports: "Inventory Reports",
};

export function getPageTitle(pathname: string, search = ""): string {
  if (/^\/leads\/[^/]+$/.test(pathname)) {
    return "Lead Detail";
  }
  if (/^\/transportation\/vehicles\/[^/]+$/.test(pathname)) {
    return "Vehicle Details";
  }
  if (pathname === ROUTES.leads) {
    const step = new URLSearchParams(search).get("step");
    if (step && LEAD_WORKFLOW_TITLES[step]) {
      return LEAD_WORKFLOW_TITLES[step];
    }
  }
  if (pathname === ROUTES.inventory) {
    const tab = new URLSearchParams(search).get("tab") ?? "master";
    if (INVENTORY_TAB_TITLES[tab]) {
      return INVENTORY_TAB_TITLES[tab];
    }
  }
  return ROUTE_TITLES[pathname] ?? "Dashboard";
}
