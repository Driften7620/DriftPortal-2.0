import AddCircleIcon from '@mui/icons-material/AddCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { meters as initialMeters, readings as initialReadings } from './mockData';
import { assessReading, formatDateTime, getLatestReading, getPreviousReading, statusColor, statusText } from './maalerlogUtils';
import type { Meter, MeterReading } from './types';

const allLocations = 'Alle lokationer';

export function MaalerLogPage() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<MeterReading[]>(initialReadings);
  const [selectedMeterId, setSelectedMeterId] = useState(initialMeters[0]?.id ?? '');
  const [locationFilter, setLocationFilter] = useState(allLocations);
  const [value, setValue] = useState('');
  const [comment, setComment] = useState('');

  const selectedMeter = initialMeters.find((meter) => meter.id === selectedMeterId) ?? initialMeters[0];
  const locations = [allLocations, ...Array.from(new Set(initialMeters.map((meter) => meter.location)))];
  const filteredMeters = initialMeters.filter((meter) => locationFilter === allLocations || meter.location === locationFilter);
  const latest = selectedMeter ? getLatestReading(selectedMeter.id, readings) : undefined;
  const previous = selectedMeter ? getPreviousReading(selectedMeter.id, readings) : undefined;
  const parsedValue = Number(value.replace(',', '.'));
  const assessment = selectedMeter && Number.isFinite(parsedValue) ? assessReading(selectedMeter, parsedValue, readings) : undefined;

  const summary = useMemo(
    () => ({
      total: initialMeters.length,
      due: initialMeters.filter((meter) => meter.status === 'due').length,
      alarm: initialMeters.filter((meter) => meter.status === 'alarm').length,
      service: initialMeters.filter((meter) => meter.status === 'service').length,
    }),
    [],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMeter || !Number.isFinite(parsedValue)) return;

    const newReading: MeterReading = {
      id: `reading-${Date.now()}`,
      meterId: selectedMeter.id,
      value: parsedValue,
      readAt: new Date().toISOString(),
      readBy: user?.fullName ?? 'Demo',
      comment: comment.trim() || undefined,
    };

    setReadings((current) => [newReading, ...current]);
    setValue('');
    setComment('');
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ color: '#00e5ff', fontWeight: 900 }}>
            MålerLog
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: 18 }}>
            Aflæs målere, beregn forbrug og fang usandsynlige værdier.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button variant="contained" startIcon={<QrCodeScannerIcon />}>
            Scan QR
          </Button>
          <Button variant="outlined" startIcon={<CameraAltIcon />}>
            Kamera
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {[
          { label: 'Målere', value: summary.total, color: '#00e5ff' },
          { label: 'Afventer', value: summary.due, color: '#ffd166' },
          { label: 'Alarmer', value: summary.alarm, color: '#ff6b6b' },
          { label: 'Service', value: summary.service, color: '#a78bfa' },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderLeft: `4px solid ${item.color}` }}>
              <Typography sx={{ color: item.color, fontSize: 34, fontWeight: 900 }}>{item.value}</Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>{item.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2.25 }}>
            <Stack spacing={2}>
              <TextField
                select
                label="Lokation"
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
              >
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>

              <Stack spacing={1.25}>
                {filteredMeters.map((meter) => (
                  <MeterCard
                    key={meter.id}
                    meter={meter}
                    latest={getLatestReading(meter.id, readings)}
                    active={meter.id === selectedMeter?.id}
                    onClick={() => setSelectedMeterId(meter.id)}
                  />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {selectedMeter && (
            <Card sx={{ p: 2.25 }}>
              <Stack spacing={2.25}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>
                      {selectedMeter.name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {selectedMeter.location} · {selectedMeter.group} · {selectedMeter.unit}
                    </Typography>
                  </Box>
                  <Chip
                    label={statusText(selectedMeter.status)}
                    sx={{
                      bgcolor: `${statusColor(selectedMeter.status)}22`,
                      color: statusColor(selectedMeter.status),
                      border: `1px solid ${statusColor(selectedMeter.status)}88`,
                      fontWeight: 900,
                    }}
                  />
                </Stack>

                {selectedMeter.note && <Alert severity="info">{selectedMeter.note}</Alert>}

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <InfoBox label="Seneste" value={latest ? `${latest.value} ${selectedMeter.unit}` : 'Ingen'} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <InfoBox label="Forrige" value={previous ? `${previous.value} ${selectedMeter.unit}` : 'Ingen'} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <InfoBox
                      label="Sidste forbrug"
                      value={
                        latest && previous ? `${(latest.value - previous.value).toLocaleString('da-DK')} ${selectedMeter.unit}` : 'Ukendt'
                      }
                    />
                  </Grid>
                </Grid>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={1.5}>
                    <TextField
                      label={`Ny aflæsning (${selectedMeter.unit})`}
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      inputMode="decimal"
                      required
                    />
                    <TextField
                      label="Bemærkning"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      multiline
                      minRows={2}
                    />

                    {assessment && (
                      <Stack spacing={1}>
                        <InfoBox
                          label="Beregnet forbrug"
                          value={`${assessment.consumption.toLocaleString('da-DK')} ${selectedMeter.unit}`}
                        />
                        {(assessment.isLowerThanPrevious || assessment.isOutOfRange || assessment.isUnusualConsumption) && (
                          <Alert severity="warning" icon={<WarningAmberIcon />}>
                            Aflæsningen kræver kontrol:
                            {assessment.isLowerThanPrevious ? ' lavere end seneste aflæsning.' : ''}
                            {assessment.isOutOfRange ? ' uden for grænseværdi.' : ''}
                            {assessment.isUnusualConsumption ? ' mere end 10x normalt forbrug.' : ''}
                          </Alert>
                        )}
                      </Stack>
                    )}

                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} size="large">
                      Gem aflæsning
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HistoryIcon sx={{ color: '#00e5ff' }} />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Historik
                    </Typography>
                  </Stack>
                  {readings
                    .filter((reading) => reading.meterId === selectedMeter.id)
                    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
                    .slice(0, 6)
                    .map((reading) => (
                      <Stack
                        key={reading.id}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.72)' }}
                      >
                        <AddCircleIcon sx={{ color: '#34d399' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                            {reading.value.toLocaleString('da-DK')} {selectedMeter.unit}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {formatDateTime(reading.readAt)} · {reading.readBy}
                          </Typography>
                        </Box>
                        {reading.comment && <Chip label={reading.comment} size="small" />}
                      </Stack>
                    ))}
                </Stack>
              </Stack>
            </Card>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}

function MeterCard({
  meter,
  latest,
  active,
  onClick,
}: {
  meter: Meter;
  latest?: MeterReading;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <CardActionArea onClick={onClick} sx={{ borderRadius: 2 }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: active ? 'rgba(0, 229, 255, 0.12)' : 'rgba(15, 23, 42, 0.72)',
          border: `1px solid ${active ? '#00e5ff' : 'rgba(148, 163, 184, 0.16)'}`,
        }}
      >
        <Box
          sx={{
            width: 10,
            alignSelf: 'stretch',
            borderRadius: 999,
            bgcolor: statusColor(meter.status),
            boxShadow: `0 0 12px ${statusColor(meter.status)}`,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: '#fff', fontWeight: 900 }}>{meter.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {meter.location} · {latest ? `${latest.value.toLocaleString('da-DK')} ${meter.unit}` : 'Ingen aflæsning'}
          </Typography>
        </Box>
        <Chip label={statusText(meter.status)} size="small" sx={{ color: statusColor(meter.status), fontWeight: 900 }} />
      </Stack>
    </CardActionArea>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <Card sx={{ p: 1.5, bgcolor: 'rgba(15, 23, 42, 0.72)' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</Typography>
      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{value}</Typography>
    </Card>
  );
}
