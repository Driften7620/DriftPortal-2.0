import type { MeterReading } from './types';

const readingsStorageKey = 'driftportal-maalerlog-readings';

export function loadStoredReadings(): MeterReading[] {
  try {
    const stored = localStorage.getItem(readingsStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as MeterReading[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredReadings(readings: MeterReading[]) {
  localStorage.setItem(readingsStorageKey, JSON.stringify(readings));
}

export function mergeReadings(seedReadings: MeterReading[], storedReadings: MeterReading[]) {
  const byId = new Map<string, MeterReading>();
  [...seedReadings, ...storedReadings].forEach((reading) => byId.set(reading.id, reading));
  return Array.from(byId.values()).sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());
}
