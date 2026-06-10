import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { dummyEmployees, dummyTimesheets } from "../data/dummyHR";
import type { Employee, TimesheetEntry, TimesheetStatus } from "../types/hr";

interface HRContextValue {
  employees: Employee[];
  timesheets: TimesheetEntry[];
  addEmployee: (employee: Omit<Employee, "id" | "employeeId" | "createdAt" | "updatedAt">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  clockIn: (entry: Omit<TimesheetEntry, "id" | "status" | "createdAt">) => void;
  clockOut: (id: string, location?: string) => void;
  updateTimesheetStatus: (id: string, status: TimesheetStatus, approvedBy?: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
}

const HRContext = createContext<HRContextValue | null>(null);

const EMPLOYEES_STORAGE_KEY = "swg_employees";
const TIMESHEETS_STORAGE_KEY = "swg_timesheets";

export function HRProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : dummyEmployees;
  });

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(() => {
    const stored = localStorage.getItem(TIMESHEETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : dummyTimesheets;
  });

  useEffect(() => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(TIMESHEETS_STORAGE_KEY, JSON.stringify(timesheets));
  }, [timesheets]);

  const addEmployee = useCallback((input: Omit<Employee, "id" | "employeeId" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newEmployee: Employee = {
      ...input,
      id: `emp-${Date.now()}`,
      employeeId: `SWG-${String(employees.length + 1).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    setEmployees((prev) => [newEmployee, ...prev]);
  }, [employees.length]);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    const now = new Date().toISOString();
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates, updatedAt: now } : emp))
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, []);

  const clockIn = useCallback((input: Omit<TimesheetEntry, "id" | "status" | "createdAt">) => {
    const now = new Date().toISOString();
    const newEntry: TimesheetEntry = {
      ...input,
      id: `ts-${Date.now()}`,
      status: "Pending",
      createdAt: now,
    };
    setTimesheets((prev) => [newEntry, ...prev]);
  }, []);

  const clockOut = useCallback((id: string, location?: string) => {
    const now = new Date().toISOString();
    setTimesheets((prev) =>
      prev.map((ts) => {
        if (ts.id !== id) return ts;
        const clockOutTime = now;
        const start = new Date(ts.clockInTime).getTime();
        const end = new Date(clockOutTime).getTime();
        let totalHours = (end - start) / (1000 * 60 * 60);
        if (ts.breakDeduction && totalHours > 5) {
          totalHours -= 0.5;
        }
        return {
          ...ts,
          clockOutTime,
          clockOutLocation: location,
          totalHours: Math.round(totalHours * 100) / 100,
        };
      })
    );
  }, []);

  const updateTimesheetStatus = useCallback((id: string, status: TimesheetStatus, approvedBy?: string) => {
    setTimesheets((prev) =>
      prev.map((ts) => (ts.id === id ? { ...ts, status, approvedBy } : ts))
    );
  }, []);

  const getEmployeeById = useCallback((id: string) => {
    return employees.find((emp) => emp.id === id);
  }, [employees]);

  const value = useMemo(
    () => ({
      employees,
      timesheets,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      clockIn,
      clockOut,
      updateTimesheetStatus,
      getEmployeeById,
    }),
    [
      employees,
      timesheets,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      clockIn,
      clockOut,
      updateTimesheetStatus,
      getEmployeeById,
    ]
  );

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export function useHR() {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error("useHR must be used within an HRProvider");
  }
  return context;
}
