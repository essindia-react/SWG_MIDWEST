import React, { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router";
import { Toaster } from "sonner";
import { getPageTitle } from "../../routes/paths";
import { ROUTES } from "../../routes/paths";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isCreatingLead =
    location.pathname === ROUTES.leads &&
    new URLSearchParams(location.search).get("create") === "true";
  const isCreatingProject =
    location.pathname === ROUTES.projects &&
    new URLSearchParams(location.search).get("create") === "true";

  const handleCreateLead = () => {
    navigate(`${ROUTES.leads}?create=true`);
  };

  const pageTitle = isCreatingLead
    ? "Create New Lead"
    : isCreatingProject
      ? "Create New Project"
      : getPageTitle(location.pathname, location.search);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        <TopNav
          title={pageTitle}
          onCreateLead={handleCreateLead}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
