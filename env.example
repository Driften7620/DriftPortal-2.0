import type { WorkOrder } from './types';

const storageKey = 'driftportal-facility-work-orders';

export function loadStoredWorkOrders(): WorkOrder[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as WorkOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredWorkOrders(workOrders: WorkOrder[]) {
  localStorage.setItem(storageKey, JSON.stringify(workOrders));
}

export function mergeWorkOrders(seed: WorkOrder[], stored: WorkOrder[]) {
  const byId = new Map(seed.map((workOrder) => [workOrder.id, workOrder]));
  stored.forEach((workOrder) => byId.set(workOrder.id, workOrder));
  const priorityRank = { critical: 0, high: 1, normal: 2, low: 3 };
  return Array.from(byId.values()).sort((a, b) => {
    const completionDifference =
      Number(a.status === 'completed') - Number(b.status === 'completed');
    if (completionDifference !== 0) return completionDifference;
    const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDifference !== 0) return priorityDifference;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}
