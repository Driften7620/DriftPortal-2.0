export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface WorkforceRecord {
  id: string;
  userId: string;
  userName: string;
  status: ApprovalStatus;
  reviewerComment?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  syncError?: string;
}

export interface WorkDay extends WorkforceRecord {
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  hours: number;
  note: string;
}

export type LeaveType = 'vacation' | 'personal' | 'care' | 'unpaid';

export interface LeaveRequest extends WorkforceRecord {
  type: LeaveType;
  dateFrom: string;
  dateTo: string;
  days: number;
  note: string;
}

export interface EmployeeBalance {
  userId: string;
  userName: string;
  vacationDays: number;
  flexHours: number;
  personalDays: number;
  careDays: number;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export type TimeEntryKind = 'regular' | 'overtime' | 'callout' | 'driving' | 'course';

export interface TimeEntry extends WorkforceRecord {
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  hours: number;
  kind: TimeEntryKind;
  location: string;
  description: string;
}

export interface PayrollPeriod {
  id: string;
  title: string;
  dateFrom: string;
  dateTo: string;
  isClosed: boolean;
  closedAt?: string;
}

export interface WorkDayDraft {
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  note: string;
}

export interface LeaveRequestDraft {
  type: LeaveType;
  dateFrom: string;
  dateTo: string;
  note: string;
}

export interface TimeEntryDraft {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  kind: TimeEntryKind;
  location: string;
  description: string;
}
