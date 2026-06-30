export type MeterStatus = 'ok' | 'due' | 'alarm' | 'service';

export interface Meter {
  id: string;
  name: string;
  location: string;
  group: string;
  unit: string;
  intervalHours: number;
  minValue?: number;
  maxValue?: number;
  averageConsumption: number;
  status: MeterStatus;
  qrCode: string;
  note?: string;
}

export interface MeterReading {
  id: string;
  meterId: string;
  value: number;
  readAt: string;
  readBy: string;
  comment?: string;
  consumption?: number;
  syncStatus?: 'local' | 'pending' | 'synced' | 'failed';
  syncError?: string;
  syncedAt?: string;
}

export interface ReadingAssessment {
  consumption: number;
  isLowerThanPrevious: boolean;
  isOutOfRange: boolean;
  isUnusualConsumption: boolean;
}
