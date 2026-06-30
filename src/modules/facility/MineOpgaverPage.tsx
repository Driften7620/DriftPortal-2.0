import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useWorkOrders } from './useWorkOrders';
import { WorkOrderCard } from './WorkOrderCard';
import { WorkOrderDetail } from './WorkOrderDetail';

type TaskView = 'active' | 'completed' | 'all';

export function MineOpgaverPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    workOrders,
    pendingCount,
    syncMessage,
    updateStatus,
    toggleChecklistItem,
    addChecklistItem,
    addComment,
    addMaterial,
    syncPending,
  } = useWorkOrders();
  const [view, setView] = useState<TaskView>('active');
  const assignee = user?.fullName?.split(' ')[0] ?? 'Stefan';
  const mine = useMemo(
    () =>
      workOrders.filter(
        (workOrder) =>
          workOrder.assignedTo.toLowerCase() === assignee.toLowerCase() &&
          (view === 'all' ||
            (view === 'completed'
              ? workOrder.status === 'completed'
              : workOrder.status !== 'completed')),
      ),
    [assignee, view, workOrders],
  );
  const [selectedId, setSelectedId] = useState('');
  const selected =
    mine.find((workOrder) => workOrder.id === selectedId) ??
    mine.find((workOrder) => workOrder.status === 'in_progress') ??
    mine[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Tilbage til oversigt
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ color: '#60a5fa', fontWeight: 900 }}>
            Mine Opgaver
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            {assignee} · dagens tildelte arbejde
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={pendingCount ? <CloudOffIcon /> : <CloudDoneIcon />}
          onClick={() => void syncPending()}
        >
          {pendingCount ? `Synk ${pendingCount}` : 'Synket'}
        </Button>
      </Stack>

      <ToggleButtonGroup
        exclusive
        value={view}
        onChange={(_, next: TaskView | null) => next && setView(next)}
        fullWidth
        size="small"
      >
        <ToggleButton value="active">Aktive</ToggleButton>
        <ToggleButton value="completed">Færdige</ToggleButton>
        <ToggleButton value="all">Alle</ToggleButton>
      </ToggleButtonGroup>

      {syncMessage && (
        <Alert severity={pendingCount ? 'warning' : 'success'} icon={<SyncIcon />}>
          {syncMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={1}>
            {mine.map((workOrder) => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                active={workOrder.id === selected?.id}
                onClick={() => setSelectedId(workOrder.id)}
              />
            ))}
            {mine.length === 0 && (
              <Card sx={{ p: 4 }}>
                <Stack alignItems="center" spacing={1}>
                  <AssignmentTurnedInIcon sx={{ color: '#34d399', fontSize: 48 }} />
                  <Typography sx={{ fontWeight: 900 }}>Ingen opgaver i denne visning</Typography>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {selected && (
            <Card sx={{ p: { xs: 2, md: 2.5 } }}>
              <WorkOrderDetail
                workOrder={selected}
                onStatusChange={(status) => updateStatus(selected.id, status)}
                onToggleChecklist={(checklistId) =>
                  toggleChecklistItem(selected.id, checklistId)
                }
                onAddChecklist={(title) => addChecklistItem(selected.id, title)}
                onAddComment={(text) => addComment(selected.id, text)}
                onAddMaterial={(material) => addMaterial(selected.id, material)}
              />
            </Card>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
