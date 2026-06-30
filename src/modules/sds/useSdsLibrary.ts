import { useEffect, useMemo, useState } from 'react';

import { sdsDocuments } from './mockData';
import type { SdsPreferences } from './types';

const storageKey = 'driftportal.sds.preferences.v1';

function loadPreferences(): SdsPreferences {
  try {
    const value = localStorage.getItem(storageKey);
    if (value) return JSON.parse(value) as SdsPreferences;
  } catch {
    // The library still works when private browsing blocks local storage.
  }
  return { favoriteIds: [], recentIds: [] };
}

export function useSdsLibrary() {
  const [preferences, setPreferences] = useState<SdsPreferences>(loadPreferences);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences]);

  const favorites = useMemo(
    () => sdsDocuments.filter((document) => preferences.favoriteIds.includes(document.id)),
    [preferences.favoriteIds],
  );
  const recent = useMemo(
    () =>
      preferences.recentIds
        .map((id) => sdsDocuments.find((document) => document.id === id))
        .filter((document) => document !== undefined),
    [preferences.recentIds],
  );

  function toggleFavorite(id: string) {
    setPreferences((current) => ({
      ...current,
      favoriteIds: current.favoriteIds.includes(id)
        ? current.favoriteIds.filter((favoriteId) => favoriteId !== id)
        : [id, ...current.favoriteIds],
    }));
  }

  function markViewed(id: string) {
    setPreferences((current) => ({
      ...current,
      recentIds: [id, ...current.recentIds.filter((recentId) => recentId !== id)].slice(0, 6),
    }));
  }

  return {
    documents: sdsDocuments,
    favoriteIds: preferences.favoriteIds,
    favorites,
    recent,
    toggleFavorite,
    markViewed,
  };
}
