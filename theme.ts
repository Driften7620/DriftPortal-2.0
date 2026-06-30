export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'critical';
export type WorkOrderStatus = 'new' | 'assigned' | 'in_progress' | 'paused' | 'completed';
export type WorkOrderSyncStatus = 'local' | 'pending' | 'synced' | 'failed';

export interface WorkOrderChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface WorkOrderComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface WorkOrderMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo: string;
  dueAt: string;
  createdAt: string;
  createdBy: string;
  checklist: WorkOrderChecklistItem[];
  comments: WorkOrderComment[];
  materials: WorkOrderMaterial[];
  attachmentCount: number;
  syncStatus: WorkOrderSyncStatus;
  syncError?: string;
  syncedAt?: string;
  updatedAt: string;
}

export interface NewWorkOrderInput {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: WorkOrderPriority;
  assignedTo: string;
  dueAt: string;
}
