import type { WorkOrderPriority, WorkOrderStatus } from './types';

export function statusText(status: WorkOrderStatus) {
  if (status === 'new') return 'Ny';
  if (status === 'assigned') return 'Tildelt';
  if (status === 'in_progress') return 'I gang';
  if (status === 'paused') return 'Pauset';
  return 'Færdig';
}

export function statusColor(status: WorkOrderStatus): 'default' | 'info' | 'warning' | 'success' {
  if (status === 'completed') return 'success';
  if (status === 'in_progress') return 'info';
  if (status === 'paused') return 'warning';
  return 'default';
}

export function priorityText(priority: WorkOrderPriority) {
  if (priority === 'critical') return 'Kritisk';
  if (priority === 'high') return 'Høj';
  if (priority === 'low') return 'Lav';
  return 'Normal';
}

export function priorityColor(priority: WorkOrderPriority) {
  if (priority === 'critical') return '#ff6b6b';
  if (priority === 'high') return '#fb923c';
  if (priority === 'low') return '#60a5fa';
  return '#ffd166';
}
