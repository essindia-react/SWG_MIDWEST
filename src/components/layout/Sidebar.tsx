// sideNave 1
import React from "react";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  FolderKanban,
  HardHat,
  CheckSquare,
  Calendar,
  Receipt,
  Package,
  Warehouse,
  Leaf,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  UsersRound,
  Truck,
} from "lucide-react";
import { INVENTORY_TABS } from "../../features/inventory/constants/inventoryConstants";
import { ROUTES } from "../../routes/paths";

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.calendar, label: "Calendar", icon: Calendar },
  { to: ROUTES.leads, label: "Leads", icon: Users },
  { to: ROUTES.pipeline, label: "Pipeline", icon: GitBranch },
  { to: ROUTES.fieldOperations, label: "Field Operations", icon: HardHat },
  { to: ROUTES.tasks, label: "Task Management", icon: CheckSquare },
  { to: ROUTES.projects, label: "Project Management", icon: FolderKanban },
  { to: ROUTES.employees, label: "HR & People", icon: UsersRound, hasHRMenu: true },
  { to: ROUTES.siteMaterialRequest, label: "Site Material Request", icon: Package },
  // { to: ROUTES.vehicleMaster, label: "Transportation", icon: Truck, hasTransportationMenu: true },
  { to: ROUTES.invoicing, label: "Invoicing", icon: Receipt },
  { to: ROUTES.inventory, label: "Inventory", icon: Warehouse, hasInventoryMenu: true },
];

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;
const SUBMENU_OPEN_DELAY_MS = 120;
const SUBMENU_CLOSE_DELAY_MS = 150;

type FlyoutId = "inventory" | "hr" | "transportation";

type FlyoutItem = {
  to: string;
  label: string;
  isActive: boolean;
};

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
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "block",
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

const FLYOUT_VIEWPORT_MARGIN = 8;

function FlyoutSubMenu({
  visible,
  title,
  items,
  anchorRef,
  onMouseEnter,
  onMouseLeave,
  onItemSelect,
}: {
  visible: boolean;
  title: string;
  items: FlyoutItem[];
  anchorRef: RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemSelect: () => void;
}) {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [listMaxHeight, setListMaxHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      const flyout = flyoutRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const maxPanelHeight = viewportHeight - FLYOUT_VIEWPORT_MARGIN * 2;
      const headerHeight = headerRef.current?.offsetHeight ?? 42;

      let top = rect.top;
      let listMax: number | undefined;

      if (flyout) {
        const panelHeight = flyout.offsetHeight;

        if (panelHeight > maxPanelHeight) {
          top = FLYOUT_VIEWPORT_MARGIN;
          listMax = Math.max(120, maxPanelHeight - headerHeight);
        } else if (panelHeight > 0 && top + panelHeight > viewportHeight - FLYOUT_VIEWPORT_MARGIN) {
          top = Math.max(FLYOUT_VIEWPORT_MARGIN, viewportHeight - panelHeight - FLYOUT_VIEWPORT_MARGIN);
        }
      }

      setPosition({ top, left: rect.right });
      setListMaxHeight(listMax);
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);

    const flyout = flyoutRef.current;
    const resizeObserver =
      flyout && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePosition)
        : null;
    if (flyout) resizeObserver?.observe(flyout);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, anchorRef, items]);

  if (!visible) return null;

  return (
    <div
      ref={flyoutRef}
      className="fixed z-50 min-w-[210px] rounded-lg overflow-hidden flex flex-col"
      style={{
        top: position.top,
        left: position.left + 4,
        maxHeight: `calc(100vh - ${FLYOUT_VIEWPORT_MARGIN * 2}px)`,
        backgroundColor: "#256829",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.38), 0 4px 12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={headerRef}
        className="px-4 py-2.5 text-white font-semibold text-sm flex-shrink-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {title}
      </div>
      <div
        className="flex flex-col py-1.5 overflow-y-auto [scrollbar-width:thin] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
        style={listMaxHeight ? { maxHeight: listMaxHeight } : undefined}
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onItemSelect}
            className="flex items-center no-underline px-4 py-2 mx-1.5 rounded-md transition-colors hover:bg-white/12"
            style={{
              color: item.isActive ? "#ffffff" : "rgba(255,255,255,0.62)",
              fontWeight: item.isActive ? 600 : 400,
              fontSize: "13px",
              backgroundColor: item.isActive ? "rgba(255,255,255,0.1)" : "transparent",
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function SubmenuChevron({ sidebarOpen, isHovered }: { sidebarOpen: boolean; isHovered?: boolean }) {
  if (sidebarOpen) {
    return (
      <ChevronRight
        className="w-3.5 h-3.5 flex-shrink-0 transition-opacity"
        style={{ opacity: isHovered ? 0.85 : 0.45 }}
      />
    );
  }

  return (
    <ChevronRight
      className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex-shrink-0 pointer-events-none"
      style={{ opacity: isHovered ? 0.9 : 0.55 }}
    />
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(true);
  const [openFlyout, setOpenFlyout] = useState<FlyoutId | null>(null);
  const openFlyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeFlyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inventoryAnchorRef = useRef<HTMLDivElement>(null);
  const hrAnchorRef = useRef<HTMLDivElement>(null);
  const transportationAnchorRef = useRef<HTMLDivElement>(null);

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
    return () => {
      if (openFlyoutTimerRef.current) clearTimeout(openFlyoutTimerRef.current);
      if (closeFlyoutTimerRef.current) clearTimeout(closeFlyoutTimerRef.current);
    };
  }, []);

  const isOpen = !collapsed;
  const sidebarWidth = isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const clearFlyoutTimers = () => {
    if (openFlyoutTimerRef.current) {
      clearTimeout(openFlyoutTimerRef.current);
      openFlyoutTimerRef.current = null;
    }
    if (closeFlyoutTimerRef.current) {
      clearTimeout(closeFlyoutTimerRef.current);
      closeFlyoutTimerRef.current = null;
    }
  };

  const handleFlyoutEnter = (id: FlyoutId) => {
    if (closeFlyoutTimerRef.current) {
      clearTimeout(closeFlyoutTimerRef.current);
      closeFlyoutTimerRef.current = null;
    }
    openFlyoutTimerRef.current = setTimeout(() => {
      setOpenFlyout(id);
    }, SUBMENU_OPEN_DELAY_MS);
  };

  const handleFlyoutLeave = () => {
    if (openFlyoutTimerRef.current) {
      clearTimeout(openFlyoutTimerRef.current);
      openFlyoutTimerRef.current = null;
    }
    closeFlyoutTimerRef.current = setTimeout(() => {
      setOpenFlyout(null);
    }, SUBMENU_CLOSE_DELAY_MS);
  };

  const handleNavSelect = () => {
    clearFlyoutTimers();
    setOpenFlyout(null);
    if (isMobile) setCollapsed(true);
  };

  const toggleSidebar = () => {
    setCollapsed((value) => !value);
    clearFlyoutTimers();
    setOpenFlyout(null);
  };

  const ChevronLabel = ({ isActive }: { isActive: boolean }) => (
    <span
      className="ml-auto flex items-center flex-shrink-0"
      style={{
        opacity: isOpen ? 0.6 : 0,
        transform: isOpen ? "scale(1)" : "scale(0.6)",
        transition: "opacity 240ms ease, transform 260ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <ChevronRight className="w-3.5 h-3.5" />
    </span>
  );

  const inventoryFlyoutItems: FlyoutItem[] = INVENTORY_TABS.map((tab) => ({
    to: ROUTES.inventoryTab(tab.id),
    label: tab.label,
    isActive: activeInventoryTab === tab.id,
  }));

  const hrFlyoutItems: FlyoutItem[] = [
    { to: ROUTES.employees, label: "Employee Records", isActive: location.pathname === ROUTES.employees },
    { to: ROUTES.clockInOut, label: "Clock In / Out", isActive: location.pathname === ROUTES.clockInOut },
    {
      to: ROUTES.timesheetSummary,
      label: "Timesheet Summary",
      isActive: location.pathname === ROUTES.timesheetSummary,
    },
  ];

  const transportationFlyoutItems: FlyoutItem[] = [
    {
      to: ROUTES.vehicleMaster,
      label: "Vehicle Master",
      isActive: location.pathname === ROUTES.vehicleMaster,
    },
    {
      to: ROUTES.gpsDashboard,
      label: "GPS Dashboard",
      isActive: location.pathname === ROUTES.gpsDashboard,
    },
    {
      to: ROUTES.tripHistory,
      label: "Trip History",
      isActive: location.pathname === ROUTES.tripHistory,
    },
  ];

  const renderNavItem = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;

    if ("hasTransportationMenu" in item && item.hasTransportationMenu) {
      return (
        <div
          key={item.to}
          ref={transportationAnchorRef}
          onMouseEnter={() => handleFlyoutEnter("transportation")}
          onMouseLeave={handleFlyoutLeave}
        >
          <NavLink
            to={ROUTES.vehicleMaster}
            onClick={handleNavSelect}
            className={`relative w-full flex items-center ga rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isTransportationSection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor:
                isTransportationSection || openFlyout === "transportation"
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
              color: isTransportationSection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <SubmenuChevron
              sidebarOpen={isOpen}
              isHovered={openFlyout === "transportation"}
            />
            <NavLabel isOpen={isOpen} isActive={isTransportationSection}>
              {item.label}
            </NavLabel>
          </NavLink>

          <FlyoutSubMenu
            visible={openFlyout === "transportation"}
            title="Transportation"
            items={transportationFlyoutItems}
            anchorRef={transportationAnchorRef}
            onMouseEnter={() => handleFlyoutEnter("transportation")}
            onMouseLeave={handleFlyoutLeave}
            onItemSelect={handleNavSelect}
          />
        </div>
      );
    }

    if ("hasHRMenu" in item && item.hasHRMenu) {
      return (
        <div
          key={item.to}
          ref={hrAnchorRef}
          onMouseEnter={() => handleFlyoutEnter("hr")}
          onMouseLeave={handleFlyoutLeave}
        >
          <NavLink
            to={ROUTES.employees}
            onClick={handleNavSelect}
            className={`relative w-full flex items-center gp-2 rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isHRSection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor:
                isHRSection || openFlyout === "hr" ? "rgba(255,255,255,0.15)" : "transparent",
              color: isHRSection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <SubmenuChevron sidebarOpen={isOpen} isHovered={openFlyout === "hr"} />
            <NavLabel isOpen={isOpen} isActive={isHRSection}>
              {item.label}
            </NavLabel>
          </NavLink>

          <FlyoutSubMenu
            visible={openFlyout === "hr"}
            title="HR & People"
            items={hrFlyoutItems}
            anchorRef={hrAnchorRef}
            onMouseEnter={() => handleFlyoutEnter("hr")}
            onMouseLeave={handleFlyoutLeave}
            onItemSelect={handleNavSelect}
          />
        </div>
      );
    }

    if ("hasInventoryMenu" in item && item.hasInventoryMenu) {
      return (
        <div
          key={item.to}
          ref={inventoryAnchorRef}
          onMouseEnter={() => handleFlyoutEnter("inventory")}
          onMouseLeave={handleFlyoutLeave}
        >
          <NavLink
            to={ROUTES.inventoryTab("master")}
            onClick={handleNavSelect}
            className={`relative w-full flex items-center gp-2 rounded-lg transition-all group no-underline px-3 py-2.5 ${
              isInventorySection ? "" : "hover:bg-white/8"
            }`}
            style={{
              backgroundColor:
                isInventorySection || openFlyout === "inventory"
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
              color: isInventorySection ? "#ffffff" : "rgba(255,255,255,0.65)",
            }}
            title={!isOpen ? item.label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <SubmenuChevron sidebarOpen={isOpen} isHovered={openFlyout === "inventory"} />
            <NavLabel isOpen={isOpen} isActive={isInventorySection}>
              {item.label}
            </NavLabel>
          </NavLink>

          <FlyoutSubMenu
            visible={openFlyout === "inventory"}
            title="Inventory"
            items={inventoryFlyoutItems}
            anchorRef={inventoryAnchorRef}
            onMouseEnter={() => handleFlyoutEnter("inventory")}
            onMouseLeave={handleFlyoutLeave}
            onItemSelect={handleNavSelect}
          />
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
      style={{
        width: sidebarWidth,
        backgroundColor: "var(--brand-dark-green)",
      }}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b px-3 py-3 ${isOpen ? "justify-between gap-2" : "flex-col gap-2"}`}
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div className={`flex items-center gap-3 min-w-0 ${isOpen ? "flex-1" : "justify-center"}`}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>

          {isOpen && (
            <div className="min-w-0 overflow-hidden flex-1">
              <div className="text-white font-semibold leading-tight truncate text-[13px]">
                Southwest Greens
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
                CRM Platform
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="flex-shrink-0 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
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
