import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SyncIcon from '@mui/icons-material/Sync';
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { roundChecks as initialChecks, roundPoints, roundSessions } from './mockData';
import { loadStoredChecks, mergeChecks, saveStoredChecks } from './runderingStorage';
import type { RoundCheck, RoundPoint, RoundPointStatus, RoundSession } from './types';

const allAreas = 'Alle områder';

export function RunderingPage() {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const [checks, setChecks] = useState<RoundCheck[]>(() => mergeChecks(initialChecks, loadStoredChecks()));
  const [selectedSessionId, setSelectedSessionId] = useState(roundSessions[0]?.id ?? '');
  const [selectedPointId, setSelectedPointId] = useState(roundSessions[0]?.pointIds[0] ?? '');
  const [areaFilter, setAreaFilter] = useState(allAreas);
  const [note, setNote] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  const selectedSession = roundSessions.find((session) => session.id === selectedSessionId) ?? roundSessions[0];
  const sessionPoints = selectedSession.pointIds
    .map((pointId) => roundPoints.find((point) => point.id === pointId))
    .filter((point): point is RoundPoint => Boolean(point));
  const selectedPoint = sessionPoints.find((point) => point.id === selectedPointId) ?? sessionPoints[0];
  const areas = [allAreas, ...Array.from(new Set(roundSessions.map((session) => session.area)))];
  const filteredSessions = roundSessions.filter((session) => areaFilter === allAreas || session.area === areaFilter);
  const localChecks = checks.filter((check) => check.syncStatus);
  const pendingChecks = checks.filter((check) => check.syncStatus === 'pending' || check.syncStatus === 'failed');

  const summary = useMemo(() => {
    const totalPoints = roundSessions.reduce((sum, session) => sum + session.pointIds.length, 0);
    const completed = new Set(checks.filter((check) => check.status === 'ok').map((check) => `${check.sessionId}:${check.pointId}`)).size;
    const deviations = checks.filter((check) => check.status === 'deviation').length;
    const skipped = checks.filter((check) => check.status === 'skipped').length;

    return { sessions: roundSessions.length, totalPoints, completed, deviations, skipped };
  }, [checks]);

  useEffect(() => {
    saveStoredChecks(localChecks);
  }, [localChecks]);

  function registerCheck(status: RoundPointStatus) {
    if (!selectedSession || !selectedPoint) return;

    const newCheck: RoundCheck = {
      id: `round-check-${Date.now()}`,
      sessionId: selectedSession.id,
      pointId: selectedPoint.id,
      status,
      checkedAt: new Date().toISOString(),
      checkedBy: user?.fullName ?? 'Demo',
      note: note.trim() || undefined,
      syncStatus: 'pending',
    };

    setChecks((current) => [newCheck, ...current]);
    setSyncMessage('Punkt gemt lokalt og lagt klar til synk.');
    setNote('');

    const currentIndex = sessionPoints.findIndex((point) => point.id === selectedPoint.id);
    const nextPoint = sessionPoints[currentIndex + 1];
    if (nextPoint) setSelectedPointId(nextPoint.id);
  }

  function handleSelectSession(session: RoundSession) {
    setSelectedSessionId(session.id);
    setSelectedPointId(session.pointIds[0] ?? '');
  }

  function handleSync() {
    if (pendingChecks.length === 0) {
      setSyncMessage('Alt er synkroniseret.');
      return;
    }

    if (isDemoMode) {
      setSyncMessage('Runderingen er gemt lokalt. Supabase-synk kobles på, når rigtig login og databasen er klar.');
      return;
    }

    setChecks((current) =>
      current.map((check) =>
        check.syncStatus === 'pending' || check.syncStatus === 'failed'
          ? { ...check, syncStatus: 'synced', syncError: undefined, syncedAt: new Date().toISOString() }
          : check,
      ),
    );
    setSyncMessage(`${pendingChecks.length} rundering${pendingChecks.length === 1 ? '' : 'er'} markeret som synket.`);
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
          <Typography variant="h3" sx={{ color: '#a78bfa', fontWeight: 900 }}>
            Rundering
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: 18 }}>
            Gennemfør runder, registrer afvigelser og gem kontroller offline.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button variant="outlined" startIcon={pendingChecks.length ? <CloudOffIcon /> : <CloudDoneIcon />} onClick={handleSync}>
            {pendingChecks.length ? `Synk ${pendingChecks.length}` : 'Synket'}
          </Button>
          <Button variant="contained" startIcon={<QrCodeScannerIcon />}>
            Scan QR
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {[
          { label: 'Runder', value: summary.sessions, color: '#a78bfa' },
          { label: 'Punkter', value: summary.totalPoints, color: '#00e5ff' },
          { label: 'OK', value: summary.completed, color: '#34d399' },
          { label: 'Afvigelser', value: summary.deviations, color: '#ff6b6b' },
          { label: 'Sprunget over', value: summary.skipped, color: '#ffd166' },
          { label: 'Afventer synk', value: pendingChecks.length, color: '#fb7185' },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 6, md: 2 }}>
            <Card sx={{ p: 2, borderLeft: `4px solid ${item.color}` }}>
              <Typography sx={{ color: item.color, fontSize: 32, fontWeight: 900 }}>{item.value}</Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>{item.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {syncMessage && (
        <Alert severity={pendingChecks.length ? 'warning' : 'success'} icon={pendingChecks.length ? <SyncIcon /> : <CloudDoneIcon />}>
          {syncMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2.25 }}>
            <Stack spacing={2}>
              <TextField select label="Område" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </TextField>

              <Stack spacing={1.25}>
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    active={session.id === selectedSession.id}
                    checks={checks}
                    onClick={() => handleSelectSession(session)}
                  />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 2.25 }}>
            <Stack spacing={2.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>
                    {selectedSession.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {selectedSession.area} · {selectedSession.assignedTo} · frist {formatTime(selectedSession.dueAt)}
                  </Typography>
                </Box>
                <Chip label={sessionStatusText(selectedSession.status)} sx={{ color: sessionStatusColor(selectedSession.status), fontWeight: 900 }} />
              </Stack>

              <Grid container spacing={1.25}>
                {sessionPoints.map((point) => {
                  const latest = latestCheck(selectedSession.id, point.id, checks);
                  return (
                    <Grid key={point.id} size={{ xs: 12, sm: 6 }}>
                      <CardActionArea onClick={() => setSelectedPointId(point.id)} sx={{ borderRadius: 2 }}>
                        <Stack
                          spacing={1}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: point.id === selectedPoint?.id ? 'rgba(167, 139, 250, 0.14)' : 'rgba(15, 23, 42, 0.72)',
                            border: `1px solid ${point.id === selectedPoint?.id ? '#a78bfa' : 'rgba(148, 163, 184, 0.16)'}`,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            {statusIcon(latest?.status)}
                            <Typography sx={{ color: '#fff', fontWeight: 900 }}>{point.title}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {point.location} · {point.group}
                          </Typography>
                          <Chip size="small" label={latest ? pointStatusText(latest.status) : 'Afventer'} sx={{ alignSelf: 'flex-start' }} />
                        </Stack>
                      </CardActionArea>
                    </Grid>
                  );
                })}
              </Grid>

              {selectedPoint && (
                <Card sx={{ p: 2, bgcolor: 'rgba(15, 23, 42, 0.72)' }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SearchIcon sx={{ color: '#a78bfa' }} />
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900 }}>
                        {selectedPoint.title}
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>{selectedPoint.instruction}</Typography>
                    <TextField
                      label="Bemærkning eller afvigelse"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      multiline
                      minRows={2}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => registerCheck('ok')}>
                        OK
                      </Button>
                      <Button variant="contained" color="error" startIcon={<ReportProblemIcon />} onClick={() => registerCheck('deviation')}>
                        Afvigelse
                      </Button>
                      <Button variant="outlined" startIcon={<SkipNextIcon />} onClick={() => registerCheck('skipped')}>
                        Spring over
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              )}

              <Divider />

              <Stack spacing={1.25}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Seneste registreringer
                </Typography>
                {checks
                  .filter((check) => check.sessionId === selectedSession.id)
                  .slice(0, 6)
                  .map((check) => {
                    const point = roundPoints.find((item) => item.id === check.pointId);
                    return (
                      <Stack key={check.id} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.72)' }}>
                        {statusIcon(check.status)}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 800 }}>{point?.title ?? check.pointId}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {pointStatusText(check.status)} · {formatTime(check.checkedAt)} · {check.checkedBy}
                          </Typography>
                        </Box>
                        {check.syncStatus && <Chip size="small" label={syncStatusText(check.syncStatus)} />}
                      </Stack>
                    );
                  })}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function SessionCard({
  session,
  active,
  checks,
  onClick,
}: {
  session: RoundSession;
  active: boolean;
  checks: RoundCheck[];
  onClick: () => void;
}) {
  const completed = session.pointIds.filter((pointId) => latestCheck(session.id, pointId, checks)?.status === 'ok').length;

  return (
    <CardActionArea onClick={onClick} sx={{ borderRadius: 2 }}>
      <Stack
        spacing={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: active ? 'rgba(167, 139, 250, 0.14)' : 'rgba(15, 23, 42, 0.72)',
          border: `1px solid ${active ? '#a78bfa' : 'rgba(148, 163, 184, 0.16)'}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ color: '#fff', fontWeight: 900 }}>{session.title}</Typography>
          <Chip size="small" label={sessionStatusText(session.status)} sx={{ color: sessionStatusColor(session.status), fontWeight: 900 }} />
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          {session.area} · {completed}/{session.pointIds.length} OK · frist {formatTime(session.dueAt)}
        </Typography>
      </Stack>
    </CardActionArea>
  );
}

function latestCheck(sessionId: string, pointId: string, checks: RoundCheck[]) {
  return checks
    .filter((check) => check.sessionId === sessionId && check.pointId === pointId)
    .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())[0];
}

function statusIcon(status?: RoundPointStatus) {
  if (status === 'ok') return <CheckCircleIcon sx={{ color: '#34d399' }} />;
  if (status === 'deviation') return <ReportProblemIcon sx={{ color: '#ff6b6b' }} />;
  if (status === 'skipped') return <SkipNextIcon sx={{ color: '#ffd166' }} />;
  return <ErrorOutlineIcon sx={{ color: '#94a3b8' }} />;
}

function pointStatusText(status: RoundPointStatus) {
  if (status === 'ok') return 'OK';
  if (status === 'deviation') return 'Afvigelse';
  if (status === 'skipped') return 'Sprunget over';
  return 'Afventer';
}

function sessionStatusText(status: RoundSession['status']) {
  if (status === 'completed') return 'Færdig';
  if (status === 'in_progress') return 'I gang';
  if (status === 'attention') return 'Kræver kontrol';
  return 'Planlagt';
}

function sessionStatusColor(status: RoundSession['status']) {
  if (status === 'completed') return '#34d399';
  if (status === 'in_progress') return '#00e5ff';
  if (status === 'attention') return '#ff6b6b';
  return '#ffd166';
}

function syncStatusText(status: NonNullable<RoundCheck['syncStatus']>) {
  if (status === 'synced') return 'Synket';
  if (status === 'failed') return 'Synk fejlet';
  if (status === 'pending') return 'Afventer synk';
  return 'Lokal';
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}
