import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import InventoryIcon from '@mui/icons-material/Inventory';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { WorkOrder, WorkOrderMaterial, WorkOrderStatus } from './types';
import { priorityColor, priorityText, statusColor, statusText } from './workOrderPresentation';

interface WorkOrderDetailProps {
  workOrder: WorkOrder;
  allowChecklistCreation?: boolean;
  onStatusChange: (status: WorkOrderStatus) => void;
  onToggleChecklist: (checklistId: string) => void;
  onAddChecklist: (title: string) => void;
  onAddComment: (text: string) => void;
  onAddMaterial: (material: Omit<WorkOrderMaterial, 'id'>) => void;
}

export function WorkOrderDetail({
  workOrder,
  allowChecklistCreation = false,
  onStatusChange,
  onToggleChecklist,
  onAddChecklist,
  onAddComment,
  onAddMaterial,
}: WorkOrderDetailProps) {
  const [comment, setComment] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('1');

  function submitComment() {
    onAddComment(comment);
    setComment('');
  }

  function submitChecklist() {
    onAddChecklist(checklistTitle);
    setChecklistTitle('');
  }

  function submitMaterial() {
    onAddMaterial({
      name: materialName,
      quantity: Number(materialQuantity),
      unit: 'stk',
    });
    setMaterialName('');
    setMaterialQuantity('1');
  }

  return (
    <Stack spacing={2.25}>
      <Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
          <Chip label={workOrder.id} />
          <Chip label={statusText(workOrder.status)} color={statusColor(workOrder.status)} />
          <Chip
            label={priorityText(workOrder.priority)}
            sx={{ color: priorityColor(workOrder.priority), fontWeight: 900 }}
          />
        </Stack>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>
          {workOrder.title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
          {workOrder.location} · {workOrder.category} · {workOrder.assignedTo}
        </Typography>
      </Box>

      <Typography sx={{ color: 'text.secondary' }}>{workOrder.description}</Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {workOrder.status !== 'in_progress' && workOrder.status !== 'completed' && (
          <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => onStatusChange('in_progress')}>
            Start
          </Button>
        )}
        {workOrder.status === 'in_progress' && (
          <Button variant="outlined" startIcon={<PauseIcon />} onClick={() => onStatusChange('paused')}>
            Pause
          </Button>
        )}
        {workOrder.status !== 'completed' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => onStatusChange('completed')}
          >
            Afslut
          </Button>
        )}
        <Button variant="outlined" startIcon={<AttachFileIcon />}>
          Bilag ({workOrder.attachmentCount})
        </Button>
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Checkliste
        </Typography>
        {workOrder.checklist.length === 0 && (
          <Typography sx={{ color: 'text.secondary' }}>Ingen punkter på opgaven.</Typography>
        )}
        {workOrder.checklist.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(15, 23, 42, 0.7)' }}
          >
            <Checkbox checked={item.done} onChange={() => onToggleChecklist(item.id)} />
            <Typography
              sx={{
                color: item.done ? 'text.secondary' : '#fff',
                fontWeight: 700,
                textDecoration: item.done ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </Typography>
          </Stack>
        ))}
        {allowChecklistCreation && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              size="small"
              label="Nyt punkt"
              value={checklistTitle}
              onChange={(event) => setChecklistTitle(event.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" startIcon={<AddIcon />} onClick={submitChecklist}>
              Tilføj
            </Button>
          </Stack>
        )}
      </Stack>

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <InventoryIcon color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Materialer
              </Typography>
            </Stack>
            {workOrder.materials.map((material) => (
              <Stack
                key={material.id}
                direction="row"
                justifyContent="space-between"
                sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(15, 23, 42, 0.7)' }}
              >
                <Typography sx={{ fontWeight: 700 }}>{material.name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {material.quantity} {material.unit}
                </Typography>
              </Stack>
            ))}
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Materiale"
                value={materialName}
                onChange={(event) => setMaterialName(event.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Antal"
                type="number"
                value={materialQuantity}
                onChange={(event) => setMaterialQuantity(event.target.value)}
                sx={{ width: 88 }}
              />
              <Button aria-label="Tilføj materiale" variant="outlined" onClick={submitMaterial}>
                <AddIcon />
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CommentIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Kommentarer
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Skriv kommentar"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={submitComment}>
                Send
              </Button>
            </Stack>
            {workOrder.comments.map((item) => (
              <Box key={item.id} sx={{ p: 1.25, borderRadius: 1, bgcolor: 'rgba(15, 23, 42, 0.7)' }}>
                <Typography sx={{ fontWeight: 700 }}>{item.text}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.author} · {formatDateTime(item.createdAt)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
