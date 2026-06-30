import type { RoundCheck } from './types';

const checksStorageKey = 'driftportal-rundering-checks';

export function loadStoredChecks(): RoundCheck[] {
  try {
    const stored = localStorage.getItem(checksStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as RoundCheck[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredChecks(checks: RoundCheck[]) {
  localStorage.setItem(checksStorageKey, JSON.stringify(checks));
}

export function mergeChecks(seedChecks: RoundCheck[], storedChecks: RoundCheck[]) {
  const byId = new Map<string, RoundCheck>();
  [...seedChecks, ...storedChecks].forEach((check) => byId.set(check.id, check));
  return Array.from(byId.values()).sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
}
