import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { inventoryCategories, inventoryLocations } from './mockData';
import type { InventoryItem, NewInventoryItem } from './types';
import { useInventory } from './useInventory';

const allValues = 'Alle';

export function LagerstyringPage() {
  const navigate = useNavigate();
  const { items, movements, pendingCount, syncMessage, addItem, adjustQuantity, syncPending } =
    useInventory();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(allValues);
  const [category, setCategory] = useState(allValues);
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<NewInventoryItem>(() => emptyDraft());

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            [item.name, item.id, item.location, item.category]
              .join(' ')
              .toLowerCase()
              .includes(query)) &&
          (location === allValues || item.location === location) &&
          (category === allValues || item.category === category)
        );
      }),
    [category, items, location, search],
  );
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0];
  const selectedMovements = selected
    ? movements.filter((movement) => movement.itemId === selected.id).slice(0, 8)
    : [];
  const lowCount = items.filter(
    (item) => item.quantity > 0 && item.quantity <= item.minQuantity,
  ).length;
  const emptyCount = items.filter((item) => item.quantity === 0).length;

  function changeQuantity(delta: number) {
    if (!selected) return;
    adjustQuantity(selected.id, delta, reason);
    setReason('');
  }

  function createItem() {
    if (!draft.name.trim() || draft.maxQuantity <= 0) return;
    const created = addItem(draft);
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
          <Typography variant="h3" sx={{ color: '#ffd166', fontWeight: 900 }}>
            Lagerstyring
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            Beholdning, forbrug og genbestilling på alle lokationer.
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
          <Button variant="outlined" startIcon={<QrCodeScannerIcon />}>
            Scan QR
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Ny vare
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {[
          { label: 'Varer', value: items.length, color: '#ffd166' },
          { label: 'Lav beholdning', value: lowCount, color: '#fb923c' },
          { label: 'Udsolgt', value: emptyCount, color: '#ff6b6b' },
          { label: 'Afventer synk', value: pendingCount, color: '#60a5fa' },
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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Søg vare"
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
          label="Lokation"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value={allValues}>{allValues}</MenuItem>
          {inventoryLocations.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Kategori"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value={allValues}>{allValues}</MenuItem>
          {inventoryCategories.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={1.5}>
            {filtered.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6 }}>
                <InventoryCard
                  item={item}
                  active={item.id === selected?.id}
                  onClick={() => setSelectedId(item.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {selected && (
            <Card sx={{ p: 2.25 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {selected.name}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {selected.location} · {selected.category}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography sx={{ color: stockColor(selected), fontSize: 48, fontWeight: 900 }}>
                    {selected.quantity}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    {selected.unit}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={stockPercent(selected)}
                  color={selected.quantity <= selected.minQuantity ? 'warning' : 'primary'}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Min. {selected.minQuantity} · Maks. {selected.maxQuantity}
                </Typography>

                <TextField
                  size="small"
                  label="Årsag eller jobnummer"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={() => changeQuantity(-1)}
                  >
                    Forbrug
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => changeQuantity(1)}
                  >
                    Tilføj
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <HistoryIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Historik
                  </Typography>
                </Stack>
                {selectedMovements.length === 0 && (
                  <Typography sx={{ color: 'text.secondary' }}>Ingen bevægelser endnu.</Typography>
                )}
                {selectedMovements.map((movement) => (
                  <Stack
                    key={movement.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(15, 23, 42, 0.7)' }}
                  >
                    <Chip
                      size="small"
                      label={movement.delta > 0 ? `+${movement.delta}` : movement.delta}
                      color={movement.delta > 0 ? 'success' : 'error'}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{movement.reason}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {movement.performedBy} · {formatDateTime(movement.createdAt)}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                      {movement.quantityAfter}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ny lagervare</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Varenavn"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              autoFocus
            />
            <TextField
              select
              label="Kategori"
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
            >
              {inventoryCategories.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Lokation"
              value={draft.location}
              onChange={(event) =>
                setDraft((current) => ({ ...current, location: event.target.value }))
              }
            >
              {inventoryLocations.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              {(['quantity', 'minQuantity', 'maxQuantity'] as const).map((field) => (
                <Grid key={field} size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={
                      field === 'quantity' ? 'Antal' : field === 'minQuantity' ? 'Min.' : 'Maks.'
                    }
                    value={draft[field]}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field]: Number(event.target.value) }))
                    }
                  />
                </Grid>
              ))}
            </Grid>
            <TextField
              label="Enhed"
              value={draft.unit}
              onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuller</Button>
          <Button variant="contained" onClick={createItem}>
            Opret vare
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function InventoryCard({
  item,
  active,
  onClick,
}: {
  item: InventoryItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <CardActionArea onClick={onClick} sx={{ borderRadius: 2 }}>
      <Stack
        spacing={1.25}
        sx={{
          p: 1.75,
          minHeight: 190,
          borderRadius: 2,
          border: `1px solid ${active ? '#ffd166' : 'rgba(148, 163, 184, 0.18)'}`,
          borderLeft: `4px solid ${stockColor(item)}`,
          bgcolor: active ? 'rgba(255, 209, 102, 0.1)' : 'rgba(15, 23, 42, 0.7)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <InventoryIcon sx={{ color: '#ffd166' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900 }}>{item.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {item.location}
            </Typography>
          </Box>
          <Tooltip title="QR-kode">
            <IconButton size="small" aria-label={`QR-kode for ${item.name}`}>
              <QrCodeScannerIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography sx={{ color: stockColor(item), fontSize: 32, fontWeight: 900 }}>
            {item.quantity}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>{item.unit}</Typography>
          <Chip size="small" label={stockText(item)} sx={{ ml: 'auto' }} />
        </Stack>
        <LinearProgress variant="determinate" value={stockPercent(item)} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Min. {item.minQuantity} · Maks. {item.maxQuantity}
        </Typography>
      </Stack>
    </CardActionArea>
  );
}

function stockText(item: InventoryItem) {
  if (item.quantity === 0) return 'Udsolgt';
  if (item.quantity <= item.minQuantity) return 'Bestil';
  return 'OK';
}

function stockColor(item: InventoryItem) {
  if (item.quantity === 0) return '#ff6b6b';
  if (item.quantity <= item.minQuantity) return '#fb923c';
  return '#34d399';
}

function stockPercent(item: InventoryItem) {
  if (item.maxQuantity <= 0) return 0;
  return Math.min(100, Math.round((item.quantity / item.maxQuantity) * 100));
}

function emptyDraft(): NewInventoryItem {
  return {
    name: '',
    category: inventoryCategories[0],
    location: inventoryLocations[0],
    quantity: 0,
    minQuantity: 1,
    maxQuantity: 10,
    unit: 'stk',
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
