import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { StructureSettings } from './StructureSettings';
import { SystemSettings } from './SystemSettings';
import { UserManagement } from './UserManagement';
import { roleLabels } from './mockData';
import { useAdministration } from './useAdministration';

export function AdministrationPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const admin = useAdministration();
  const activeUsers = admin.users.filter((user) => user.isActive).length;
  const activeLocations = admin.locations.filter((location) => location.isActive).length;
  const activeCategories = admin.categories.filter((category) => category.isActive).length;

  return (
    <Stack spacing={3}>
      <Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Tilbage til oversigt
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h3"
            sx={{ color: '#94a3b8', fontWeight: 900, fontSize: { xs: 36, sm: 48 } }}
          >
            Administration
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            Brugere, adgang, lokationer og systemopsætning.
          </Typography>
        </Box>
        <Button
          variant={admin.pendingCount ? 'contained' : 'outlined'}
          startIcon={admin.pendingCount ? <CloudOffIcon /> : <CloudDoneIcon />}
          onClick={() => void admin.syncPending()}
        >
          {admin.pendingCount ? `Synk ${admin.pendingCount}` : 'Synkroniseret'}
        </Button>
      </Stack>

      {admin.syncMessage && (
        <Alert severity={admin.pendingCount ? 'warning' : 'success'} icon={<SyncIcon />}>
          {admin.syncMessage}
        </Alert>
      )}

      <Card sx={{ overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_event, value: number) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Administrationsområder"
          sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.16)' }}
        >
          <Tab label="Oversigt" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Brugere" icon={<ManageAccountsIcon />} iconPosition="start" />
          <Tab label="Struktur" icon={<LocationOnIcon />} iconPosition="start" />
          <Tab label="System" icon={<CategoryIcon />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && (
            <AdminOverview
              users={activeUsers}
              locations={activeLocations}
              categories={activeCategories}
              pending={admin.pendingCount}
              automaticSync={admin.settings.automaticSync}
              offlineMode={admin.settings.offlineMode}
              onOpenTab={setTab}
              roles={admin.users.map((user) => roleLabels[user.role])}
            />
          )}
          {tab === 1 && (
            <UserManagement
              users={admin.users}
              currentUserId={admin.currentUserId}
              onSave={admin.saveUser}
              onToggleActive={admin.toggleUserActive}
              onDelete={admin.deleteUser}
            />
          )}
          {tab === 2 && (
            <StructureSettings
              locations={admin.locations}
              categories={admin.categories}
              onAddLocation={admin.addLocation}
              onAddCategory={admin.addCategory}
              onUpdateCategory={admin.updateCategory}
              onToggleLocation={admin.toggleLocation}
              onDeleteLocation={admin.deleteLocation}
              onToggleCategory={admin.toggleCategory}
              onDeleteCategory={admin.deleteCategory}
            />
          )}
          {tab === 3 && (
            <SystemSettings
              settings={admin.settings}
              locations={admin.locations}
              onSave={admin.updateSettings}
            />
          )}
        </Box>
      </Card>
    </Stack>
  );
}

function AdminOverview({
  users,
  locations,
  categories,
  pending,
  automaticSync,
  offlineMode,
  onOpenTab,
  roles,
}: {
  users: number;
  locations: number;
  categories: number;
  pending: number;
  automaticSync: boolean;
  offlineMode: boolean;
  onOpenTab: (value: number) => void;
  roles: string[];
}) {
  const uniqueRoles = new Set(roles).size;
  const metrics = [
    { label: 'Aktive brugere', value: users, color: '#00e5ff', tab: 1 },
    { label: 'Roller i brug', value: uniqueRoles, color: '#a78bfa', tab: 1 },
    { label: 'Lokationer', value: locations, color: '#34d399', tab: 2 },
    { label: 'Kategorier', value: categories, color: '#fbbf24', tab: 2 },
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={1.5}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 6, md: 3 }}>
            <Card
              component="button"
              onClick={() => onOpenTab(metric.tab)}
              sx={{
                width: '100%',
                minHeight: 120,
                p: 2,
                textAlign: 'left',
                color: 'inherit',
                cursor: 'pointer',
                border: 0,
                borderLeft: `4px solid ${metric.color}`,
              }}
            >
              <Typography sx={{ color: metric.color, fontSize: 34, fontWeight: 900 }}>
                {metric.value}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                {metric.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
              Systemstatus
            </Typography>
            <Stack spacing={1.5}>
              <StatusLine label="Offline-funktioner" enabled={offlineMode} />
              <StatusLine label="Automatisk synk" enabled={automaticSync} />
              <StatusLine label="Push-notifikationer" enabled={false} planned />
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 800 }}>Afventende ændringer</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{pending}</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pending ? Math.min(100, pending * 12) : 100}
                  color={pending ? 'warning' : 'success'}
                />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
              Hurtig opsætning
            </Typography>
            <Stack spacing={1}>
              <Button variant="outlined" onClick={() => onOpenTab(1)}>
                Administrer brugere og adgang
              </Button>
              <Button variant="outlined" onClick={() => onOpenTab(2)}>
                Opret lokation eller kategori
              </Button>
              <Button variant="outlined" onClick={() => onOpenTab(3)}>
                Rediger systemindstillinger
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function StatusLine({
  label,
  enabled,
  planned = false,
}: {
  label: string;
  enabled: boolean;
  planned?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
      <Chip
        size="small"
        color={planned ? 'default' : enabled ? 'success' : 'warning'}
        label={planned ? 'Planlagt' : enabled ? 'Aktiv' : 'Deaktiveret'}
      />
    </Stack>
  );
}
