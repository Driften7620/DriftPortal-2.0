import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { workOrderSeed } from './mockData';
import { loadStoredWorkOrders, mergeWorkOrders, saveStoredWorkOrders } from './workOrderStorage';
import type {
  NewWorkOrderInput,
  WorkOrder,
  WorkOrderMaterial,
  WorkOrderStatus,
} from './types';

export function useWorkOrders() {
  const { user, isDemoMode } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() =>
    mergeWorkOrders(workOrderSeed, loadStoredWorkOrders()),
  );
  const [syncMessage, setSyncMessage] = useState('');
  const pendingCount = useMemo(
    () =>
      workOrders.filter(
        (workOrder) => workOrder.syncStatus === 'pending' || workOrder.syncStatus === 'failed',
      ).length,
    [workOrders],
  );

  useEffect(() => {
    saveStoredWorkOrders(workOrders);
  }, [workOrders]);

  function addWorkOrder(input: NewWorkOrderInput) {
    const now = new Date().toISOString();
    const workOrder: WorkOrder = {
      ...input,
      id: `job-${Date.now()}`,
      status: 'assigned',
      createdAt: now,
      createdBy: user?.fullName ?? 'Bruger',
      checklist: [],
      comments: [],
      materials: [],
      attachmentCount: 0,
      syncStatus: 'pending',
      updatedAt: now,
    };
    setWorkOrders((current) => [workOrder, ...current]);
    setSyncMessage('Opgaven er gemt lokalt og klar til synkronisering.');
    return workOrder;
  }

  function updateStatus(id: string, status: WorkOrderStatus) {
    updateWorkOrder(id, (workOrder) => ({ ...workOrder, status }));
  }

  function toggleChecklistItem(workOrderId: string, checklistId: string) {
    updateWorkOrder(workOrderId, (workOrder) => ({
      ...workOrder,
      checklist: workOrder.checklist.map((item) =>
        item.id === checklistId ? { ...item, done: !item.done } : item,
      ),
    }));
  }

  function addChecklistItem(workOrderId: string, title: string) {
    if (!title.trim()) return;
    updateWorkOrder(workOrderId, (workOrder) => ({
      ...workOrder,
      checklist: [
        ...workOrder.checklist,
        { id: `check-${Date.now()}`, title: title.trim(), done: false },
      ],
    }));
  }

  function addComment(workOrderId: string, text: string) {
    if (!text.trim()) return;
    updateWorkOrder(workOrderId, (workOrder) => ({
      ...workOrder,
      comments: [
        {
          id: `comment-${Date.now()}`,
          text: text.trim(),
          author: user?.fullName ?? 'Bruger',
          createdAt: new Date().toISOString(),
        },
        ...workOrder.comments,
      ],
    }));
  }

  function addMaterial(workOrderId: string, material: Omit<WorkOrderMaterial, 'id'>) {
    if (!material.name.trim() || material.quantity <= 0) return;
    updateWorkOrder(workOrderId, (workOrder) => ({
      ...workOrder,
      materials: [
        ...workOrder.materials,
        { ...material, id: `material-${Date.now()}`, name: material.name.trim() },
      ],
    }));
  }

  async function syncPending() {
    const pending = workOrders.filter(
      (workOrder) => workOrder.syncStatus === 'pending' || workOrder.syncStatus === 'failed',
    );
    if (!pending.length) {
      setSyncMessage('Alle opgaver er synkroniseret.');
      return;
    }
    if (isDemoMode || !supabase || !user) {
      setSyncMessage(
        'Opgaverne er gemt offline. De sendes til Supabase, når rigtig login er konfigureret.',
      );
      return;
    }

    const payload = pending.map((workOrder) => ({
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      location: workOrder.location,
      category: workOrder.category,
      priority: workOrder.priority,
      status: workOrder.status,
      assigned_to: workOrder.assignedTo,
      due_at: workOrder.dueAt,
      created_by: user.id,
      checklist: workOrder.checklist,
      comments: workOrder.comments,
      materials: workOrder.materials,
      attachment_count: workOrder.attachmentCount,
      updated_at: workOrder.updatedAt,
    }));
    const { error } = await supabase.from('facility_work_orders').upsert(payload);

    if (error) {
      setWorkOrders((current) =>
        current.map((workOrder) =>
          pending.some((item) => item.id === workOrder.id)
            ? { ...workOrder, syncStatus: 'failed', syncError: error.message }
            : workOrder,
        ),
      );
      setSyncMessage(`Synkronisering fejlede: ${error.message}`);
      return;
    }

    const syncedAt = new Date().toISOString();
    setWorkOrders((current) =>
      current.map((workOrder) =>
        pending.some((item) => item.id === workOrder.id)
          ? { ...workOrder, syncStatus: 'synced', syncError: undefined, syncedAt }
          : workOrder,
      ),
    );
    setSyncMessage(`${pending.length} opgave${pending.length === 1 ? '' : 'r'} synkroniseret.`);
  }

  function updateWorkOrder(id: string, updater: (workOrder: WorkOrder) => WorkOrder) {
    setWorkOrders((current) =>
      current.map((workOrder) =>
        workOrder.id === id
          ? {
              ...updater(workOrder),
              syncStatus: 'pending',
              syncError: undefined,
              updatedAt: new Date().toISOString(),
            }
          : workOrder,
      ),
    );
    setSyncMessage('Ændringen er gemt offline og klar til synkronisering.');
  }

  return {
    workOrders,
    pendingCount,
    syncMessage,
    addWorkOrder,
    updateStatus,
    toggleChecklistItem,
    addChecklistItem,
    addComment,
    addMaterial,
    syncPending,
  };
}
