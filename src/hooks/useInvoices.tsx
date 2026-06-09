import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildInvoiceFromInput } from "../lib/invoiceHelpers";
import { loadInvoices, saveInvoices } from "../lib/invoiceStorage";
import type { Invoice, InvoiceFormInput, InvoiceStatus } from "../types/invoice";
import type { Project } from "../types/project";
import { useProjects } from "./useProjects";

interface InvoicesContextValue {
  invoices: Invoice[];
  getInvoicesForMilestone: (projectId: string, milestoneId: string) => Invoice[];
  getLatestInvoiceForMilestone: (projectId: string, milestoneId: string) => Invoice | undefined;
  createInvoice: (input: InvoiceFormInput) => Invoice | null;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
}

const InvoicesContext = createContext<InvoicesContextValue | null>(null);

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const { projects, getProjectById } = useProjects();
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  const getInvoicesForMilestone = useCallback(
    (projectId: string, milestoneId: string) =>
      invoices
        .filter((inv) => inv.projectId === projectId && inv.milestoneId === milestoneId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [invoices]
  );

  const getLatestInvoiceForMilestone = useCallback(
    (projectId: string, milestoneId: string) => getInvoicesForMilestone(projectId, milestoneId)[0],
    [getInvoicesForMilestone]
  );

  const createInvoice = useCallback(
    (input: InvoiceFormInput): Invoice | null => {
      const project = getProjectById(input.projectId);
      if (!project) return null;
      const milestone = project.milestones.find((m) => m.id === input.milestoneId);
      if (!milestone) return null;

      const invoice = buildInvoiceFromInput(input, project, milestone, invoices);
      setInvoices((prev) => [invoice, ...prev]);
      return invoice;
    },
    [getProjectById, invoices]
  );

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    const now = new Date().toISOString();
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates, updatedAt: now } : inv))
    );
  }, []);

  const updateInvoiceStatus = useCallback(
    (id: string, status: InvoiceStatus) => {
      updateInvoice(id, { status });
    },
    [updateInvoice]
  );

  const value = useMemo(
    () => ({
      invoices,
      getInvoicesForMilestone,
      getLatestInvoiceForMilestone,
      createInvoice,
      updateInvoice,
      updateInvoiceStatus,
    }),
    [
      invoices,
      getInvoicesForMilestone,
      getLatestInvoiceForMilestone,
      createInvoice,
      updateInvoice,
      updateInvoiceStatus,
    ]
  );

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
}

export function useInvoices(): InvoicesContextValue {
  const ctx = useContext(InvoicesContext);
  if (!ctx) {
    throw new Error("useInvoices must be used within InvoicesProvider");
  }
  return ctx;
}

export function useInvoicesWithProjects(): {
  invoices: Invoice[];
  projects: Project[];
} {
  const { invoices } = useInvoices();
  const { projects } = useProjects();
  return { invoices, projects };
}
