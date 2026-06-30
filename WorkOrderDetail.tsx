import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmergencyIcon from '@mui/icons-material/Emergency';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import HistoryIcon from '@mui/icons-material/History';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { sdsLocations } from './mockData';
import type { SdsDocument } from './types';
import { useSdsLibrary } from './useSdsLibrary';

const allValues = 'Alle';

export function SdsPage() {
  const navigate = useNavigate();
  const { documents, favoriteIds, recent, toggleFavorite, markViewed } = useSdsLibrary();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(allValues);
  const [hazard, setHazard] = useState(allValues);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '');
  const [message, setMessage] = useState('');

  const filtered = useMemo(
    () =>
      documents.filter((document) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            [
              document.name,
              document.supplier,
              document.productNumber,
              ...document.hazardCodes,
              ...document.hazardLabels,
            ]
              .join(' ')
              .toLowerCase()
              .includes(query)) &&
          (location === allValues || document.location === location) &&
          (hazard === allValues || document.signalWord === hazard) &&
          (!favoritesOnly || favoriteIds.includes(document.id))
        );
      }),
    [documents, favoriteIds, favoritesOnly, hazard, location, search],
  );
  const selected = documents.find((document) => document.id === selectedId) ?? filtered[0];

  function selectDocument(document: SdsDocument) {
    setSelectedId(document.id);
    markViewed(document.id);
  }

  function openPdf() {
    if (!selected) return;
    setMessage(
      `${selected.pdfFileName} er klar til at blive tilknyttet i Supabase Storage. Dokumentdata virker allerede offline.`,
    );
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
          <Typography
            variant="h3"
            sx={{
              color: '#fbbf24',
              fontWeight: 900,
              fontSize: { xs: 32, sm: 48 },
              overflowWrap: 'anywhere',
            }}
          >
            Sikkerhedsdatablade
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            Kemikalier, farer, værnemidler og førstehjælp.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            color="error"
            variant="contained"
            startIcon={<EmergencyIcon />}
            component="a"
            href="tel:82121212"
          >
            Giftlinjen 82 12 12 12
          </Button>
          <Button variant="outlined" startIcon={<QrCodeScannerIcon />}>
            Scan QR
          </Button>
        </Stack>
      </Stack>

      <Alert severity="success">
        {documents.length} sikkerhedsdatablade er tilgængelige offline på denne enhed.
      </Alert>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="Søg kemikalie, leverandør eller H-kode"
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
          sx={{ minWidth: 180 }}
        >
          <MenuItem value={allValues}>{allValues}</MenuItem>
          {sdsLocations.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Signalord"
          value={hazard}
          onChange={(event) => setHazard(event.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value={allValues}>{allValues}</MenuItem>
          <MenuItem value="Fare">Fare</MenuItem>
          <MenuItem value="Advarsel">Advarsel</MenuItem>
        </TextField>
        <Button
          variant={favoritesOnly ? 'contained' : 'outlined'}
          startIcon={favoritesOnly ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={() => setFavoritesOnly((current) => !current)}
        >
          Favoritter
        </Button>
      </Stack>

      {recent.length > 0 && (
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <HistoryIcon color="primary" />
          <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>Senest vist:</Typography>
          {recent.slice(0, 3).map((document) => (
            <Chip key={document.id} label={document.name} onClick={() => selectDocument(document)} />
          ))}
        </Stack>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={1.5}>
            {filtered.map((document) => (
              <Grid key={document.id} size={{ xs: 12, sm: 6 }}>
                <ChemicalCard
                  document={document}
                  active={document.id === selected?.id}
                  favorite={favoriteIds.includes(document.id)}
                  onSelect={() => selectDocument(document)}
                  onFavorite={() => toggleFavorite(document.id)}
                />
              </Grid>
            ))}
          </Grid>
          {filtered.length === 0 && (
            <Alert severity="info">Ingen kemikalier matcher de valgte filtre.</Alert>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {selected && (
            <Card sx={{ p: 2.25, borderTop: '4px solid #fbbf24' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
                  <LocalFireDepartmentIcon sx={{ color: '#ff6b6b', fontSize: 36 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: 28, sm: 34 },
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {selected.name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {selected.supplier} · {selected.productNumber}
                    </Typography>
                  </Box>
                  <Tooltip title="Favorit">
                    <IconButton
                      color="error"
                      onClick={() => toggleFavorite(selected.id)}
                      aria-label={`Favoritmarkér ${selected.name}`}
                    >
                      {favoriteIds.includes(selected.id) ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    color={selected.signalWord === 'Fare' ? 'error' : 'warning'}
                    label={selected.signalWord}
                  />
                  {selected.hazardCodes.map((code) => (
                    <Chip key={code} variant="outlined" label={code} />
                  ))}
                  <Chip label={selected.location} />
                </Stack>

                <Box>
                  <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Farer</Typography>
                  {selected.hazardLabels.map((label) => (
                    <Typography key={label} sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      • {label}
                    </Typography>
                  ))}
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <HealthAndSafetyIcon color="success" />
                    <Typography sx={{ fontWeight: 900 }}>Værnemidler</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {selected.ppe.map((item) => (
                      <Chip key={item} color="success" variant="outlined" label={item} />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Førstehjælp</Typography>
                  <FirstAid label="Øjne" text={selected.firstAid.eyes} />
                  <FirstAid label="Hud" text={selected.firstAid.skin} />
                  <FirstAid label="Indånding" text={selected.firstAid.inhalation} />
                </Box>

                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PictureAsPdfIcon />}
                  endIcon={<OpenInNewIcon />}
                  onClick={openPdf}
                >
                  Åbn sikkerhedsdatablad
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Revideret {formatDate(selected.revisionDate)} · QR: {selected.qrCode}
                </Typography>
              </Stack>
            </Card>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={5000}
        message={message}
        onClose={() => setMessage('')}
      />
    </Stack>
  );
}

function ChemicalCard({
  document,
  active,
  favorite,
  onSelect,
  onFavorite,
}: {
  document: SdsDocument;
  active: boolean;
  favorite: boolean;
  onSelect: () => void;
  onFavorite: () => void;
}) {
  return (
    <Card sx={{ borderLeft: `4px solid ${document.signalWord === 'Fare' ? '#ff6b6b' : '#fbbf24'}` }}>
      <CardActionArea onClick={onSelect} sx={{ p: 1.75, minHeight: 188 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <LocalFireDepartmentIcon sx={{ color: '#ff6b6b' }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900 }}>{document.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {document.supplier}
              </Typography>
            </Box>
            <IconButton
              size="small"
              color="error"
              aria-label={`Favoritmarkér ${document.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onFavorite();
              }}
            >
              {favorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              color={document.signalWord === 'Fare' ? 'error' : 'warning'}
              label={document.signalWord}
            />
            {document.hazardCodes.map((code) => (
              <Chip key={code} size="small" variant="outlined" label={code} />
            ))}
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {document.location} · Revideret {formatDate(document.revisionDate)}
          </Typography>
          {active && <Chip size="small" color="primary" label="Valgt" sx={{ alignSelf: 'flex-start' }} />}
        </Stack>
      </CardActionArea>
    </Card>
  );
}

function FirstAid({ label, text }: { label: string; text: string }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
      <Box component="span" sx={{ color: 'text.primary', fontWeight: 900 }}>
        {label}:
      </Box>{' '}
      {text}
    </Typography>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('da-DK').format(new Date(value));
}
