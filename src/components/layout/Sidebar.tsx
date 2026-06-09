// sideNave 1
import React from "react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  FolderKanban,
  HardHat,
  CheckSquare,
  Calendar,
  MessageSquare,
  FileText,
  Receipt,
  Zap,
  BarChart3,
  Settings,
  Package,
  Warehouse,
  Leaf,
  ChevronRight,
  ChevronDown,
  Smartphone,
} from "lucide-react";
import { INVENTORY_TABS } from "../../features/inventory/constants/inventoryConstants";
import { LEAD_WORKFLOW_SECTIONS } from "../../features/leads/constants/leadWorkflowSections";
import { ROUTES } from "../../routes/paths";

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.leads, label: "Leads", icon: Users, hasWorkflowMenu: true },
  { to: ROUTES.pipeline, label: "Pipeline", icon: GitBranch },
  { to: ROUTES.projects, label: "Project Management", icon: FolderKanban },
  { to: ROUTES.fieldOperations, label: "Field Operations", icon: HardHat },
  { to: ROUTES.tasks, label: "Task Management", icon: CheckSquare },
  // {
  //   to: ROUTES.mobileTaskManagement,
  //   label: "Mobile Task Management",
  //   icon: Smartphone,
  //   openMobileInNewTab: true,
  //   mobileRoute: ROUTES.tasksMobile,
  // },
  { to: ROUTES.calendar, label: "Calendar", icon: Calendar },
  // { to: ROUTES.communications, label: "Communications", icon: MessageSquare },
  // { to: ROUTES.quotes, label: "Quotes", icon: FileText },
  { to: ROUTES.invoicing, label: "Invoicing", icon: Receipt },
  // { to: ROUTES.automations, label: "Automations", icon: Zap },
  // { to: ROUTES.analytics, label: "Analytics", icon: BarChart3 },
  { to: ROUTES.inventory, label: "Inventory", icon: Warehouse, hasInventoryMenu: true },
  { to: ROUTES.siteMaterialRequest, label: "Site Material Request", icon: Package },
  // { to: ROUTES.mobile, label: "Mobile View", icon: Smartphone },
  // { to: ROUTES.settings, label: "Settings", icon: Settings },
];

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPAND_MS = 300;
const SUBMENU_OPEN_DELAY_MS = 120;
const STEP_ICON_SIZE = 32;
const STEP_GAP = 10;
const STEP_ROW_MIN_HEIGHT = 52;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function InventorySubMenu({
  activeTab,
  isVisible,
  onItemSelect,
}: {
  activeTab: string;
  isVisible: boolean;
  onItemSelect: () => void;
}) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-200 ease-out"
      style={{ gridTemplateRows: isVisible ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="ml-1 pr-1">
          <div className="flex flex-col gap-1 ml-5">
            {INVENTORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <NavLink
                  key={tab.id}
                  to={ROUTES.inventoryTab(tab.id)}
                  onClick={onItemSelect}
                  className="flex items-center no-underline rounded-lg px-3 py-1.5 transition-colors hover:bg-white/8"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                    opacity: isActive ? 1 : 0.88,
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      display: "block",
                    }}
                  >
                    {tab.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadWorkflowSubMenu({
  activeStep,
  isVisible,
  onItemSelect,
}: {
  activeStep: string | null;
  isVisible: boolean;
  onItemSelect: () => void;
}) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-200 ease-out"
      style={{ gridTemplateRows: isVisible ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="ml-1 pr-1">
          <div className="flex flex-col gap-2 ml-5">
            {LEAD_WORKFLOW_SECTIONS.map((section) => {
              const isActive = activeStep === section.id;

              return (
                <NavLink
                  key={section.id}
                  to={`${ROUTES.leads}?step=${section.id}`}
                  onClick={onItemSelect}
                  className="flex items-center no-underline rounded-lg px-3 py-1.5 transition-colors hover:bg-white/8"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                    opacity: isActive ? 1 : 0.88,
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      display: "block",
                    }}
                  >
                    {section.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(true);
  const [hoverExpandEnabled, setHoverExpandEnabled] = useState(true);
  const [leadsExpanded, setLeadsExpanded] = useState(true);
  const [leadsSubmenuVisible, setLeadsSubmenuVisible] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);
  const [inventorySubmenuVisible, setInventorySubmenuVisible] = useState(false);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inventorySubmenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLeadsPage = location.pathname === ROUTES.leads;
  const isLeadsSection =
    isLeadsPage || /^\/leads\/[^/]+$/.test(location.pathname);
  const activeStep = new URLSearchParams(location.search).get("step");

  const isInventoryPage = location.pathname === ROUTES.inventory;
  const isInventorySection = isInventoryPage;
  const activeInventoryTab = new URLSearchParams(location.search).get("tab") ?? "master";

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    if (isLeadsSection) setLeadsExpanded(true);
  }, [isLeadsSection]);

  useEffect(() => {
    if (isInventorySection) setInventoryExpanded(true);
  }, [isInventorySection]);

  useEffect(() => {
    return () => {
      if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
      if (inventorySubmenuTimerRef.current) clearTimeout(inventorySubmenuTimerRef.current);
    };
  }, []);

  const isOpen = !collapsed;
  const sidebarWidth = isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const showLeadsSubmenu =
    isOpen && ((isLeadsSection && leadsExpanded) || leadsSubmenuVisible);
  const showInventorySubmenu =
    isOpen && ((isInventorySection && inventoryExpanded) || inventorySubmenuVisible);

  const clearSubmenuTimer = () => {
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
      submenuTimerRef.current = null;
    }
  };

  const scheduleLeadsSubmenuOpen = (wasCollapsed: boolean) => {
    clearSubmenuTimer();
    const delay = wasCollapsed ? SIDEBAR_EXPAND_MS : SUBMENU_OPEN_DELAY_MS;
    submenuTimerRef.current = setTimeout(() => {
      setLeadsSubmenuVisible(true);
    }, delay);
  };

  const resetLeadsSubmenu = () => {
    clearSubmenuTimer();
    if (!isLeadsSection) {
      setLeadsSubmenuVisible(false);
    }
  };

  const clearInventorySubmenuTimer = () => {
    if (inventorySubmenuTimerRef.current) {
      clearTimeout(inventorySubmenuTimerRef.current);
      inventorySubmenuTimerRef.current = null;
    }
  };

  const scheduleInventorySubmenuOpen = (wasCollapsed: boolean) => {
    clearInventorySubmenuTimer();
    const delay = wasCollapsed ? SIDEBAR_EXPAND_MS : SUBMENU_OPEN_DELAY_MS;
    inventorySubmenuTimerRef.current = setTimeout(() => {
      setInventorySubmenuVisible(true);
    }, delay);
  };

  const resetInventorySubmenu = () => {
    clearInventorySubmenuTimer();
    if (!isInventorySection) {
      setInventorySubmenuVisible(false);
    }
  };

  const handleSidebarMouseEnter = () => {
    if (!isMobile && hoverExpandEnabled) {
      setCollapsed(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    setHoverExpandEnabled(true);
    setCollapsed(true);
    resetLeadsSubmenu();
    resetInventorySubmenu();
  };

  const handleNavSelect = () => {
    setCollapsed(true);
    setHoverExpandEnabled(false);
    resetLeadsSubmenu();
    resetInventorySubmenu();
  };

  const handleLeadsMouseEnter = () => {
    const wasCollapsed = collapsed;
    if (!isMobile && hoverExpandEnabled) {
      setCollapsed(false);
    }
    scheduleLeadsSubmenuOpen(wasCollapsed);
  };

  const handleLeadsMouseLeave = () => {
    resetLeadsSubmenu();
  };

  const handleLeadsClick = (e: MouseEvent) => {
    if (isLeadsPage && !activeStep) {
      e.preventDefault();
      setLeadsExpanded((value) => !value);
      return;
    }
    handleNavSelect();
  };

  const handleInventoryMouseEnter = () => {
    const wasCollapsed = collapsed;
    if (!isMobile && hoverExpandEnabled) {
      setCollapsed(false);
    }
    scheduleInventorySubmenuOpen(wasCollapsed);
  };

  const handleInventoryMouseLeave = () => {
    resetInventorySubmenu();
  };

  const handleInventoryClick = (e: MouseEvent) => {
    if (isInventoryPage) {
      e.preventDefault();
      setInventoryExpanded((value) => !value);
      return;
    }
    handleNavSelect();
  };

  const renderNavItem = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;

    if ("hasInventoryMenu" in item && item.hasInventoryMenu) {
      return (
        <div
          key={item.to}
          onMouseEnter={handleInventoryMouseEnter}
          onMouseLeave={handleInventoryMouseLeave}
        >
          <NavLink
            to={ROUTES.inventoryTab("master")}
            onClick={handleInventoryClick}
            className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline ${
              isOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
            } ${isInventorySection ? "" : "hover:bg-white/8"}`}
            style={{
              backgroundColor: isInventorySection ? "rgba(255,255,255,0.15)" : "transparent",
              color: isInventorySection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {isOpen && (
              <>
                <span style={{ fontSize: "15px", fontWeight: isInventorySection ? 600 : 400 }}>
                  {item.label}
                </span>
                <span className="ml-auto flex items-center">
                  {showInventorySubmenu ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </span>
              </>
            )}
          </NavLink>

          <InventorySubMenu
            activeTab={activeInventoryTab}
            isVisible={showInventorySubmenu}
            onItemSelect={handleNavSelect}
          />
        </div>
      );
    }

    if (item.hasWorkflowMenu) {
      return (
        <div
          key={item.to}
          onMouseEnter={handleLeadsMouseEnter}
          onMouseLeave={handleLeadsMouseLeave}
        >
          <NavLink
            to={ROUTES.leads}
            onClick={handleLeadsClick}
            className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline ${
              isOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
            } ${isLeadsSection ? "" : "hover:bg-white/8"}`}
            style={{
              backgroundColor: isLeadsSection ? "rgba(255,255,255,0.15)" : "transparent",
              color: isLeadsSection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {isOpen && (
              <>
                <span style={{ fontSize: "15px", fontWeight: isLeadsSection ? 600 : 400 }}>
                  {item.label}
                </span>
                <span className="ml-auto flex items-center">
                  {/* {showLeadsSubmenu ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )} */}
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </span>
              </>
            )}
          </NavLink>

          {/* <LeadWorkflowSubMenu
            activeStep={activeStep}
            isVisible={showLeadsSubmenu}
            onItemSelect={handleNavSelect}
          /> */}
        </div>
      );
    }

    if (item.openMobileInNewTab) {
      const isActive = location.pathname === item.to;
      const mobileRoute =
        "mobileRoute" in item && item.mobileRoute
          ? item.mobileRoute
          : ROUTES.siteMaterialRequestMobile;

      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={(e) => {
            e.preventDefault();
            window.open(mobileRoute as string, "_blank");
            navigate(item.to);
            handleNavSelect();
          }}
          className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline ${
            isOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
          } ${isActive ? "" : "hover:bg-white/8"}`}
          style={{
            backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
          }}
          title={!isOpen ? item.label : undefined}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {isOpen && (
            <>
              <span style={{ fontSize: "15px", fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </>
          )}
        </NavLink>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={handleNavSelect}
        className={({ isActive }) =>
          `w-full flex items-center gap-3 rounded-lg transition-all group no-underline ${
            isOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
          } ${isActive ? "" : "hover:bg-white/8"}`
        }
        style={({ isActive }) => ({
          backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
          color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
        })}
        title={!isOpen ? item.label : undefined}
      >
        {({ isActive }) => (
          <>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <>
                <span style={{ fontSize: "15px", fontWeight: isActive ? 600 : 400 }}>
                  {item.label}
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className="flex flex-col min-h-screen flex-shrink-0 transition-all duration-300 ease-in-out"
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      style={{
        width: sidebarWidth,
        backgroundColor: "var(--brand-dark-green)",
      }}
    >
      <div
        className={`flex items-center border-b ${
          isOpen ? "justify-between gap-3 px-4 py-3" : "justify-center px-2 py-4"
        }`}
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div className={`flex items-center gap-3 min-w-0 ${isOpen ? "" : "justify-center"}`}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <div
                className="text-white font-semibold leading-tight truncate"
                style={{ fontSize: "13px" }}
              >
                Southwest Greens
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>CRM Platform</div>
            </div>
          )}
        </div>

      </div>

      <nav
        className={`flex-1 py-4 space-y-0.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isOpen ? "px-3" : "px-2"}`}
      >
        {navItems.map(renderNavItem)}
      </nav>

      <div
        className={`border-t pt-3 pb-4 ${isOpen ? "px-3" : "px-2"}`}
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div
          className={`flex items-center rounded-lg ${
            isOpen ? "gap-3 px-3 py-2" : "justify-center px-0 py-2"
          }`}
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          title={!isOpen ? "Alex Johnson" : undefined}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: "var(--brand-green)", fontSize: "12px", fontWeight: 600 }}
          >
            AJ
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-white truncate" style={{ fontSize: "12px", fontWeight: 500 }}>
                Alex Johnson
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Sales Manager</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
