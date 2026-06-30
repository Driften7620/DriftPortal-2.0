import type { UserProfile, UserRole } from '../../types/auth';

export type AdminSyncStatus = 'pending' | 'synced' | 'failed';

export interface ManagedUser extends UserProfile {
  phone?: string;
  jobTitle: string;
  updatedAt: string;
  syncStatus: AdminSyncStatus;
  syncError?: string;
}

export interface SystemLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  isActive: boolean;
  updatedAt: string;
  syncStatus: AdminSyncStatus;
  syncError?: string;
}

export interface SystemCategory {
  id: string;
  name: string;
  area: string;
  color: string;
  isActive: boolean;
  updatedAt: string;
  syncStatus: AdminSyncStatus;
  syncError?: string;
}

export interface PortalSettings {
  organizationName: string;
  emergencyPhone: string;
  defaultLocationId: string;
  syncIntervalMinutes: number;
  automaticSync: boolean;
  pushNotifications: boolean;
  offlineMode: boolean;
  updatedAt: string;
  syncStatus: AdminSyncStatus;
  syncError?: string;
}

export interface UserDraft {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: UserRole;
  moduleAccess: string[];
  isActive: boolean;
}

export interface LocationDraft {
  name: string;
  code: string;
  address: string;
}

export interface CategoryDraft {
  name: string;
  area: string;
  color: string;
}
