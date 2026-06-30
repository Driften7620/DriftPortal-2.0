import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { facilityAssignees, facilityCategories, facilityLocations } from './mockData';
import type { NewWorkOrderInput, WorkOrderPriority } from './types';
import { useWorkOrders } from './useWorkOrders';
import { WorkOrderCard } from './WorkOrderCard';
import { WorkOrderDetail } from './WorkOrderDetail';

const allStatuses = 'Alle statusser';

export function FacilityServicePage() {
  const navigate = useNavigate();
  const {
    workOrders,
    pendingCount,
    syncMessage,
    addWorkOrder,
    updateStatus,
    toggleChecklistItem,
    addChecklistItem,
    addComment,
    addMaterial,
    syncPending,
  } = useWorkOrders();
  const [selectedId, setSelectedId] = useState(workOrders[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(allStatuses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<NewWorkOrderInput>(() => emptyDraft());

  const filtered = useMemo(
    () =>
      workOrders.filter((workOrder) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [workOrder.title, workOrder.id, workOrder.location, workOrder.assignedTo]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesStatus =
          statusFilter === allStatuses || workOrder.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter, workOrders],
  );
  const selected = workOrders.find((workOrder) => workOrder.id === selectedId) ?? filtered[0];
  const summary = {
    open: workOrders.filter((item) => item.status !== 'completed').length,
    critical: workOrders.filter(
      (item) => item.priority === 'critical' && item.status !== 'completed',
    ).length,
    active: workOrders.filter((item) => item.status === 'in_progress').length,
    completed: workOrders.filter((item) => item.status === 'completed').length,
  };

  function createWorkOrder() {
    if (!draft.title.trim() || !draft.assignedTo || !draft.dueAt) return;
    const created = addWorkOrder({
      ...draft,
      dueAt: new Date(draft.dueAt).toISOString(),
    });
    setSelectedId(created.id);
    setDraft(emptyDraft());
    setDialogOpen(false);
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Tilbage til oversigt
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ color: '#fb923c', fontWeight: 900 }}>
            Facility Service
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            Opret, fordel og følg vedligeholdelsesopgaver.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={pendingCount ? <CloudOffIcon /> : <CloudDoneIcon />}
            onClick={() => void syncPending()}
          >
            {pendingCount ? `Synk ${pendingCount}` : 'Synket'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Ny opgave
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {[
          { label: 'Åbne', value: summary.open, color: '#fb923c' },
          { label: 'Kritiske', value: summary.critical, color: '#ff6b6b' },
          { label: 'I gang', value: summary.active, color: '#00e5ff' },
          { label: 'Færdige', value: summary.completed, color: '#34d399' },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderLeft: `4px solid ${item.color}` }}>
              <Typography sx={{ color: item.color, fontSize: 32, fontWeight: 900 }}>
                {item.value}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>{item.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {syncMessage && (
        <Alert severity={pendingCount ? 'warning' : 'success'} icon={<SyncIcon />}>
          {syncMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Søg opgave"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value={allStatuses}>{allStatuses}</MenuItem>
                <MenuItem value="new">Ny</MenuItem>
                <MenuItem value="assigned">Tildelt</MenuItem>
                <MenuItem value="in_progress">I gang</MenuItem>
                <MenuItem value="paused">Pauset</MenuItem>
                <MenuItem value="completed">Færdig</MenuItem>
              </TextField>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                {filtered.length} opgave{filtered.length === 1 ? '' : 'r'}
              </Typography>
              <Stack spacing={1}>
                {filtered.map((workOrder) => (
                  <WorkOrderCard
                    key={workOrder.id}
                    workOrder={workOrder}
                    active={workOrder.id === selected?.id}
                    onClick={() => setSelectedId(workOrder.id)}
                  />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: { xs: 2, md: 2.5 } }}>
            {selected ? (
              <WorkOrderDetail
                workOrder={selected}
                allowChecklistCreation
                onStatusChange={(status) => updateStatus(selected.id, status)}
                onToggleChecklist={(checklistId) =>
                  toggleChecklistItem(selected.id, checklistId)
                }
                onAddChecklist={(title) => addChecklistItem(selected.id, title)}
                onAddComment={(text) => addComment(selected.id, text)}
                onAddMaterial={(material) => addMaterial(selected.id, material)}
              />
            ) : (
              <Stack alignItems="center" spacing={1} sx={{ py: 8 }}>
                <AssignmentIcon sx={{ color: '#94a3b8', fontSize: 48 }} />
                <Typography sx={{ color: 'text.secondary' }}>Ingen opgaver matcher filteret.</Typography>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ny Facility-opgave</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Titel"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              autoFocus
            />
            <TextField
              label="Beskrivelse"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              multiline
              minRows={3}
            />
            <TextField
              select
              label="Lokation"
              value={draft.location}
              onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
            >
              {facilityLocations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Kategori"
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, category: event.target.value }))
                  }
                >
                  {facilityCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Prioritet"
                  value={draft.priority}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      priority: event.target.value as WorkOrderPriority,
                    }))
                  }
                >
                  <MenuItem value="low">Lav</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">Høj</MenuItem>
                  <MenuItem value="critical">Kritisk</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              select
              label="Tildel til"
              value={draft.assignedTo}
              onChange={(event) =>
                setDraft((current) => ({ ...current, assignedTo: event.target.value }))
              }
            >
              {facilityAssignees.map((assignee) => (
                <MenuItem key={assignee} value={assignee}>
                  {assignee}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Frist"
              type="datetime-local"
              value={draft.dueAt}
              onChange={(event) => setDraft((current) => ({ ...current, dueAt: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuller</Button>
          <Button variant="contained" onClick={createWorkOrder}>
            Opret opgave
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function emptyDraft(): NewWorkOrderInput {
  const due = new Date(Date.now() + 4 * 60 * 60 * 1000);
  due.setMinutes(0, 0, 0);
  return {
    title: '',
    description: '',
    location: facilityLocations[0],
    category: facilityCategories[0],
    priority: 'normal',
    assignedTo: facilityAssignees[0],
    dueAt: toLocalDateTime(due),
  };
}

function toLocalDateTime(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
