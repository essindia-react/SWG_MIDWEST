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
  ShoppingCart,
  Warehouse,
  Leaf,
  ChevronRight,
  ChevronDown,
  Smartphone,
  UsersRound,
  Truck,
} from "lucide-react";
import { INVENTORY_TABS } from "../../features/inventory/constants/inventoryConstants";
import { LEAD_WORKFLOW_SECTIONS } from "../../features/leads/constants/leadWorkflowSections";
import { ROUTES } from "../../routes/paths";

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.leads, label: "Leads", icon: Users, hasWorkflowMenu: true },
  { to: ROUTES.pipeline, label: "Pipeline", icon: GitBranch },
  { to: ROUTES.projects, label: "Project Management", icon: FolderKanban },
  { to: ROUTES.employees, label: "HR & People", icon: UsersRound, hasHRMenu: true },
  { to: ROUTES.vehicleMaster, label: "Transportation", icon: Truck, hasTransportationMenu: true },
  { to: ROUTES.fieldOperations, label: "Field Operations", icon: HardHat },
  { to: ROUTES.tasks, label: "Task Management", icon: CheckSquare },
  { to: ROUTES.calendar, label: "Calendar", icon: Calendar },
  { to: ROUTES.invoicing, label: "Invoicing", icon: Receipt },
  { to: ROUTES.inventory, label: "Inventory", icon: Warehouse, hasInventoryMenu: true },
  { to: ROUTES.siteMaterialRequest, label: "Site Material Request", icon: Package },
  { to: ROUTES.purchaseRequisition, label: "Purchase Requisition", icon: ShoppingCart },
];

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPAND_MS = 300;
const SUBMENU_OPEN_DELAY_MS = 120;

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

/**
 * NavLabel — animates font-size from ~8px → target size and fades in when
 * the sidebar opens, so the text "grows in" rather than snapping.
 */
function NavLabel({
  isOpen,
  isActive,
  fontSize = 15,
  children,
}: {
  isOpen: boolean;
  isActive: boolean;
  fontSize?: number;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        // Clip so growing text never overflows during animation
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "block",
        // Animate both font-size and opacity together
        fontSize: isOpen ? `${fontSize}px` : "8px",
        fontWeight: isActive ? 600 : 400,
        opacity: isOpen ? 1 : 0,
        maxWidth: isOpen ? "160px" : "0px",
        transition:
          "font-size 280ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease, max-width 280ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {children}
    </span>
  );
}

function SubLabel({
  isOpen,
  isActive,
  children,
}: {
  isOpen: boolean;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLabel isOpen={isOpen} isActive={isActive} fontSize={13}>
      {children}
    </NavLabel>
  );
}

function InventorySubMenu({
  activeTab,
  isVisible,
  isOpen,
  onItemSelect,
}: {
  activeTab: string;
  isVisible: boolean;
  isOpen: boolean;
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
                  <SubLabel isOpen={isOpen} isActive={isActive}>
                    {tab.label}
                  </SubLabel>
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
  isOpen,
  onItemSelect,
}: {
  activeStep: string | null;
  isVisible: boolean;
  isOpen: boolean;
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
                  <SubLabel isOpen={isOpen} isActive={isActive}>
                    {section.label}
                  </SubLabel>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HRSubMenu({
  isVisible,
  isOpen,
  onItemSelect,
  pathname,
}: {
  isVisible: boolean;
  isOpen: boolean;
  onItemSelect: () => void;
  pathname: string;
}) {
  const items = [
    { to: ROUTES.employees, label: "Employee Records" },
    { to: ROUTES.clockInOut, label: "Clock In / Out" },
    { to: ROUTES.timesheetSummary, label: "Timesheet Summary" },
  ];

  return (
    <div
      className="grid transition-[grid-template-rows] duration-200 ease-out"
      style={{ gridTemplateRows: isVisible ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="ml-1 pr-1">
          <div className="flex flex-col gap-1 ml-5">
            {items.map((item) => {
              const isActive = pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onItemSelect}
                  className="flex items-center no-underline rounded-lg px-3 py-1.5 transition-colors hover:bg-white/8"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                    opacity: isActive ? 1 : 0.88,
                  }}
                >
                  <SubLabel isOpen={isOpen} isActive={isActive}>
                    {item.label}
                  </SubLabel>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransportationSubMenu({
  isVisible,
  isOpen,
  onItemSelect,
  pathname,
}: {
  isVisible: boolean;
  isOpen: boolean;
  onItemSelect: () => void;
  pathname: string;
}) {
  const items = [
    { to: ROUTES.vehicleMaster, label: "Vehicle Master" },
    { to: ROUTES.gpsDashboard, label: "GPS Dashboard" },
    { to: ROUTES.tripHistory, label: "Trip History" },
  ];

  return (
    <div
      className="grid transition-[grid-template-rows] duration-200 ease-out"
      style={{ gridTemplateRows: isVisible ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="ml-1 pr-1">
          <div className="flex flex-col gap-1 ml-5">
            {items.map((item) => {
              const isActive = pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onItemSelect}
                  className="flex items-center no-underline rounded-lg px-3 py-1.5 transition-colors hover:bg-white/8"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                    opacity: isActive ? 1 : 0.88,
                  }}
                >
                  <SubLabel isOpen={isOpen} isActive={isActive}>
                    {item.label}
                  </SubLabel>
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
  const [hrExpanded, setHrExpanded] = useState(true);
  const [hrSubmenuVisible, setHrSubmenuVisible] = useState(false);
  const [transportationExpanded, setTransportationExpanded] = useState(true);
  const [transportationSubmenuVisible, setTransportationSubmenuVisible] = useState(false);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inventorySubmenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hrSubmenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transportationSubmenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLeadsPage = location.pathname === ROUTES.leads;
  const isLeadsSection =
    isLeadsPage || /^\/leads\/[^/]+$/.test(location.pathname);
  const activeStep = new URLSearchParams(location.search).get("step");

  const isInventoryPage = location.pathname === ROUTES.inventory;
  const isInventorySection = isInventoryPage;
  const activeInventoryTab = new URLSearchParams(location.search).get("tab") ?? "master";

  const isHRSection =
    location.pathname.startsWith("/hr") ||
    location.pathname === ROUTES.employees ||
    location.pathname === ROUTES.clockInOut ||
    location.pathname === ROUTES.timesheetSummary;

  const isTransportationSection =
    location.pathname.startsWith("/transportation") ||
    location.pathname === ROUTES.vehicleMaster ||
    location.pathname === ROUTES.gpsDashboard ||
    location.pathname === ROUTES.tripHistory;

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
    if (isHRSection) setHrExpanded(true);
  }, [isHRSection]);

  useEffect(() => {
    if (isTransportationSection) setTransportationExpanded(true);
  }, [isTransportationSection]);

  useEffect(() => {
    return () => {
      if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
      if (inventorySubmenuTimerRef.current) clearTimeout(inventorySubmenuTimerRef.current);
      if (hrSubmenuTimerRef.current) clearTimeout(hrSubmenuTimerRef.current);
      if (transportationSubmenuTimerRef.current) clearTimeout(transportationSubmenuTimerRef.current);
    };
  }, []);

  const isOpen = !collapsed;
  const sidebarWidth = isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const showLeadsSubmenu =
    isOpen && ((isLeadsSection && leadsExpanded) || leadsSubmenuVisible);
  const showInventorySubmenu =
    isOpen && ((isInventorySection && inventoryExpanded) || inventorySubmenuVisible);
  const showHRSubmenu =
    isOpen && ((isHRSection && hrExpanded) || hrSubmenuVisible);
  const showTransportationSubmenu =
    isOpen && ((isTransportationSection && transportationExpanded) || transportationSubmenuVisible);

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

  const clearHRSubmenuTimer = () => {
    if (hrSubmenuTimerRef.current) {
      clearTimeout(hrSubmenuTimerRef.current);
      hrSubmenuTimerRef.current = null;
    }
  };

  const scheduleHRSubmenuOpen = (wasCollapsed: boolean) => {
    clearHRSubmenuTimer();
    const delay = wasCollapsed ? SIDEBAR_EXPAND_MS : SUBMENU_OPEN_DELAY_MS;
    hrSubmenuTimerRef.current = setTimeout(() => {
      setHrSubmenuVisible(true);
    }, delay);
  };

  const resetHRSubmenu = () => {
    clearHRSubmenuTimer();
    if (!isHRSection) {
      setHrSubmenuVisible(false);
    }
  };

  const clearTransportationSubmenuTimer = () => {
    if (transportationSubmenuTimerRef.current) {
      clearTimeout(transportationSubmenuTimerRef.current);
      transportationSubmenuTimerRef.current = null;
    }
  };

  const scheduleTransportationSubmenuOpen = (wasCollapsed: boolean) => {
    clearTransportationSubmenuTimer();
    const delay = wasCollapsed ? SIDEBAR_EXPAND_MS : SUBMENU_OPEN_DELAY_MS;
    transportationSubmenuTimerRef.current = setTimeout(() => {
      setTransportationSubmenuVisible(true);
    }, delay);
  };

  const resetTransportationSubmenu = () => {
    clearTransportationSubmenuTimer();
    if (!isTransportationSection) {
      setTransportationSubmenuVisible(false);
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
    resetHRSubmenu();
    resetTransportationSubmenu();
  };

  const handleNavSelect = () => {
    setCollapsed(true);
    setHoverExpandEnabled(false);
    resetLeadsSubmenu();
    resetInventorySubmenu();
    resetHRSubmenu();
    resetTransportationSubmenu();
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

  const handleHRMouseEnter = () => {
    const wasCollapsed = collapsed;
    if (!isMobile && hoverExpandEnabled) {
      setCollapsed(false);
    }
    scheduleHRSubmenuOpen(wasCollapsed);
  };

  const handleHRMouseLeave = () => {
    resetHRSubmenu();
  };

  const handleHRClick = (e: MouseEvent) => {
    if (isHRSection) {
      e.preventDefault();
      setHrExpanded((value) => !value);
      return;
    }
    handleNavSelect();
  };

  const handleTransportationMouseEnter = () => {
    const wasCollapsed = collapsed;
    if (!isMobile && hoverExpandEnabled) {
      setCollapsed(false);
    }
    scheduleTransportationSubmenuOpen(wasCollapsed);
  };

  const handleTransportationMouseLeave = () => {
    resetTransportationSubmenu();
  };

  const handleTransportationClick = (e: MouseEvent) => {
    if (isTransportationSection) {
      e.preventDefault();
      setTransportationExpanded((value) => !value);
      return;
    }
    handleNavSelect();
  };

  // Chevron element — fades + scales in with the text
  const ChevronLabel = ({
    showDown,
    isActive,
  }: {
    showDown?: boolean;
    isActive: boolean;
  }) => (
    <span
      className="ml-auto flex items-center flex-shrink-0"
      style={{
        opacity: isOpen ? 0.6 : 0,
        transform: isOpen ? "scale(1)" : "scale(0.6)",
        transition: "opacity 240ms ease, transform 260ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {showDown ? (
        <ChevronDown className="w-3.5 h-3.5" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5" />
      )}
    </span>
  );

  const renderNavItem = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;

    if ("hasTransportationMenu" in item && item.hasTransportationMenu) {
      return (
        <div
          key={item.to}
          onMouseEnter={handleTransportationMouseEnter}
          onMouseLeave={handleTransportationMouseLeave}
        >
          <NavLink
            to={ROUTES.vehicleMaster}
            onClick={handleTransportationClick}
            className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isTransportationSection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor: isTransportationSection ? "rgba(255,255,255,0.15)" : "transparent",
              color: isTransportationSection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <NavLabel isOpen={isOpen} isActive={isTransportationSection}>
              {item.label}
            </NavLabel>
            <ChevronLabel showDown={showTransportationSubmenu} isActive={isTransportationSection} />
          </NavLink>

          <TransportationSubMenu
            isVisible={showTransportationSubmenu}
            isOpen={isOpen}
            onItemSelect={handleNavSelect}
            pathname={location.pathname}
          />
        </div>
      );
    }

    if ("hasHRMenu" in item && item.hasHRMenu) {
      return (
        <div
          key={item.to}
          onMouseEnter={handleHRMouseEnter}
          onMouseLeave={handleHRMouseLeave}
        >
          <NavLink
            to={ROUTES.employees}
            onClick={handleHRClick}
            className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isHRSection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor: isHRSection ? "rgba(255,255,255,0.15)" : "transparent",
              color: isHRSection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <NavLabel isOpen={isOpen} isActive={isHRSection}>
              {item.label}
            </NavLabel>
            <ChevronLabel showDown={showHRSubmenu} isActive={isHRSection} />
          </NavLink>

          <HRSubMenu
            isVisible={showHRSubmenu}
            isOpen={isOpen}
            onItemSelect={handleNavSelect}
            pathname={location.pathname}
          />
        </div>
      );
    }

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
            className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isInventorySection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor: isInventorySection ? "rgba(255,255,255,0.15)" : "transparent",
              color: isInventorySection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <NavLabel isOpen={isOpen} isActive={isInventorySection}>
              {item.label}
            </NavLabel>
            <ChevronLabel showDown={showInventorySubmenu} isActive={isInventorySection} />
          </NavLink>

          <InventorySubMenu
            activeTab={activeInventoryTab}
            isVisible={showInventorySubmenu}
            isOpen={isOpen}
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
            className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isLeadsSection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor: isLeadsSection ? "rgba(255,255,255,0.15)" : "transparent",
              color: isLeadsSection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <NavLabel isOpen={isOpen} isActive={isLeadsSection}>
              {item.label}
            </NavLabel>
            <ChevronLabel isActive={isLeadsSection} />
          </NavLink>
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
          className={`w-full flex items-center gap-3 rounded-lg transition-all group no-underline px-3 py-2.5 ${
            isActive ? "" : "hover:bg-white/8"
          }`}
          style={{
            backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
          }}
          title={!isOpen ? item.label : undefined}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <NavLabel isOpen={isOpen} isActive={isActive}>
            {item.label}
          </NavLabel>
          {isActive && <ChevronLabel isActive={isActive} />}
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
          `w-full flex items-center gap-3 rounded-lg transition-all group no-underline px-3 py-2.5 ${
            isActive ? "" : "hover:bg-white/8"
          }`
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
            <NavLabel isOpen={isOpen} isActive={isActive}>
              {item.label}
            </NavLabel>
            {isActive && <ChevronLabel isActive={isActive} />}
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
      {/* Header */}
      <div
        className="flex items-center border-b px-3 py-3"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>

          {/* Brand text — same grow-in animation */}
          <div
            className="min-w-0 overflow-hidden"
            style={{
              maxWidth: isOpen ? "160px" : "0px",
              opacity: isOpen ? 1 : 0,
              transition: "max-width 280ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease",
            }}
          >
            <div
              className="text-white font-semibold leading-tight truncate"
              style={{
                fontSize: isOpen ? "13px" : "8px",
                transition: "font-size 280ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              Southwest Greens
            </div>
            <div
              style={{
                fontSize: isOpen ? "11px" : "7px",
                color: "rgba(255,255,255,0.55)",
                transition: "font-size 280ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              CRM Platform
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Footer / User */}
      <div
        className="border-t pt-3 pb-4 px-2"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="flex items-center rounded-lg gap-3 px-2 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          title={!isOpen ? "Alex Johnson" : undefined}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: "var(--brand-green)", fontSize: "12px", fontWeight: 600 }}
          >
            AJ
          </div>

          <div
            className="min-w-0 overflow-hidden"
            style={{
              maxWidth: isOpen ? "160px" : "0px",
              opacity: isOpen ? 1 : 0,
              transition: "max-width 280ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease",
            }}
          >
            <div
              className="text-white truncate"
              style={{
                fontSize: isOpen ? "12px" : "8px",
                fontWeight: 500,
                transition: "font-size 280ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              Alex Johnson
            </div>
            <div
              style={{
                fontSize: isOpen ? "11px" : "7px",
                color: "rgba(255,255,255,0.5)",
                transition: "font-size 280ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              Sales Manager
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}