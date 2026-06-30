import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { driftModules } from '../../data/modules';
import { getDefaultModuleAccess } from '../../features/auth/roleAccess';
import type { UserRole } from '../../types/auth';
import { roleLabels } from './mockData';
import type { ManagedUser, UserDraft } from './types';

interface UserManagementProps {
  users: ManagedUser[];
  onSave: (draft: UserDraft) => void;
  onToggleActive: (id: string) => void;
}

const roles = Object.keys(roleLabels) as UserRole[];

export function UserManagement({ users, onSave, onToggleActive }: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('Alle');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<UserDraft>(() => emptyUserDraft());

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            [user.fullName, user.email, user.jobTitle].join(' ').toLowerCase().includes(query)) &&
          (role === 'Alle' || user.role === role)
        );
      }),
    [role, search, users],
  );

  function openNew() {
    setDraft(emptyUserDraft());
    setDialogOpen(true);
  }

  function openEdit(user: ManagedUser) {
    setDraft({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? '',
      jobTitle: user.jobTitle,
      role: user.role,
      moduleAccess: user.moduleAccess,
      isActive: user.isActive,
    });
    setDialogOpen(true);
  }

  function submit() {
    if (!draft.fullName.trim() || !draft.email.trim()) return;
    onSave(draft);
    setDialogOpen(false);
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Søg bruger"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Rolle"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          sx={{ minWidth: 190 }}
        >
          <MenuItem value="Alle">Alle roller</MenuItem>
          {roles.map((value) => (
            <MenuItem key={value} value={value}>
              {roleLabels[value]}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Ny bruger
        </Button>
      </Stack>

      <Grid container spacing={1.5}>
        {filtered.map((user) => (
          <Grid key={user.id} size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 2, opacity: user.isActive ? 1 : 0.6 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar sx={{ bgcolor: user.isActive ? 'primary.main' : 'grey.700' }}>
                  {user.fullName.slice(0, 1).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>
                    {user.fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}
                  >
                    {user.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {user.jobTitle}
                  </Typography>
                </Box>
                <Tooltip title="Rediger bruger">
                  <IconButton
                    aria-label={`Rediger ${user.fullName}`}
                    onClick={() => openEdit(user)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 2 }}
              >
                <Chip size="small" color="primary" label={roleLabels[user.role]} />
                <Chip size="small" label={`${user.moduleAccess.length} moduler`} />
                {user.syncStatus !== 'synced' && (
                  <Chip size="small" color="warning" label="Afventer synk" />
                )}
                <FormControlLabel
                  sx={{ ml: { sm: 'auto' } }}
                  control={
                    <Switch
                      checked={user.isActive}
                      onChange={() => onToggleActive(user.id)}
                      inputProps={{ 'aria-label': `Aktiv bruger ${user.fullName}` }}
                    />
                  }
                  label={user.isActive ? 'Aktiv' : 'Deaktiveret'}
                />
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{draft.id ? 'Rediger bruger' : 'Opret bruger'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Navn"
                  value={draft.fullName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, fullName: event.target.value }))
                  }
                  autoFocus
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Stilling"
                  value={draft.jobTitle}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, jobTitle: event.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </Grid>
            </Grid>

            <TextField
              select
              label="Rolle"
              value={draft.role}
              onChange={(event) => {
                const nextRole = event.target.value as UserRole;
                setDraft((current) => ({
                  ...current,
                  role: nextRole,
                  moduleAccess: getDefaultModuleAccess(nextRole),
                }));
              }}
            >
              {roles.map((value) => (
                <MenuItem key={value} value={value}>
                  {roleLabels[value]}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Moduladgang</Typography>
              <FormGroup>
                <Grid container spacing={0.5}>
                  {driftModules.map((module) => (
                    <Grid key={module.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={draft.moduleAccess.includes(module.id)}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                moduleAccess: event.target.checked
                                  ? [...current.moduleAccess, module.id]
                                  : current.moduleAccess.filter((id) => id !== module.id),
                              }))
                            }
                          />
                        }
                        label={module.title}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
              }
              label="Brugeren er aktiv"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuller</Button>
          <Button variant="contained" onClick={submit}>
            Gem bruger
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function emptyUserDraft(): UserDraft {
  return {
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    role: 'operator',
    moduleAccess: getDefaultModuleAccess('operator'),
    isActive: true,
  };
}
