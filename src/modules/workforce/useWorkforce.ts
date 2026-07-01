import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import {
  balanceSeed,
  leaveRequestSeed,
  payrollPeriodSeed,
  timeEntrySeed,
  workDaySeed,
} from './mockData';
import type {
  ApprovalStatus,
  EmployeeBalance,
  LeaveRequest,
  LeaveRequestDraft,
  PayrollPeriod,
  TimeEntry,
  TimeEntryDraft,
  WorkDay,
  WorkDayDraft,
} from './types';
import { mergeById, workforceStorage } from './workforceStorage';

export function useWorkforce() {
  const { user, isDemoMode } = useAuth();
  const [workDays, setWorkDays] = useState<WorkDay[]>(() =>
    mergeById(workDaySeed, workforceStorage.loadWorkDays()),
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    mergeById(leaveRequestSeed, workforceStorage.loadLeaveRequests()),
  );
  const [balances, setBalances] = useState<EmployeeBalance[]>(() =>
    createInitialBalances(user?.id, user?.fullName),
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() =>
    mergeById(timeEntrySeed, workforceStorage.loadTimeEntries()),
  );
  const [periods, setPeriods] = useState<PayrollPeriod[]>(() =>
    mergeById(payrollPeriodSeed, workforceStorage.loadPeriods()),
  );
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => workforceStorage.saveWorkDays(workDays), [workDays]);
  useEffect(() => workforceStorage.saveLeaveRequests(leaveRequests), [leaveRequests]);
  useEffect(() => workforceStorage.saveBalances(balances), [balances]);
  useEffect(() => workforceStorage.saveTimeEntries(timeEntries), [timeEntries]);
  useEffect(() => workforceStorage.savePeriods(periods), [periods]);

  const pendingSyncCount = useMemo(
    () =>
      workDays.filter(notSynced).length +
      leaveRequests.filter(notSynced).length +
      timeEntries.filter(notSynced).length +
      balances.filter((record) => record.syncStatus !== 'synced').length,
    [balances, leaveRequests, timeEntries, workDays],
  );

  const isHrAdmin = Boolean(
    user && ['system_admin', 'admin', 'hr_admin'].includes(user.role),
  );
  const isTimeAdmin = Boolean(
    user && ['system_admin', 'admin', 'time_admin'].includes(user.role),
  );

  function addWorkDay(draft: WorkDayDraft) {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const record: WorkDay = {
      ...draft,
      id: `work-${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      hours: calculateHours(draft.startTime, draft.endTime, draft.breakMinutes),
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending',
    };
    setWorkDays((current) => [record, ...current]);
    setSyncMessage('Arbejdstiden er gemt offline og afventer godkendelse.');
  }

  function addLeaveRequest(draft: LeaveRequestDraft) {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const record: LeaveRequest = {
      ...draft,
      id: `leave-${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      days: countWeekdays(draft.dateFrom, draft.dateTo),
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending',
    };
    setLeaveRequests((current) => [record, ...current]);
    setSyncMessage('Ansøgningen er gemt offline og afventer godkendelse.');
  }

  function saveTimeEntry(draft: TimeEntryDraft) {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const existing = draft.id ? timeEntries.find((record) => record.id === draft.id) : undefined;
    if (existing && existing.status !== 'pending') {
      setSyncMessage('Kun registreringer med status Afventer kan ændres.');
      return;
    }
    const record: TimeEntry = {
      ...draft,
      id: existing?.id ?? `time-${Date.now()}`,
      userId: existing?.userId ?? user.id,
      userName: existing?.userName ?? user.fullName,
      hours: calculateHours(draft.startTime, draft.endTime, draft.breakMinutes),
      status: 'pending',
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending',
    };
    setTimeEntries((current) =>
      existing
        ? current.map((entry) => (entry.id === existing.id ? record : entry))
        : [record, ...current],
    );
    setSyncMessage(existing ? 'Registreringen er opdateret offline.' : 'Tiden er gemt offline.');
  }

  function reviewRecord(
    area: 'work' | 'leave' | 'time',
    id: string,
    status: Extract<ApprovalStatus, 'approved' | 'rejected'>,
    reviewerComment = '',
  ) {
    const update = <T extends { id: string; updatedAt: string; syncStatus: string }>(record: T) =>
      record.id === id
        ? {
            ...record,
            status,
            reviewerComment,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending' as const,
          }
        : record;
    if (area === 'work') setWorkDays((current) => current.map(update));
    if (area === 'leave') setLeaveRequests((current) => current.map(update));
    if (area === 'time') setTimeEntries((current) => current.map(update));
    setSyncMessage(status === 'approved' ? 'Registreringen er godkendt.' : 'Registreringen er afvist.');
  }

  function updateBalance(userId: string, field: keyof Pick<EmployeeBalance, 'vacationDays' | 'flexHours' | 'personalDays' | 'careDays'>, value: number) {
    setBalances((current) =>
      current.map((balance) =>
        balance.userId === userId
          ? {
              ...balance,
              [field]: value,
              updatedAt: new Date().toISOString(),
              syncStatus: 'pending',
            }
          : balance,
      ),
    );
    setSyncMessage('Saldoen er opdateret offline.');
  }

  function closePeriod(id: string) {
    setPeriods((current) =>
      current.map((period) =>
        period.id === id
          ? { ...period, isClosed: true, closedAt: new Date().toISOString() }
          : period,
      ),
    );
  }

  async function syncPending() {
    if (!pendingSyncCount) {
      setSyncMessage('HR og Tid er synkroniseret.');
      return;
    }
    if (!supabase || !user || isDemoMode) {
      setSyncMessage('Ændringerne er gemt offline og synkroniseres ved rigtig login.');
      return;
    }

    const operations = [
      syncWorkDays(workDays.filter(notSynced)),
      syncLeaveRequests(leaveRequests.filter(notSynced)),
      syncTimeEntries(timeEntries.filter(notSynced)),
      syncBalances(balances.filter((record) => record.syncStatus !== 'synced')),
    ];
    const results = await Promise.all(operations);
    const error = results.find((result) => result.error)?.error;
    if (error) {
      setSyncMessage(`Synkronisering fejlede: ${error.message}`);
      markFailed(error.message);
      return;
    }

    setWorkDays((current) => current.map(markSynced));
    setLeaveRequests((current) => current.map(markSynced));
    setTimeEntries((current) => current.map(markSynced));
    setBalances((current) =>
      current.map((record) => ({ ...record, syncStatus: 'synced' as const })),
    );
    setSyncMessage('HR og Tid er synkroniseret.');
  }

  function markFailed(message: string) {
    const failed = <T extends { syncStatus: string }>(record: T) =>
      record.syncStatus === 'synced'
        ? record
        : { ...record, syncStatus: 'failed' as const, syncError: message };
    setWorkDays((current) => current.map(failed));
    setLeaveRequests((current) => current.map(failed));
    setTimeEntries((current) => current.map(failed));
  }

  return {
    user,
    workDays,
    leaveRequests,
    balances,
    timeEntries,
    periods,
    isHrAdmin,
    isTimeAdmin,
    pendingSyncCount,
    syncMessage,
    addWorkDay,
    addLeaveRequest,
    saveTimeEntry,
    reviewRecord,
    updateBalance,
    closePeriod,
    syncPending,
  };
}

export function calculateHours(start: string, end: string, breakMinutes = 0) {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute) - breakMinutes;
  if (minutes < 0) minutes += 24 * 60;
  return Math.max(0, Math.round((minutes / 60) * 100) / 100);
}

export function countWeekdays(dateFrom: string, dateTo: string) {
  if (!dateFrom || !dateTo || dateFrom > dateTo) return 0;
  let count = 0;
  const cursor = new Date(`${dateFrom}T12:00:00`);
  const end = new Date(`${dateTo}T12:00:00`);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function notSynced(record: { syncStatus: string }) {
  return record.syncStatus !== 'synced';
}

function markSynced<T extends { syncStatus: string; syncError?: string }>(record: T) {
  return record.syncStatus === 'synced'
    ? record
    : { ...record, syncStatus: 'synced' as const, syncError: undefined };
}

function mergeBalances(seed: EmployeeBalance[], stored: EmployeeBalance[]) {
  const records = new Map(seed.map((record) => [record.userId, record]));
  stored.forEach((record) => records.set(record.userId, record));
  return Array.from(records.values());
}

function createInitialBalances(userId?: string, userName?: string) {
  const records = mergeBalances(balanceSeed, workforceStorage.loadBalances());
  if (!userId || records.some((record) => record.userId === userId)) return records;
  return [
    ...records,
    {
      userId,
      userName: userName ?? 'Medarbejder',
      vacationDays: 25,
      flexHours: 0,
      personalDays: 0,
      careDays: 0,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending' as const,
    },
  ];
}

async function syncWorkDays(records: WorkDay[]) {
  if (!records.length || !supabase) return { error: null };
  return supabase.from('hr_work_days').upsert(
    records.map((record) => ({
      id: record.id,
      user_id: record.userId,
      work_date: record.date,
      start_time: record.startTime,
      end_time: record.endTime,
      break_minutes: record.breakMinutes,
      hours: record.hours,
      note: record.note,
      status: record.status,
      reviewer_comment: record.reviewerComment,
      updated_at: record.updatedAt,
    })),
  );
}

async function syncLeaveRequests(records: LeaveRequest[]) {
  if (!records.length || !supabase) return { error: null };
  return supabase.from('hr_leave_requests').upsert(
    records.map((record) => ({
      id: record.id,
      user_id: record.userId,
      leave_type: record.type,
      date_from: record.dateFrom,
      date_to: record.dateTo,
      days: record.days,
      note: record.note,
      status: record.status,
      reviewer_comment: record.reviewerComment,
      updated_at: record.updatedAt,
    })),
  );
}

async function syncTimeEntries(records: TimeEntry[]) {
  if (!records.length || !supabase) return { error: null };
  return supabase.from('time_entries').upsert(
    records.map((record) => ({
      id: record.id,
      user_id: record.userId,
      entry_date: record.date,
      start_time: record.startTime,
      end_time: record.endTime,
      break_minutes: record.breakMinutes,
      hours: record.hours,
      entry_kind: record.kind,
      location: record.location,
      description: record.description,
      status: record.status,
      reviewer_comment: record.reviewerComment,
      updated_at: record.updatedAt,
    })),
  );
}

async function syncBalances(records: EmployeeBalance[]) {
  if (!records.length || !supabase) return { error: null };
  return supabase.from('hr_balances').upsert(
    records.map((record) => ({
      user_id: record.userId,
      vacation_days: record.vacationDays,
      flex_hours: record.flexHours,
      personal_days: record.personalDays,
      care_days: record.careDays,
      updated_at: record.updatedAt,
    })),
  );
}
