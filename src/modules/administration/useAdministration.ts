import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import {
  loadAdminUsers,
  loadCategories,
  loadLocations,
  loadPortalSettings,
  saveAdminUsers,
  saveCategories,
  saveLocations,
  savePortalSettings,
} from './adminStorage';
import { adminUserSeed, categorySeed, locationSeed, settingsSeed } from './mockData';
import type {
  CategoryDraft,
  LocationDraft,
  ManagedUser,
  PortalSettings,
  SystemCategory,
  SystemLocation,
  UserDraft,
} from './types';

export function useAdministration() {
  const { isDemoMode } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>(() => loadAdminUsers() ?? adminUserSeed);
  const [locations, setLocations] = useState<SystemLocation[]>(
    () => loadLocations() ?? locationSeed,
  );
  const [categories, setCategories] = useState<SystemCategory[]>(
    () => loadCategories() ?? categorySeed,
  );
  const [settings, setSettings] = useState<PortalSettings>(
    () => loadPortalSettings() ?? settingsSeed,
  );
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => saveAdminUsers(users), [users]);
  useEffect(() => saveLocations(locations), [locations]);
  useEffect(() => saveCategories(categories), [categories]);
  useEffect(() => savePortalSettings(settings), [settings]);

  const pendingCount = useMemo(
    () =>
      users.filter((item) => item.syncStatus !== 'synced').length +
      locations.filter((item) => item.syncStatus !== 'synced').length +
      categories.filter((item) => item.syncStatus !== 'synced').length +
      (settings.syncStatus === 'synced' ? 0 : 1),
    [categories, locations, settings.syncStatus, users],
  );

  function saveUser(draft: UserDraft) {
    const now = new Date().toISOString();
    const id = draft.id ?? `local-user-${Date.now()}`;
    const user: ManagedUser = {
      id,
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      jobTitle: draft.jobTitle.trim(),
      role: draft.role,
      moduleAccess: draft.moduleAccess,
      isActive: draft.isActive,
      updatedAt: now,
      syncStatus: 'pending',
    };
    setUsers((current) => [user, ...current.filter((item) => item.id !== id)]);
    setSyncMessage(
      draft.id
        ? 'Brugerens ændringer er gemt offline.'
        : 'Brugeren er oprettet lokalt. Rigtig login-invitation kræver Supabase.',
    );
  }

  function toggleUserActive(id: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              isActive: !user.isActive,
              updatedAt: new Date().toISOString(),
              syncStatus: 'pending',
            }
          : user,
      ),
    );
    setSyncMessage('Brugerstatus er gemt offline.');
  }

  function addLocation(draft: LocationDraft) {
    const location: SystemLocation = {
      id: `location-${Date.now()}`,
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      address: draft.address.trim(),
      isActive: true,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    setLocations((current) => [location, ...current]);
    setSyncMessage('Lokationen er gemt offline.');
  }

  function addCategory(draft: CategoryDraft) {
    const category: SystemCategory = {
      id: `category-${Date.now()}`,
      name: draft.name.trim(),
      area: draft.area,
      color: draft.color,
      isActive: true,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    setCategories((current) => [category, ...current]);
    setSyncMessage('Kategorien er gemt offline.');
  }

  function toggleLocation(id: string) {
    setLocations((current) =>
      current.map((location) =>
        location.id === id
          ? {
              ...location,
              isActive: !location.isActive,
              updatedAt: new Date().toISOString(),
              syncStatus: 'pending',
            }
          : location,
      ),
    );
  }

  function toggleCategory(id: string) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? {
              ...category,
              isActive: !category.isActive,
              updatedAt: new Date().toISOString(),
              syncStatus: 'pending',
            }
          : category,
      ),
    );
  }

  function updateSettings(next: PortalSettings) {
    setSettings({
      ...next,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncError: undefined,
    });
    setSyncMessage('Systemindstillingerne er gemt offline.');
  }

  async function syncPending() {
    if (!pendingCount) {
      setSyncMessage('Systemopsætningen er synkroniseret.');
      return;
    }
    if (isDemoMode || !supabase) {
      setSyncMessage('Opsætningen er gemt offline og sendes, når rigtig login er konfigureret.');
      return;
    }

    const existingUsers = users.filter(
      (user) => user.syncStatus !== 'synced' && !user.id.startsWith('local-user-'),
    );
    for (const user of existingUsers) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: user.fullName,
          role: user.role,
          module_access: user.moduleAccess,
          is_active: user.isActive,
          updated_at: user.updatedAt,
        })
        .eq('id', user.id);
      if (error) return markFailed(error.message);
    }

    const pendingLocations = locations.filter((item) => item.syncStatus !== 'synced');
    if (pendingLocations.length) {
      const locationResult = await supabase.from('system_locations').upsert(
        pendingLocations.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          address: item.address,
          is_active: item.isActive,
          updated_at: item.updatedAt,
        })),
      );
      if (locationResult.error) return markFailed(locationResult.error.message);
    }

    const pendingCategories = categories.filter((item) => item.syncStatus !== 'synced');
    if (pendingCategories.length) {
      const categoryResult = await supabase.from('system_categories').upsert(
        pendingCategories.map((item) => ({
          id: item.id,
          name: item.name,
          area: item.area,
          color: item.color,
          is_active: item.isActive,
          updated_at: item.updatedAt,
        })),
      );
      if (categoryResult.error) return markFailed(categoryResult.error.message);
    }

    if (settings.syncStatus !== 'synced') {
      const settingsResult = await supabase.from('portal_settings').upsert({
        id: 'global',
        organization_name: settings.organizationName,
        emergency_phone: settings.emergencyPhone,
        default_location_id: settings.defaultLocationId,
        sync_interval_minutes: settings.syncIntervalMinutes,
        automatic_sync: settings.automaticSync,
        push_notifications: settings.pushNotifications,
        offline_mode: settings.offlineMode,
        updated_at: settings.updatedAt,
      });
      if (settingsResult.error) return markFailed(settingsResult.error.message);
    }

    setUsers((current) =>
      current.map((item) =>
        item.id.startsWith('local-user-')
          ? item
          : { ...item, syncStatus: 'synced', syncError: undefined },
      ),
    );
    setLocations((current) =>
      current.map((item) => ({ ...item, syncStatus: 'synced', syncError: undefined })),
    );
    setCategories((current) =>
      current.map((item) => ({ ...item, syncStatus: 'synced', syncError: undefined })),
    );
    setSettings((current) => ({ ...current, syncStatus: 'synced', syncError: undefined }));
    setSyncMessage(
      users.some((user) => user.id.startsWith('local-user-') && user.syncStatus !== 'synced')
        ? 'Opsætningen er synkroniseret. Nye loginbrugere mangler stadig en invitation.'
        : 'Systemopsætningen er synkroniseret.',
    );
  }

  function markFailed(message: string) {
    setUsers((current) =>
      current.map((item) =>
        item.syncStatus !== 'synced' ? { ...item, syncStatus: 'failed', syncError: message } : item,
      ),
    );
    setLocations((current) =>
      current.map((item) =>
        item.syncStatus !== 'synced' ? { ...item, syncStatus: 'failed', syncError: message } : item,
      ),
    );
    setCategories((current) =>
      current.map((item) =>
        item.syncStatus !== 'synced' ? { ...item, syncStatus: 'failed', syncError: message } : item,
      ),
    );
    setSettings((current) =>
      current.syncStatus !== 'synced'
        ? { ...current, syncStatus: 'failed', syncError: message }
        : current,
    );
    setSyncMessage(`Synkronisering fejlede: ${message}`);
  }

  return {
    users,
    locations,
    categories,
    settings,
    pendingCount,
    syncMessage,
    saveUser,
    toggleUserActive,
    addLocation,
    addCategory,
    toggleLocation,
    toggleCategory,
    updateSettings,
    syncPending,
  };
}
