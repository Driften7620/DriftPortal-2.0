import type { InventoryItem, InventoryMovement } from './types';

export const inventorySeed: InventoryItem[] = [
  {
    id: 'lager-1001',
    name: 'Natriumhydroxid 25 kg',
    category: 'Kemikalier',
    location: 'Vestavej · Kemilager',
    quantity: 3,
    minQuantity: 4,
    maxQuantity: 12,
    unit: 'sække',
    qrCode: 'LAGER-1001',
    note: 'Brug kemikaliehandsker og visir.',
    updatedAt: '2026-06-30T08:05:00+02:00',
    syncStatus: 'synced',
  },
  {
    id: 'lager-1002',
    name: 'Motorolie 15W-40',
    category: 'Smøremidler',
    location: 'Industrivej · Værksted',
    quantity: 18,
    minQuantity: 8,
    maxQuantity: 30,
    unit: 'liter',
    qrCode: 'LAGER-1002',
    updatedAt: '2026-06-30T07:20:00+02:00',
    syncStatus: 'synced',
  },
  {
    id: 'lager-1003',
    name: 'Sikring NH00 63A',
    category: 'El',
    location: 'Vestavej · El-lager',
    quantity: 8,
    minQuantity: 4,
    maxQuantity: 20,
    unit: 'stk',
    qrCode: 'LAGER-1003',
    updatedAt: '2026-06-29T14:35:00+02:00',
    syncStatus: 'synced',
  },
  {
    id: 'lager-1004',
    name: 'Leje 6205-2RS',
    category: 'Reservedele',
    location: 'Industrivej · Værksted',
    quantity: 0,
    minQuantity: 2,
    maxQuantity: 8,
    unit: 'stk',
    qrCode: 'LAGER-1004',
    updatedAt: '2026-06-30T08:30:00+02:00',
    syncStatus: 'synced',
  },
];

export const movementSeed: InventoryMovement[] = [
  {
    id: 'movement-1001',
    itemId: 'lager-1004',
    delta: -1,
    quantityAfter: 0,
    reason: 'Brugt på pumpe P-12',
    performedBy: 'Stefan',
    createdAt: '2026-06-30T08:30:00+02:00',
    syncStatus: 'synced',
  },
  {
    id: 'movement-1002',
    itemId: 'lager-1002',
    delta: -2,
    quantityAfter: 18,
    reason: 'Olieskift GM 1',
    performedBy: 'Allan',
    createdAt: '2026-06-30T07:20:00+02:00',
    syncStatus: 'synced',
  },
];

export const inventoryCategories = ['Kemikalier', 'Smøremidler', 'El', 'Reservedele', 'Værktøj', 'Andet'];
export const inventoryLocations = [
  'Vestavej · Kemilager',
  'Vestavej · El-lager',
  'Industrivej · Værksted',
  'Klinkby · Lager',
];
