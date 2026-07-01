import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { getPasswordUpdateRedirectUrl } from '../../services/authRedirect';
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
  AdminSyncStatus,
  CategoryDraft,
  LocationDraft,
  ManagedUser,
  PortalSettings,
  SystemCategory,
  SystemLocation,
  UserDraft,
} from './types';

export function useAdministration() {
  const { isDemoMode, signOut, user: currentUser } = useAuth();
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
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => saveAdminUsers(users), [users]);
  useEffect(() => saveLocations(locations), [locations]);
  useEffect(() => saveCategories(categories), [categories]);
  useEffect(() => savePortalSettings(settings), [settings]);

  useEffect(() => {
    if (isDemoMode || !supabase || !currentUser?.id) return;

    let isMounted = true;

    async function loadRemoteAdministration() {
      setIsLoadingRemote(true);
      const [userResult, locationResult, categoryResult, settingsResult] = await Promise.all([
        supabase!
          .from('profiles')
          .select('id,email,full_name,role,module_access,is_active,updated_at')
          .order('full_name'),
        supabase!
          .from('system_locations')
          .select('id,name,code,address,is_active,updated_at')
          .order('name'),
        supabase!
          .from('system_categories')
          .select('id,name,area,color,is_active,updated_at')
          .order('name'),
        supabase!.from('portal_settings').select('*').eq('id', 'global').maybeSingle(),
      ]);

      if (!isMounted) return;
      const loadError =
        userResult.error ?? locationResult.error ?? categoryResult.error ?? settingsResult.error;

      if (loadError) {
        setSyncMessage(`Systemopsætningen kunne ikke hentes fra Supabase: ${loadError.message}`);
        setIsLoadingRemote(false);
        return;
      }

      const remoteUsers: ManagedUser[] = (userResult.data ?? []).map((profile) => ({
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email ?? '',
        phone: '',
        jobTitle: 'Medarbejder',
        role: profile.role as ManagedUser['role'],
        moduleAccess: profile.module_access ?? [],
        isActive: profile.is_active ?? true,
        updatedAt: profile.updated_at,
        syncStatus: 'synced',
      }));
      const remoteLocations: SystemLocation[] = (locationResult.data ?? []).map((location) => ({
        id: location.id,
        name: location.name,
        code: location.code,
        address: location.address,
        isActive: location.is_active,
        updatedAt: location.updated_at,
        syncStatus: 'synced',
      }));
      const remoteCategories: SystemCategory[] = (categoryResult.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        area: category.area,
        color: category.color,
        isActive: category.is_active,
        updatedAt: category.updated_at,
        syncStatus: 'synced',
      }));

      setUsers((current) => mergeRemoteWithPending(current, remoteUsers));
      setLocations((current) => mergeRemoteWithPending(current, remoteLocations));
      setCategories((current) => mergeRemoteWithPending(current, remoteCategories));

      if (settingsResult.data) {
        const remoteSettings = settingsResult.data;
        setSettings((current) =>
          current.syncStatus !== 'synced'
            ? current
            : {
                organizationName: remoteSettings.organization_name,
                emergencyPhone: remoteSettings.emergency_phone,
                defaultLocationId: remoteSettings.default_location_id ?? '',
                syncIntervalMinutes: remoteSettings.sync_interval_minutes,
                automaticSync: remoteSettings.automatic_sync,
                pushNotifications: remoteSettings.push_notifications,
                offlineMode: remoteSettings.offline_mode,
                updatedAt: remoteSettings.updated_at,
                syncStatus: 'synced',
              },
        );
      }

      setLastSyncedAt(new Date().toISOString());
      setIsLoadingRemote(false);
      if (reloadVersion > 0) {
        setSyncMessage('Systemopsætningen er opdateret fra Supabase.');
      }
    }

    void loadRemoteAdministration();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, isDemoMode, reloadVersion]);

  const pendingCount = useMemo(
    () =>
      users.filter((item) => item.syncStatus !== 'synced').length +
      locations.filter((item) => item.syncStatus !== 'synced').length +
      categories.filter((item) => item.syncStatus !== 'synced').length +
      (settings.syncStatus === 'synced' ? 0 : 1),
    [categories, locations, settings.syncStatus, users],
  );

  function isLastActiveSystemAdmin(user: ManagedUser) {
    return (
      user.role === 'system_admin' &&
      user.isActive &&
      users.filter((item) => item.role === 'system_admin' && item.isActive).length <= 1
    );
  }

  function saveUser(draft: UserDraft) {
    const existingUser = draft.id ? users.find((user) => user.id === draft.id) : undefined;
    if (
      existingUser &&
      isLastActiveSystemAdmin(existingUser) &&
      (draft.role !== 'system_admin' || !draft.isActive)
    ) {
      setSyncMessage(
        'Opret eller aktivér en anden systemadministrator, før denne rolle kan ændres.',
      );
      return false;
    }

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
    return true;
  }

  function toggleUserActive(id: string) {
    const target = users.find((user) => user.id === id);
    if (!target) return;
    if (target.isActive && isLastActiveSystemAdmin(target)) {
      setSyncMessage(
        'Opret eller aktivér en anden systemadministrator, før denne bruger kan deaktiveres.',
      );
      return;
    }

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

  async function deleteUser(id: string) {
    const target = users.find((user) => user.id === id);
    if (!target) return false;
    if (isLastActiveSystemAdmin(target)) {
      setSyncMessage(
        'Den sidste aktive systemadministrator kan ikke slettes. Opret eller aktivér en afløser først.',
      );
      return false;
    }
    if (id.startsWith('local-user-') || id.startsWith('demo-')) {
      setUsers((current) => current.filter((user) => user.id !== id));
      setSyncMessage('Den lokale bruger er slettet fra denne enhed.');
      if (currentUser?.id === id) await signOut();
      return true;
    }
    if (isDemoMode || !supabase) {
      setSyncMessage('En synkroniseret bruger kan kun slettes med rigtig Supabase-login.');
      return false;
    }

    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId: id },
    });
    if (error) {
      let message = error.message;
      const response = (error as { context?: Response }).context;
      if (response) {
        try {
          const body = (await response.json()) as { error?: string };
          message = body.error ?? message;
        } catch {
          // Keep the original function error when the response is not JSON.
        }
      }
      setSyncMessage(`Brugeren kunne ikke slettes: ${message}`);
      return false;
    }

    setUsers((current) => current.filter((user) => user.id !== id));
    setSyncMessage(`${target.fullName} er slettet fra DriftPortal og Supabase-login.`);
    if (currentUser?.id === id) await signOut();
    return true;
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

  function updateCategory(id: string, draft: CategoryDraft) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? {
              ...category,
              name: draft.name.trim(),
              area: draft.area,
              color: draft.color,
              updatedAt: new Date().toISOString(),
              syncStatus: 'pending',
              syncError: undefined,
            }
          : category,
      ),
    );
    setSyncMessage('Kategorien er opdateret offline.');
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

  async function deleteLocation(id: string) {
    const target = locations.find((location) => location.id === id);
    if (!target) return false;
    if (target.syncStatus !== 'synced') {
      setLocations((current) => current.filter((location) => location.id !== id));
      setSyncMessage('Den lokale lokation er slettet.');
      return true;
    }
    if (isDemoMode || !supabase) {
      setSyncMessage('En synkroniseret lokation kan kun slettes med rigtig Supabase-login.');
      return false;
    }

    const { error } = await supabase.from('system_locations').delete().eq('id', id);
    if (error) {
      setSyncMessage(`Lokationen kunne ikke slettes: ${error.message}`);
      return false;
    }

    setLocations((current) => current.filter((location) => location.id !== id));
    if (settings.defaultLocationId === id) {
      setSettings((current) => ({
        ...current,
        defaultLocationId: '',
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      }));
    }
    setSyncMessage(`${target.name} er slettet.`);
    return true;
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

  async function deleteCategory(id: string) {
    const target = categories.find((category) => category.id === id);
    if (!target) return false;
    if (/^category-\d+$/.test(id)) {
      setCategories((current) => current.filter((category) => category.id !== id));
      setSyncMessage('Den lokale kategori er slettet.');
      return true;
    }
    if (isDemoMode || !supabase) {
      setSyncMessage('En synkroniseret kategori kan kun slettes med rigtig Supabase-login.');
      return false;
    }

    const { error } = await supabase.from('system_categories').delete().eq('id', id);
    if (error) {
      setSyncMessage(`Kategorien kunne ikke slettes: ${error.message}`);
      return false;
    }

    setCategories((current) => current.filter((category) => category.id !== id));
    setSyncMessage(`${target.name} er slettet.`);
    return true;
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
    if (isSyncing) return;
    if (!pendingCount) {
      if (!isDemoMode && supabase) {
        setSyncMessage('Henter den nyeste systemopsætning fra Supabase...');
        setReloadVersion((current) => current + 1);
      } else {
        setSyncMessage('Systemopsætningen er synkroniseret.');
      }
      return;
    }
    if (isDemoMode || !supabase) {
      setSyncMessage('Opsætningen er gemt offline og sendes, når rigtig login er konfigureret.');
      return;
    }

    setIsSyncing(true);
    try {
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

      const localUsers = users.filter(
        (user) => user.syncStatus !== 'synced' && user.id.startsWith('local-user-'),
      );
      const invitedUsers = new Map<string, string>();
      for (const user of localUsers) {
        const { data, error } = await supabase.functions.invoke('invite-user', {
          body: {
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            moduleAccess: user.moduleAccess,
            redirectTo: getPasswordUpdateRedirectUrl(),
          },
        });
        if (error) {
          const message = await readFunctionError(
            error,
            `Invitationen til ${user.email} kunne ikke gennemføres.`,
          );
          setUsers((current) =>
            current.map((item) =>
              item.id === user.id ? { ...item, syncStatus: 'failed', syncError: message } : item,
            ),
          );
          setSyncMessage(`Synkronisering af ${user.email} fejlede: ${message}`);
          return;
        }
        const invitedId = (data as { id?: string } | null)?.id;
        if (!invitedId) {
          const message = `Invitationen til ${user.email} returnerede intet bruger-id.`;
          setUsers((current) =>
            current.map((item) =>
              item.id === user.id ? { ...item, syncStatus: 'failed', syncError: message } : item,
            ),
          );
          setSyncMessage(message);
          return;
        }
        invitedUsers.set(user.id, invitedId);
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
          default_location_id: settings.defaultLocationId || null,
          sync_interval_minutes: settings.syncIntervalMinutes,
          automatic_sync: settings.automaticSync,
          push_notifications: settings.pushNotifications,
          offline_mode: settings.offlineMode,
          updated_at: settings.updatedAt,
        });
        if (settingsResult.error) return markFailed(settingsResult.error.message);
      }

      setUsers((current) =>
        current.map((item) => ({
          ...item,
          id: invitedUsers.get(item.id) ?? item.id,
          syncStatus: 'synced',
          syncError: undefined,
        })),
      );
      setLocations((current) =>
        current.map((item) => ({ ...item, syncStatus: 'synced', syncError: undefined })),
      );
      setCategories((current) =>
        current.map((item) => ({ ...item, syncStatus: 'synced', syncError: undefined })),
      );
      setSettings((current) => ({ ...current, syncStatus: 'synced', syncError: undefined }));
      await writeSyncActivity(currentUser?.id, {
        users: existingUsers.length + localUsers.length,
        locations: pendingLocations.length,
        categories: pendingCategories.length,
        settings: settings.syncStatus !== 'synced',
      });
      setLastSyncedAt(new Date().toISOString());
      setSyncMessage(
        localUsers.length
          ? `${localUsers.length} brugerinvitation(er) er sendt, og opsætningen er synkroniseret.`
          : 'Systemopsætningen er synkroniseret.',
      );
    } finally {
      setIsSyncing(false);
    }
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
    isLoadingRemote,
    isSyncing,
    lastSyncedAt,
    currentUserId: currentUser?.id,
    saveUser,
    toggleUserActive,
    deleteUser,
    addLocation,
    addCategory,
    updateCategory,
    toggleLocation,
    deleteLocation,
    toggleCategory,
    deleteCategory,
    updateSettings,
    syncPending,
  };
}

async function readFunctionError(error: unknown, fallback: string) {
  const functionError = error as { message?: string; context?: Response };
  const response = functionError.context;

  if (response) {
    try {
      const body = (await response.clone().json()) as { error?: string; message?: string };
      if (body.error || body.message) return body.error ?? body.message ?? fallback;
    } catch {
      try {
        const body = await response.clone().text();
        if (body.trim()) return body.trim();
      } catch {
        // Use the SDK message below when the response body cannot be read.
      }
    }
  }

  return functionError.message || fallback;
}

function mergeRemoteWithPending<T extends { id: string; syncStatus: AdminSyncStatus }>(
  current: T[],
  remote: T[],
) {
  const pending = current.filter((item) => item.syncStatus !== 'synced');
  const pendingIds = new Set(pending.map((item) => item.id));
  return [...pending, ...remote.filter((item) => !pendingIds.has(item.id))];
}

async function writeSyncActivity(
  userId: string | undefined,
  details: {
    users: number;
    locations: number;
    categories: number;
    settings: boolean;
  },
) {
  if (!supabase || !userId) return;
  await supabase.from('activity_log').insert({
    user_id: userId,
    module_id: 'administration',
    action: 'sync_system_setup',
    entity_type: 'portal_settings',
    entity_id: 'global',
    details,
  });
}
