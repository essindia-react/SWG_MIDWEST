import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { AnalyticsPage } from "../pages/analytics/AnalyticsPage";
import { AutomationsPage } from "../pages/automations/AutomationsPage";
import { CalendarPage } from "../pages/calendar/CalendarPage";
import { CommunicationsPage } from "../pages/communications/CommunicationsPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { LeadDetailPage } from "../pages/leads/LeadDetailPage";
import { LeadsPage } from "../pages/leads/LeadsPage";
import { MobilePage } from "../pages/mobile/MobilePage";
import { PipelinePage } from "../pages/pipeline/PipelinePage";
import { FieldOperationsPage } from "../pages/field-operations/FieldOperationsPage";
import { ProjectsPage } from "../pages/projects/ProjectsPage";
import { QuotesPage } from "../pages/quotes/QuotesPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { TasksPage } from "../pages/tasks/TasksPage";
import { ROUTES } from "./paths";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.leads} element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path={ROUTES.pipeline} element={<PipelinePage />} />
        <Route path={ROUTES.projects} element={<ProjectsPage />} />
        <Route path={ROUTES.fieldOperations} element={<FieldOperationsPage />} />
        <Route path={ROUTES.tasks} element={<TasksPage />} />
        <Route path={ROUTES.calendar} element={<CalendarPage />} />
        <Route path={ROUTES.communications} element={<CommunicationsPage />} />
        <Route path={ROUTES.quotes} element={<QuotesPage />} />
        <Route path={ROUTES.automations} element={<AutomationsPage />} />
        <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
        <Route path={ROUTES.mobile} element={<MobilePage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Route>
    </Routes>
  );
}
