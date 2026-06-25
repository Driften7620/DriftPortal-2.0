import { useMemo, useState } from 'react';
import type { PaletteMode } from '@mui/material';

const storageKey = 'driftportal-color-mode';

export function useColorMode() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  return useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((current) => {
          const next = current === 'dark' ? 'light' : 'dark';
          localStorage.setItem(storageKey, next);
          return next;
        });
      },
    }),
    [mode],
  );
}
