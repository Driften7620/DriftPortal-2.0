export type RoundStatus = 'planned' | 'in_progress' | 'completed' | 'attention';
export type RoundPointStatus = 'pending' | 'ok' | 'deviation' | 'skipped';

export interface RoundPoint {
  id: string;
  title: string;
  location: string;
  group: string;
  instruction: string;
  qrCode: string;
  required: boolean;
}

export interface RoundSession {
  id: string;
  title: string;
  area: string;
  dueAt: string;
  assignedTo: string;
  status: RoundStatus;
  pointIds: string[];
}

export interface RoundCheck {
  id: string;
  sessionId: string;
  pointId: string;
  status: RoundPointStatus;
  checkedAt: string;
  checkedBy: string;
  note?: string;
  syncStatus?: 'local' | 'pending' | 'synced' | 'failed';
  syncError?: string;
  syncedAt?: string;
}
