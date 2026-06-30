import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type {
  CategoryDraft,
  LocationDraft,
  SystemCategory,
  SystemLocation,
} from './types';

interface StructureSettingsProps {
  locations: SystemLocation[];
  categories: SystemCategory[];
  onAddLocation: (draft: LocationDraft) => void;
  onAddCategory: (draft: CategoryDraft) => void;
  onToggleLocation: (id: string) => void;
  onDeleteLocation: (id: string) => Promise<boolean>;
  onToggleCategory: (id: string) => void;
}

const categoryAreas = ['Opgaver', 'Lager', 'MålerLog', 'Rundering', 'SDS'];
const categoryColors = ['#00e5ff', '#fbbf24', '#fb923c', '#34d399', '#f472b6', '#a78bfa'];

export function StructureSettings({
  locations,
  categories,
  onAddLocation,
  onAddCategory,
  onToggleLocation,
  onDeleteLocation,
  onToggleCategory,
}: StructureSettingsProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [deleteLocationCandidate, setDeleteLocationCandidate] =
    useState<SystemLocation | null>(null);
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState<LocationDraft>({
    name: '',
    code: '',
    address: '',
  });
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>({
    name: '',
    area: categoryAreas[0],
    color: categoryColors[0],
  });

  function saveLocation() {
    if (!locationDraft.name.trim() || !locationDraft.code.trim()) return;
    onAddLocation(locationDraft);
    setLocationDraft({ name: '', code: '', address: '' });
    setLocationOpen(false);
  }

  function saveCategory() {
    if (!categoryDraft.name.trim()) return;
    onAddCategory(categoryDraft);
    setCategoryDraft({ name: '', area: categoryAreas[0], color: categoryColors[0] });
    setCategoryOpen(false);
  }

  async function confirmDeleteLocation() {
    if (!deleteLocationCandidate) return;
    setIsDeletingLocation(true);
    const deleted = await onDeleteLocation(deleteLocationCandidate.id);
    setIsDeletingLocation(false);
    if (deleted) setDeleteLocationCandidate(null);
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Lokationer
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Fælles lokationer bruges i lager, opgaver, målere og runderinger.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setLocationOpen(true)}>
          Ny lokation
        </Button>
      </Stack>

      <Grid container spacing={1.5}>
        {locations.map((location) => (
          <Grid key={location.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ p: 2, opacity: location.isActive ? 1 : 0.6 }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <LocationOnIcon color="primary" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900 }}>{location.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {location.address || 'Ingen adresse'}
                  </Typography>
                </Box>
                <Chip size="small" label={location.code} />
                <Tooltip title="Slet lokation">
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Slet ${location.name}`}
                    onClick={() => setDeleteLocationCandidate(location)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                {location.syncStatus !== 'synced' && (
                  <Chip size="small" color="warning" label="Afventer synk" />
                )}
                <Switch
                  checked={location.isActive}
                  onChange={() => onToggleLocation(location.id)}
                  inputProps={{ 'aria-label': `Aktiv lokation ${location.name}` }}
                  sx={{ ml: 'auto' }}
                />
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Kategorier
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Kategorier giver ensartede filtre og farver på tværs af moduler.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCategoryOpen(true)}>
          Ny kategori
        </Button>
      </Stack>

      <Grid container spacing={1.5}>
        {categories.map((category) => (
          <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                p: 2,
                borderLeft: `4px solid ${category.color}`,
                opacity: category.isActive ? 1 : 0.6,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CategoryIcon sx={{ color: category.color }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900 }}>{category.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {category.area}
                  </Typography>
                </Box>
                <Switch
                  checked={category.isActive}
                  onChange={() => onToggleCategory(category.id)}
                  inputProps={{ 'aria-label': `Aktiv kategori ${category.name}` }}
                />
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={locationOpen} onClose={() => setLocationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ny lokation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Navn"
              value={locationDraft.name}
              onChange={(event) =>
                setLocationDraft((current) => ({ ...current, name: event.target.value }))
              }
              autoFocus
            />
            <TextField
              label="Kort kode"
              value={locationDraft.code}
              onChange={(event) =>
                setLocationDraft((current) => ({ ...current, code: event.target.value.slice(0, 6) }))
              }
            />
            <TextField
              label="Adresse"
              value={locationDraft.address}
              onChange={(event) =>
                setLocationDraft((current) => ({ ...current, address: event.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationOpen(false)}>Annuller</Button>
          <Button variant="contained" onClick={saveLocation}>
            Gem lokation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={categoryOpen} onClose={() => setCategoryOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ny kategori</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Navn"
              value={categoryDraft.name}
              onChange={(event) =>
                setCategoryDraft((current) => ({ ...current, name: event.target.value }))
              }
              autoFocus
            />
            <TextField
              select
              label="Område"
              value={categoryDraft.area}
              onChange={(event) =>
                setCategoryDraft((current) => ({ ...current, area: event.target.value }))
              }
            >
              {categoryAreas.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>Farve</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {categoryColors.map((color) => (
                  <Box
                    key={color}
                    component="button"
                    aria-label={`Vælg farve ${color}`}
                    onClick={() => setCategoryDraft((current) => ({ ...current, color }))}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: color,
                      border: categoryDraft.color === color ? '3px solid white' : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryOpen(false)}>Annuller</Button>
          <Button variant="contained" onClick={saveCategory}>
            Gem kategori
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteLocationCandidate)}
        onClose={() => !isDeletingLocation && setDeleteLocationCandidate(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Slet lokation?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteLocationCandidate?.name} fjernes permanent fra systemopsætningen. Eksisterende
            historik beholder sit lokationsnavn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={isDeletingLocation} onClick={() => setDeleteLocationCandidate(null)}>
            Annuller
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={isDeletingLocation}
            onClick={() => void confirmDeleteLocation()}
          >
            Slet lokation
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
