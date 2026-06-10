export type EmployeeRole =
  | "Crew Leader"
  | "Installer"
  | "Supervisor"
  | "Office Staff"
  | "Driver";

export type EmploymentType = "Full-time" | "Part-time" | "Subcontractor";

export type PayType = "Hourly" | "Salary";

export type TaxFilingStatus = "Single" | "Married" | "Head of Household";

export type EmployeeStatus = "Active" | "Inactive" | "Terminated";

export interface Employee {
  id: string;
  employeeId: string; // Auto-generated
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  employmentType: EmploymentType;
  payType: PayType;
  payRate: number;
  phone: string;
  email: string;
  state: string;
  taxFilingStatus: TaxFilingStatus;
  bankingDetails: string;
  startDate: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export type WorkType =
  | "Regular Installation"
  | "Travel"
  | "Shop Work"
  | "Training"
  | "Prevailing Wage";

export type TimesheetStatus = "Pending" | "Approved" | "Rejected";

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  projectId: string;
  workType: WorkType;
  clockInTime: string; // ISO string
  clockInLocation?: string;
  clockOutTime?: string; // ISO string
  clockOutLocation?: string;
  totalHours?: number;
  breakDeduction: boolean;
  notes?: string;
  status: TimesheetStatus;
  approvedBy?: string;
  createdAt: string;
}

export interface WeeklyTimesheetSummary {
  employeeId: string;
  employeeName: string;
  weekEndingDate: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  status: TimesheetStatus;
  approvedBy?: string;
}
