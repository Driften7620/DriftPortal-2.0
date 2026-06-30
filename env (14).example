import type { ManagedUser, PortalSettings, SystemCategory, SystemLocation } from './types';

const keys = {
  users: 'driftportal.admin.users.v1',
  locations: 'driftportal.admin.locations.v1',
  categories: 'driftportal.admin.categories.v1',
  settings: 'driftportal.admin.settings.v1',
};

function loadValue<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function saveValue<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadAdminUsers = () => loadValue<ManagedUser[]>(keys.users);
export const saveAdminUsers = (value: ManagedUser[]) => saveValue(keys.users, value);
export const loadLocations = () => loadValue<SystemLocation[]>(keys.locations);
export const saveLocations = (value: SystemLocation[]) => saveValue(keys.locations, value);
export const loadCategories = () => loadValue<SystemCategory[]>(keys.categories);
export const saveCategories = (value: SystemCategory[]) => saveValue(keys.categories, value);
export const loadPortalSettings = () => loadValue<PortalSettings>(keys.settings);
export const savePortalSettings = (value: PortalSettings) => saveValue(keys.settings, value);
