import type { InventoryItem, InventoryMovement } from './types';

const itemsKey = 'driftportal-inventory-items';
const movementsKey = 'driftportal-inventory-movements';

export function loadInventoryItems() {
  return readArray<InventoryItem>(itemsKey);
}

export function loadInventoryMovements() {
  return readArray<InventoryMovement>(movementsKey);
}

export function saveInventoryItems(items: InventoryItem[]) {
  localStorage.setItem(itemsKey, JSON.stringify(items));
}

export function saveInventoryMovements(movements: InventoryMovement[]) {
  localStorage.setItem(movementsKey, JSON.stringify(movements));
}

export function mergeById<T extends { id: string }>(seed: T[], stored: T[]) {
  const byId = new Map(seed.map((item) => [item.id, item]));
  stored.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
}

function readArray<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
