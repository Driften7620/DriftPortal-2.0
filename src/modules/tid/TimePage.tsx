import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import StopIcon from '@mui/icons-material/Stop';
import SyncIcon from '@mui/icons-material/Sync';
import TimerIcon from '@mui/icons-material/Timer';
import {
  Alert,
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { timeKindLabels, workforceLocations } from '../workforce/mockData';
import type { ApprovalStatus, TimeEntry, TimeEntryDraft, TimeEntryKind } from '../workforce/types';
import { calculateHours, useWorkforce } from '../workforce/useWorkforce';

type TimeTab = 'overview' | 'register' | 'callout' | 'history' | 'approval';

const today = new Date().toISOString().slice(0, 10);

export function TimePage() {
  const navigate = useNavigate();
  const workforce = useWorkforce();
  const [tab, setTab] = useState<TimeTab>('overview');
  const [draft, setDraft] = useState<TimeEntryDraft>(() => emptyDraft());
  const [timerStartedAt, setTimerStartedAt] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [review, setReview] = useState<{
    id: string;
    status: 'approved' | 'rejected';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const ownEntries = workforce.timeEntries.filter(
    (record) => record.userId === workforce.user?.id,
  );
  const pendingApprovals = workforce.timeEntries.filter(
    (record) => record.status === 'pending',
  );
  const activePeriod = workforce.periods.find((period) => !period.isClosed);
  const ownHours = ownEntries
    .filter((record) => record.date >= (activePeriod?.dateFrom ?? ''))
    .reduce((sum, record) => sum + record.hours, 0);

  useEffect(() => {
    if (!timerStartedAt) return;
    const interval = window.setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerStartedAt]);

  function saveEntry() {
    if (calculateHours(draft.startTime, draft.endTime, draft.breakMinutes) <= 0) return;
    workforce.saveTimeEntry(draft);
    setDraft(emptyDraft());
    setTab('history');
  }

  function stopTimer() {
    if (!timerStartedAt) return;
    const start = new Date(timerStartedAt);
    const end = new Date();
    setDraft({
      ...emptyDraft(),
      date: start.toISOString().slice(0, 10),
      startTime: toTime(start),
      endTime: toTime(end),
      kind: 'callout',
    });
    setTimerStartedAt(null);
    setTimerSeconds(0);
    setTab('register');
  }

  function confirmReview() {
    if (!review) return;
    workforce.reviewRecord('time', review.id, review.status, reviewComment);
    setReview(null);
    setReviewComment('');
  }

  return (
    <Stack spacing={3}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Tilbage til oversigt
      </Button>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ color: '#fb923c', fontWeight: 900 }}>
            Tid
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            Timer, overarbejde, udkald og godkendelse.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={workforce.pendingSyncCount ? <CloudOffIcon /> : <CloudDoneIcon />}
          onClick={() => void workforce.syncPending()}
        >
          {workforce.pendingSyncCount ? `Synk ${workforce.pendingSyncCount}` : 'Synket'}
        </Button>
      </Stack>

      {workforce.syncMessage && (
        <Alert
          severity={workforce.pendingSyncCount ? 'warning' : 'success'}
          icon={<SyncIcon />}
        >
          {workforce.syncMessage}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, value: TimeTab) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Tidsregistrering"
      >
        <Tab value="overview" label="Oversigt" icon={<TimerIcon />} iconPosition="start" />
        <Tab value="register" label="Registrer" icon={<SaveIcon />} iconPosition="start" />
        <Tab value="callout" label="Udkald" icon={<PlayArrowIcon />} iconPosition="start" />
        <Tab value="history" label="Historik" icon={<HistoryIcon />} iconPosition="start" />
        {workforce.isTimeAdmin && (
          <Tab
            value="approval"
            label={`Godkendelse (${pendingApprovals.length})`}
            icon={<CheckIcon />}
            iconPosition="start"
          />
        )}
      </Tabs>

      {tab === 'overview' && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {[
              { label: 'Timer i perioden', value: ownHours.toLocaleString('da-DK'), color: '#fb923c' },
              {
                label: 'Afventer',
                value: ownEntries.filter((record) => record.status === 'pending').length,
                color: '#ffd166',
              },
              {
                label: 'Godkendt',
                value: ownEntries.filter((record) => record.status === 'approved').length,
                color: '#34d399',
              },
              { label: 'Aktiv periode', value: activePeriod?.title ?? 'Ingen', color: '#60a5fa' },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                <Card sx={{ p: 2, minHeight: 135, borderLeft: `4px solid ${item.color}` }}>
                  <Typography sx={{ color: item.color, fontSize: 28, fontWeight: 900 }}>
                    {item.value}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    {item.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={() => setTab('register')}>
              Registrer tid
            </Button>
            <Button variant="outlined" startIcon={<PlayArrowIcon />} onClick={() => setTab('callout')}>
              Start udkald
            </Button>
          </Stack>
        </Stack>
      )}

      {tab === 'register' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TimeForm draft={draft} onChange={setDraft} onSave={saveEntry} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <EntryList
              entries={ownEntries.slice(0, 8)}
              onEdit={(entry) => {
                setDraft({
                  id: entry.id,
                  date: entry.date,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                  breakMinutes: entry.breakMinutes,
                  kind: entry.kind,
                  location: entry.location,
                  description: entry.description,
                });
                setTab('register');
              }}
            />
          </Grid>
        </Grid>
      )}

      {tab === 'callout' && (
        <Stack spacing={3} alignItems="center" sx={{ py: { xs: 2, md: 5 } }}>
          <TimerIcon sx={{ color: '#fb923c', fontSize: 72 }} />
          <Typography sx={{ fontSize: 48, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {formatDuration(timerSeconds)}
          </Typography>
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 520 }}>
            Start timeren ved udkald. Når du stopper, åbnes registreringen med start og slut udfyldt,
            så lokation og beskrivelse kan tilføjes.
          </Typography>
          {timerStartedAt ? (
            <Button
              size="large"
              color="error"
              variant="contained"
              startIcon={<StopIcon />}
              onClick={stopTimer}
            >
              Stop udkald
            </Button>
          ) : (
            <Button
              size="large"
              color="success"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => setTimerStartedAt(new Date().toISOString())}
            >
              Start udkald
            </Button>
          )}
        </Stack>
      )}

      {tab === 'history' && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Typography variant="h5" sx={{ flex: 1, fontWeight: 900 }}>
              Mine registreringer
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportTimeCsv(ownEntries)}
            >
              Eksporter CSV
            </Button>
          </Stack>
          <EntryList
            entries={ownEntries}
            onEdit={(entry) => {
              setDraft({
                id: entry.id,
                date: entry.date,
                startTime: entry.startTime,
                endTime: entry.endTime,
                breakMinutes: entry.breakMinutes,
                kind: entry.kind,
                location: entry.location,
                description: entry.description,
              });
              setTab('register');
            }}
          />
        </Stack>
      )}

      {tab === 'approval' && workforce.isTimeAdmin && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Godkend tidsregistreringer
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {activePeriod?.title ?? 'Ingen aktiv periode'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() =>
                exportTimeCsv(workforce.timeEntries.filter((entry) => entry.status === 'approved'))
              }
            >
              Eksporter godkendte
            </Button>
            {activePeriod && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => workforce.closePeriod(activePeriod.id)}
              >
                Luk periode
              </Button>
            )}
          </Stack>
          {pendingApprovals.length === 0 && <Alert severity="success">Alt er behandlet.</Alert>}
          {pendingApprovals.map((entry) => (
            <Card key={entry.id} sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ sm: 'center' }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {entry.userName} · {timeKindLabels[entry.kind]}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {formatDate(entry.date)} · {entry.startTime}-{entry.endTime} ·{' '}
                    {entry.hours.toLocaleString('da-DK')} timer
                  </Typography>
                  <Typography variant="body2">{entry.description}</Typography>
                </Box>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setReview({ id: entry.id, status: 'rejected' })}
                >
                  Afvis
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => setReview({ id: entry.id, status: 'approved' })}
                >
                  Godkend
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(review)} onClose={() => setReview(null)} fullWidth maxWidth="sm">
        <DialogTitle>{review?.status === 'approved' ? 'Godkend tid' : 'Afvis tid'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            sx={{ mt: 1 }}
            label="Kommentar"
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            multiline
            minRows={3}
            required={review?.status === 'rejected'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReview(null)}>Annuller</Button>
          <Button
            variant="contained"
            color={review?.status === 'approved' ? 'success' : 'error'}
            disabled={review?.status === 'rejected' && !reviewComment.trim()}
            onClick={confirmReview}
          >
            Bekræft
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function TimeForm({
  draft,
  onChange,
  onSave,
}: {
  draft: TimeEntryDraft;
  onChange: (draft: TimeEntryDraft) => void;
  onSave: () => void;
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        {draft.id ? 'Rediger registrering' : 'Registrer tid'}
      </Typography>
      <TextField
        type="date"
        label="Dato"
        value={draft.date}
        onChange={(event) => onChange({ ...draft, date: event.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            type="time"
            label="Start"
            value={draft.startTime}
            onChange={(event) => onChange({ ...draft, startTime: event.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            type="time"
            label="Slut"
            value={draft.endTime}
            onChange={(event) => onChange({ ...draft, endTime: event.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <TextField
        type="number"
        label="Pause i minutter"
        value={draft.breakMinutes}
        onChange={(event) => onChange({ ...draft, breakMinutes: Number(event.target.value) })}
      />
      <TextField
        select
        label="Opgavetype"
        value={draft.kind}
        onChange={(event) => onChange({ ...draft, kind: event.target.value as TimeEntryKind })}
      >
        {Object.entries(timeKindLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Lokation"
        value={draft.location}
        onChange={(event) => onChange({ ...draft, location: event.target.value })}
      >
        {workforceLocations.map((location) => (
          <MenuItem key={location} value={location}>
            {location}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Beskrivelse"
        value={draft.description}
        onChange={(event) => onChange({ ...draft, description: event.target.value })}
        multiline
        minRows={2}
      />
      <Alert severity="info">
        Beregnet tid:{' '}
        <strong>
          {calculateHours(draft.startTime, draft.endTime, draft.breakMinutes).toLocaleString(
            'da-DK',
          )}{' '}
          timer
        </strong>
      </Alert>
      <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave}>
        {draft.id ? 'Gem ændringer' : 'Gem registrering'}
      </Button>
    </Stack>
  );
}

function EntryList({
  entries,
  onEdit,
}: {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
}) {
  return (
    <Stack spacing={1.5}>
      {entries.length === 0 && <Alert severity="info">Ingen tidsregistreringer endnu.</Alert>}
      {entries.map((entry) => (
        <Card key={entry.id} sx={{ p: 2, borderLeft: `4px solid ${statusColor(entry.status)}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900 }}>
                {timeKindLabels[entry.kind]} · {entry.hours.toLocaleString('da-DK')} timer
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {formatDate(entry.date)} · {entry.startTime}-{entry.endTime} · {entry.location}
              </Typography>
              <Typography variant="body2">{entry.description}</Typography>
              {entry.reviewerComment && (
                <Typography variant="body2" sx={{ color: 'warning.main', mt: 0.5 }}>
                  Kommentar: {entry.reviewerComment}
                </Typography>
              )}
            </Box>
            <StatusChip status={entry.status} />
            {entry.status === 'pending' && (
              <Tooltip title="Rediger">
                <IconButton aria-label={`Rediger tid fra ${entry.date}`} onClick={() => onEdit(entry)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function StatusChip({ status }: { status: ApprovalStatus }) {
  const settings = {
    pending: { label: 'Afventer', color: 'warning' as const },
    approved: { label: 'Godkendt', color: 'success' as const },
    rejected: { label: 'Afvist', color: 'error' as const },
  };
  return <Chip size="small" label={settings[status].label} color={settings[status].color} />;
}

function emptyDraft(): TimeEntryDraft {
  return {
    date: today,
    startTime: '07:00',
    endTime: '15:00',
    breakMinutes: 30,
    kind: 'regular',
    location: workforceLocations[0],
    description: '',
  };
}

function statusColor(status: ApprovalStatus) {
  if (status === 'approved') return '#34d399';
  if (status === 'rejected') return '#ff6b6b';
  return '#ffd166';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('da-DK').format(new Date(`${value}T12:00:00`));
}

function toTime(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, '0')).join(':');
}

function exportTimeCsv(entries: TimeEntry[]) {
  const rows = [
    ['Navn', 'Dato', 'Start', 'Slut', 'Timer', 'Opgavetype', 'Lokation', 'Kommentar', 'Status'],
    ...entries.map((entry) => [
      entry.userName,
      entry.date,
      entry.startTime,
      entry.endTime,
      String(entry.hours).replace('.', ','),
      timeKindLabels[entry.kind],
      entry.location,
      entry.description,
      entry.status,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
    .join('\r\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tid_export_${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
