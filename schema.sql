import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, CardActionArea, Chip, LinearProgress, Stack, Typography } from '@mui/material';

import type { WorkOrder } from './types';
import { priorityColor, priorityText, statusColor, statusText } from './workOrderPresentation';

export function WorkOrderCard({
  workOrder,
  active,
  onClick,
}: {
  workOrder: WorkOrder;
  active?: boolean;
  onClick: () => void;
}) {
  const completed = workOrder.checklist.filter((item) => item.done).length;
  const progress = workOrder.checklist.length
    ? Math.round((completed / workOrder.checklist.length) * 100)
    : workOrder.status === 'completed'
      ? 100
      : 0;

  return (
    <CardActionArea onClick={onClick} sx={{ borderRadius: 2 }}>
      <Stack
        spacing={1.25}
        sx={{
          p: 1.75,
          borderRadius: 2,
          bgcolor: active ? 'rgba(251, 146, 60, 0.12)' : 'rgba(15, 23, 42, 0.7)',
          border: `1px solid ${active ? '#fb923c' : 'rgba(148, 163, 184, 0.18)'}`,
          borderLeft: `4px solid ${priorityColor(workOrder.priority)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#fff', fontWeight: 900 }}>{workOrder.title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {workOrder.id}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={priorityText(workOrder.priority)}
            sx={{ color: priorityColor(workOrder.priority), fontWeight: 900 }}
          />
        </Stack>

        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {workOrder.location}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ color: dueColor(workOrder), fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: dueColor(workOrder), fontWeight: 800 }}>
              {formatDue(workOrder.dueAt)}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={statusText(workOrder.status)} color={statusColor(workOrder.status)} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {workOrder.assignedTo}
          </Typography>
          {workOrder.status === 'completed' && (
            <CheckCircleIcon sx={{ ml: 'auto', color: '#34d399', fontSize: 20 }} />
          )}
        </Stack>

        {workOrder.checklist.length > 0 && (
          <Stack spacing={0.5}>
            <LinearProgress variant="determinate" value={progress} color={progress === 100 ? 'success' : 'primary'} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {completed}/{workOrder.checklist.length} punkter
            </Typography>
          </Stack>
        )}
      </Stack>
    </CardActionArea>
  );
}

function dueColor(workOrder: WorkOrder) {
  if (workOrder.status === 'completed') return '#34d399';
  return new Date(workOrder.dueAt).getTime() < Date.now() ? '#ff6b6b' : '#94a3b8';
}

function formatDue(value: string) {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
