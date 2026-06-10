import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { CalendarEventsProvider } from "../../hooks/useCalendarEvents";
import { LeadsProvider } from "../../hooks/useLeads";
import { InvoicesProvider } from "../../hooks/useInvoices";
import { ProjectsProvider } from "../../hooks/useProjects";
import { NotificationsProvider } from "../../hooks/useNotifications";
import { HRProvider } from "../../hooks/useHR";
import { TransportationProvider } from "../../hooks/useTransportation";
import { theme } from "../../theme/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <LeadsProvider>
        <ProjectsProvider>
          <InvoicesProvider>
            <CalendarEventsProvider>
              <HRProvider>
                <TransportationProvider>
                  <NotificationsProvider>{children}</NotificationsProvider>
                </TransportationProvider>
              </HRProvider>
            </CalendarEventsProvider>
          </InvoicesProvider>
        </ProjectsProvider>
      </LeadsProvider>
    </ThemeProvider>
  );
}
