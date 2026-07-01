import type {
  EmployeeBalance,
  LeaveRequest,
  PayrollPeriod,
  TimeEntry,
  WorkDay,
} from './types';

const now = new Date().toISOString();

export const workDaySeed: WorkDay[] = [
  {
    id: 'work-demo-1',
    userId: 'demo-stefan',
    userName: 'Stefan',
    date: '2026-06-30',
    startTime: '07:00',
    endTime: '15:00',
    breakMinutes: 30,
    hours: 7.5,
    note: 'Almindelig arbejdsdag',
    status: 'approved',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
  },
];

export const leaveRequestSeed: LeaveRequest[] = [
  {
    id: 'leave-demo-1',
    userId: 'employee-allan',
    userName: 'Allan',
    type: 'vacation',
    dateFrom: '2026-07-20',
    dateTo: '2026-07-24',
    days: 5,
    note: 'Sommerferie',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
  },
];

export const balanceSeed: EmployeeBalance[] = [
  {
    userId: 'demo-stefan',
    userName: 'Stefan',
    vacationDays: 25,
    flexHours: 12.5,
    personalDays: 2,
    careDays: 2,
    updatedAt: now,
    syncStatus: 'synced',
  },
  {
    userId: 'employee-allan',
    userName: 'Allan',
    vacationDays: 18,
    flexHours: 4.25,
    personalDays: 1,
    careDays: 2,
    updatedAt: now,
    syncStatus: 'synced',
  },
];

export const timeEntrySeed: TimeEntry[] = [
  {
    id: 'time-demo-1',
    userId: 'demo-stefan',
    userName: 'Stefan',
    date: '2026-06-30',
    startTime: '07:00',
    endTime: '15:00',
    breakMinutes: 30,
    hours: 7.5,
    kind: 'regular',
    location: 'Industrivej',
    description: 'Drift og tilsyn',
    status: 'approved',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
  },
  {
    id: 'time-demo-2',
    userId: 'employee-laurids',
    userName: 'Laurids',
    date: '2026-07-01',
    startTime: '05:30',
    endTime: '07:15',
    breakMinutes: 0,
    hours: 1.75,
    kind: 'callout',
    location: 'Vestavej',
    description: 'Alarm på varmepumpe GM1',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
  },
];

export const payrollPeriodSeed: PayrollPeriod[] = [
  {
    id: 'period-2026-07',
    title: 'Juli 2026',
    dateFrom: '2026-07-01',
    dateTo: '2026-07-31',
    isClosed: false,
  },
];

export const leaveTypeLabels = {
  vacation: 'Ferie',
  personal: 'Feriefridag',
  care: 'Omsorgsdag',
  unpaid: 'Fri uden løn',
} as const;

export const timeKindLabels = {
  regular: 'Ordinær tid',
  overtime: 'Overarbejde',
  callout: 'Udkald',
  driving: 'Kørsel',
  course: 'Kursus',
} as const;

export const workforceLocations = ['Industrivej', 'Vestavej', 'Klinkby', 'Nr. Nissum'];
