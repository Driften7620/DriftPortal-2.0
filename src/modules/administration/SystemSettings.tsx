import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Button,
  Card,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import type { PortalSettings, SystemLocation } from './types';

interface SystemSettingsProps {
  settings: PortalSettings;
  locations: SystemLocation[];
  onSave: (settings: PortalSettings) => void;
}

export function SystemSettings({ settings, locations, onSave }: SystemSettingsProps) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => setDraft(settings), [settings]);

  return (
    <Stack spacing={2.5}>
      <Alert severity="info">
        Ændringer gemmes først på enheden. Brug Synk-knappen øverst for at sende dem til Supabase.
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Organisation
              </Typography>
              <TextField
                label="Organisationsnavn"
                value={draft.organizationName}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, organizationName: event.target.value }))
                }
              />
              <TextField
                label="Nødtelefon"
                value={draft.emergencyPhone}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, emergencyPhone: event.target.value }))
                }
              />
              <TextField
                select
                label="Standardlokation"
                value={draft.defaultLocationId}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, defaultLocationId: event.target.value }))
                }
              >
                {locations
                  .filter((location) => location.isActive)
                  .map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Stack spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Drift og synkronisering
              </Typography>
              <TextField
                type="number"
                label="Synkinterval i minutter"
                value={draft.syncIntervalMinutes}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    syncIntervalMinutes: Math.max(1, Number(event.target.value)),
                  }))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.automaticSync}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        automaticSync: event.target.checked,
                      }))
                    }
                  />
                }
                label="Automatisk synkronisering"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.offlineMode}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, offlineMode: event.target.checked }))
                    }
                  />
                }
                label="Offline-funktioner"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.pushNotifications}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        pushNotifications: event.target.checked,
                      }))
                    }
                  />
                }
                label="Push-notifikationer"
              />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => onSave(draft)}
        sx={{ alignSelf: { sm: 'flex-end' } }}
      >
        Gem systemindstillinger
      </Button>
    </Stack>
  );
}
