export type InventorySyncStatus = 'pending' | 'synced' | 'failed';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  qrCode: string;
  note?: string;
  updatedAt: string;
  syncStatus: InventorySyncStatus;
  syncError?: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  delta: number;
  quantityAfter: number;
  reason: string;
  performedBy: string;
  createdAt: string;
  syncStatus: InventorySyncStatus;
  syncError?: string;
}

export interface NewInventoryItem {
  name: string;
  category: string;
  location: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
}
