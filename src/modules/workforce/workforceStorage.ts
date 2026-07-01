import type {
  EmployeeBalance,
  LeaveRequest,
  PayrollPeriod,
  TimeEntry,
  WorkDay,
} from './types';

const keys = {
  workDays: 'driftportal-hr-work-days-v1',
  leaveRequests: 'driftportal-hr-leave-requests-v1',
  balances: 'driftportal-hr-balances-v1',
  timeEntries: 'driftportal-time-entries-v1',
  periods: 'driftportal-payroll-periods-v1',
};

export const workforceStorage = {
  loadWorkDays: () => readArray<WorkDay>(keys.workDays),
  saveWorkDays: (value: WorkDay[]) => write(keys.workDays, value),
  loadLeaveRequests: () => readArray<LeaveRequest>(keys.leaveRequests),
  saveLeaveRequests: (value: LeaveRequest[]) => write(keys.leaveRequests, value),
  loadBalances: () => readArray<EmployeeBalance>(keys.balances),
  saveBalances: (value: EmployeeBalance[]) => write(keys.balances, value),
  loadTimeEntries: () => readArray<TimeEntry>(keys.timeEntries),
  saveTimeEntries: (value: TimeEntry[]) => write(keys.timeEntries, value),
  loadPeriods: () => readArray<PayrollPeriod>(keys.periods),
  savePeriods: (value: PayrollPeriod[]) => write(keys.periods, value),
};

export function mergeById<T extends { id: string }>(seed: T[], stored: T[]) {
  const records = new Map(seed.map((record) => [record.id, record]));
  stored.forEach((record) => records.set(record.id, record));
  return Array.from(records.values());
}

function readArray<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? (JSON.parse(value) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
