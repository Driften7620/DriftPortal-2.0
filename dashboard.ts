import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { inventorySeed, movementSeed } from './mockData';
import {
  loadInventoryItems,
  loadInventoryMovements,
  mergeById,
  saveInventoryItems,
  saveInventoryMovements,
} from './inventoryStorage';
import type { InventoryItem, InventoryMovement, NewInventoryItem } from './types';

export function useInventory() {
  const { user, isDemoMode } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>(() =>
    mergeById(inventorySeed, loadInventoryItems()),
  );
  const [movements, setMovements] = useState<InventoryMovement[]>(() =>
    mergeById(movementSeed, loadInventoryMovements()),
  );
  const [syncMessage, setSyncMessage] = useState('');
  const pendingCount = useMemo(
    () =>
      items.filter((item) => item.syncStatus !== 'synced').length +
      movements.filter((movement) => movement.syncStatus !== 'synced').length,
    [items, movements],
  );

  useEffect(() => saveInventoryItems(items), [items]);
  useEffect(() => saveInventoryMovements(movements), [movements]);

  function addItem(input: NewInventoryItem) {
    const now = new Date().toISOString();
    const item: InventoryItem = {
      ...input,
      id: `lager-${Date.now()}`,
      qrCode: `LAGER-${Date.now()}`,
      updatedAt: now,
      syncStatus: 'pending',
    };
    setItems((current) => [item, ...current]);
    setSyncMessage('Varen er gemt offline og klar til synkronisering.');
    return item;
  }

  function adjustQuantity(itemId: string, delta: number, reason: string) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    const quantityAfter = Math.max(0, item.quantity + delta);
    const actualDelta = quantityAfter - item.quantity;
    if (actualDelta === 0) return;
    const now = new Date().toISOString();

    setItems((current) =>
      current.map((entry) =>
        entry.id === itemId
          ? { ...entry, quantity: quantityAfter, updatedAt: now, syncStatus: 'pending' }
          : entry,
      ),
    );
    setMovements((current) => [
      {
        id: `movement-${Date.now()}`,
        itemId,
        delta: actualDelta,
        quantityAfter,
        reason: reason.trim() || (actualDelta > 0 ? 'Lagt på lager' : 'Forbrug'),
        performedBy: user?.fullName ?? 'Bruger',
        createdAt: now,
        syncStatus: 'pending',
      },
      ...current,
    ]);
    setSyncMessage('Lagerbevægelsen er gemt offline.');
  }

  async function syncPending() {
    const pendingItems = items.filter((item) => item.syncStatus !== 'synced');
    const pendingMovements = movements.filter((movement) => movement.syncStatus !== 'synced');
    if (!pendingItems.length && !pendingMovements.length) {
      setSyncMessage('Lageret er synkroniseret.');
      return;
    }
    if (isDemoMode || !supabase || !user) {
      setSyncMessage('Ændringerne er gemt offline og sendes, når rigtig login er konfigureret.');
      return;
    }

    const itemResult = await supabase.from('inventory_items').upsert(
      pendingItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        min_quantity: item.minQuantity,
        max_quantity: item.maxQuantity,
        unit: item.unit,
        qr_code: item.qrCode,
        note: item.note,
        updated_at: item.updatedAt,
      })),
    );
    if (itemResult.error) {
      markSyncFailed(itemResult.error.message);
      return;
    }

    const movementResult = pendingMovements.length
      ? await supabase.from('inventory_movements').upsert(
          pendingMovements.map((movement) => ({
            id: movement.id,
            item_id: movement.itemId,
            delta: movement.delta,
            quantity_after: movement.quantityAfter,
            reason: movement.reason,
            performed_by: user.id,
            created_at: movement.createdAt,
          })),
        )
      : { error: null };
    if (movementResult.error) {
      markSyncFailed(movementResult.error.message);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.syncStatus !== 'synced' ? { ...item, syncStatus: 'synced', syncError: undefined } : item,
      ),
    );
    setMovements((current) =>
      current.map((movement) =>
        movement.syncStatus !== 'synced'
          ? { ...movement, syncStatus: 'synced', syncError: undefined }
          : movement,
      ),
    );
    setSyncMessage('Lagerændringerne er synkroniseret.');
  }

  function markSyncFailed(message: string) {
    setItems((current) =>
      current.map((item) =>
        item.syncStatus !== 'synced' ? { ...item, syncStatus: 'failed', syncError: message } : item,
      ),
    );
    setMovements((current) =>
      current.map((movement) =>
        movement.syncStatus !== 'synced'
          ? { ...movement, syncStatus: 'failed', syncError: message }
          : movement,
      ),
    );
    setSyncMessage(`Synkronisering fejlede: ${message}`);
  }

  return { items, movements, pendingCount, syncMessage, addItem, adjustQuantity, syncPending };
}
