import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckIcon from '@mui/icons-material/Check';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SyncIcon from '@mui/icons-material/Sync';
import WalletIcon from '@mui/icons-material/Wallet';
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
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { leaveTypeLabels } from '../workforce/mockData';
import type { ApprovalStatus, EmployeeBalance, LeaveType } from '../workforce/types';
import { calculateHours, countWeekdays, useWorkforce } from '../workforce/useWorkforce';

type HrTab = 'overview' | 'work' | 'leave' | 'balance' | 'approval';

const today = new Date().toISOString().slice(0, 10);

export function HrPage() {
  const navigate = useNavigate();
  const workforce = useWorkforce();
  const [tab, setTab] = useState<HrTab>('overview');
  const [workDraft, setWorkDraft] = useState({
    date: today,
    startTime: '07:00',
    endTime: '15:00',
    breakMinutes: 30,
    note: '',
  });
  const [leaveDraft, setLeaveDraft] = useState({
    type: 'vacation' as LeaveType,
    dateFrom: today,
    dateTo: today,
    note: '',
  });
  const [balanceDialog, setBalanceDialog] = useState<EmployeeBalance | null>(null);
  const [review, setReview] = useState<{
    area: 'work' | 'leave';
    id: string;
    status: 'approved' | 'rejected';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const ownWork = workforce.workDays.filter((record) => record.userId === workforce.user?.id);
  const ownLeave = workforce.leaveRequests.filter(
    (record) => record.userId === workforce.user?.id,
  );
  const ownBalance = workforce.balances.find(
    (record) => record.userId === workforce.user?.id,
  );
  const approvals = useMemo(
    () => [
      ...workforce.workDays
        .filter((record) => record.status === 'pending')
        .map((record) => ({ ...record, area: 'work' as const, title: 'Arbejdstid' })),
      ...workforce.leaveRequests
        .filter((record) => record.status === 'pending')
        .map((record) => ({
          ...record,
          area: 'leave' as const,
          title: leaveTypeLabels[record.type],
        })),
    ],
    [workforce.leaveRequests, workforce.workDays],
  );

  function saveWorkDay() {
    if (calculateHours(workDraft.startTime, workDraft.endTime, workDraft.breakMinutes) <= 0) return;
    workforce.addWorkDay(workDraft);
    setWorkDraft((current) => ({ ...current, note: '' }));
  }

  function saveLeaveRequest() {
    if (!countWeekdays(leaveDraft.dateFrom, leaveDraft.dateTo)) return;
    workforce.addLeaveRequest(leaveDraft);
    setLeaveDraft((current) => ({ ...current, note: '' }));
  }

  function confirmReview() {
    if (!review) return;
    workforce.reviewRecord(review.area, review.id, review.status, reviewComment);
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
          <Typography variant="h3" sx={{ color: '#34d399', fontWeight: 900 }}>
            HR
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18, fontWeight: 700 }}>
            Arbejdstid, ferie, frihed og medarbejdersaldi.
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
        onChange={(_, value: HrTab) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="HR-visninger"
      >
        <Tab value="overview" label="Oversigt" icon={<CalendarMonthIcon />} iconPosition="start" />
        <Tab value="work" label="Arbejdstid" icon={<ScheduleIcon />} iconPosition="start" />
        <Tab value="leave" label="Ferie og fri" icon={<EventAvailableIcon />} iconPosition="start" />
        <Tab value="balance" label="Saldo" icon={<WalletIcon />} iconPosition="start" />
        {workforce.isHrAdmin && (
          <Tab
            value="approval"
            label={`Godkendelser (${approvals.length})`}
            icon={<CheckIcon />}
            iconPosition="start"
          />
        )}
      </Tabs>

      {tab === 'overview' && (
        <Overview
          balance={ownBalance}
          pendingWork={ownWork.filter((record) => record.status === 'pending').length}
          pendingLeave={ownLeave.filter((record) => record.status === 'pending').length}
          onOpen={(nextTab) => setTab(nextTab)}
        />
      )}

      {tab === 'work' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Registrer arbejdsdag
              </Typography>
              <TextField
                type="date"
                label="Dato"
                value={workDraft.date}
                onChange={(event) =>
                  setWorkDraft((current) => ({ ...current, date: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start"
                    value={workDraft.startTime}
                    onChange={(event) =>
                      setWorkDraft((current) => ({ ...current, startTime: event.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Slut"
                    value={workDraft.endTime}
                    onChange={(event) =>
                      setWorkDraft((current) => ({ ...current, endTime: event.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <TextField
                type="number"
                label="Pause i minutter"
                value={workDraft.breakMinutes}
                onChange={(event) =>
                  setWorkDraft((current) => ({
                    ...current,
                    breakMinutes: Number(event.target.value),
                  }))
                }
              />
              <TextField
                label="Bemærkning"
                value={workDraft.note}
                onChange={(event) =>
                  setWorkDraft((current) => ({ ...current, note: event.target.value }))
                }
                multiline
                minRows={2}
              />
              <Alert severity="info">
                Beregnet arbejdstid:{' '}
                <strong>
                  {calculateHours(
                    workDraft.startTime,
                    workDraft.endTime,
                    workDraft.breakMinutes,
                  ).toLocaleString('da-DK')}{' '}
                  timer
                </strong>
              </Alert>
              <Button variant="contained" onClick={saveWorkDay}>
                Gem arbejdsdag
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <RecordList
              title="Mine arbejdsdage"
              records={ownWork.map((record) => ({
                id: record.id,
                title: formatDate(record.date),
                detail: `${record.startTime}-${record.endTime} · ${record.hours.toLocaleString('da-DK')} timer`,
                status: record.status,
                comment: record.reviewerComment,
              }))}
            />
          </Grid>
        </Grid>
      )}

      {tab === 'leave' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Ansøg om ferie eller fri
              </Typography>
              <TextField
                select
                label="Type"
                value={leaveDraft.type}
                onChange={(event) =>
                  setLeaveDraft((current) => ({
                    ...current,
                    type: event.target.value as LeaveType,
                  }))
                }
              >
                {Object.entries(leaveTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Fra"
                value={leaveDraft.dateFrom}
                onChange={(event) =>
                  setLeaveDraft((current) => ({ ...current, dateFrom: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="Til"
                value={leaveDraft.dateTo}
                onChange={(event) =>
                  setLeaveDraft((current) => ({ ...current, dateTo: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Bemærkning"
                value={leaveDraft.note}
                onChange={(event) =>
                  setLeaveDraft((current) => ({ ...current, note: event.target.value }))
                }
                multiline
                minRows={2}
              />
              <Alert severity="info">
                Ansøgningen omfatter{' '}
                <strong>
                  {countWeekdays(leaveDraft.dateFrom, leaveDraft.dateTo)} arbejdsdage
                </strong>
                .
              </Alert>
              <Button variant="contained" onClick={saveLeaveRequest}>
                Send ansøgning
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <RecordList
              title="Mine ansøgninger"
              records={ownLeave.map((record) => ({
                id: record.id,
                title: leaveTypeLabels[record.type],
                detail: `${formatDate(record.dateFrom)}-${formatDate(record.dateTo)} · ${record.days} dage`,
                status: record.status,
                comment: record.reviewerComment,
              }))}
            />
          </Grid>
        </Grid>
      )}

      {tab === 'balance' && (
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Medarbejdersaldi
          </Typography>
          <Grid container spacing={2}>
            {(workforce.isHrAdmin ? workforce.balances : ownBalance ? [ownBalance] : []).map(
              (balance) => (
                <Grid key={balance.userId} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card sx={{ p: 2, borderLeft: '4px solid #34d399' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {balance.userName}
                    </Typography>
                    <Stack spacing={0.75} sx={{ my: 2 }}>
                      <BalanceLine label="Ferie" value={`${balance.vacationDays} dage`} />
                      <BalanceLine label="Fleks" value={`${balance.flexHours} timer`} />
                      <BalanceLine label="Feriefridage" value={`${balance.personalDays} dage`} />
                      <BalanceLine label="Omsorgsdage" value={`${balance.careDays} dage`} />
                    </Stack>
                    {workforce.isHrAdmin && (
                      <Button fullWidth variant="outlined" onClick={() => setBalanceDialog(balance)}>
                        Rediger saldo
                      </Button>
                    )}
                  </Card>
                </Grid>
              ),
            )}
          </Grid>
        </Stack>
      )}

      {tab === 'approval' && workforce.isHrAdmin && (
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Afventende godkendelser
          </Typography>
          {approvals.length === 0 && <Alert severity="success">Alt er behandlet.</Alert>}
          {approvals.map((record) => (
            <Card key={`${record.area}-${record.id}`} sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ sm: 'center' }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {record.userName} · {record.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {'date' in record
                      ? formatDate(record.date)
                      : `${formatDate(record.dateFrom)}-${formatDate(record.dateTo)}`}
                    {'hours' in record ? ` · ${record.hours} timer` : ` · ${record.days} dage`}
                  </Typography>
                </Box>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setReview({ area: record.area, id: record.id, status: 'rejected' })}
                >
                  Afvis
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => setReview({ area: record.area, id: record.id, status: 'approved' })}
                >
                  Godkend
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(review)} onClose={() => setReview(null)} fullWidth maxWidth="sm">
        <DialogTitle>{review?.status === 'approved' ? 'Godkend registrering' : 'Afvis registrering'}</DialogTitle>
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

      <BalanceDialog
        balance={balanceDialog}
        onClose={() => setBalanceDialog(null)}
        onSave={(field, value) => {
          if (balanceDialog) workforce.updateBalance(balanceDialog.userId, field, value);
        }}
      />
    </Stack>
  );
}

function Overview({
  balance,
  pendingWork,
  pendingLeave,
  onOpen,
}: {
  balance?: EmployeeBalance;
  pendingWork: number;
  pendingLeave: number;
  onOpen: (tab: HrTab) => void;
}) {
  const items = [
    {
      label: 'Resterende ferie',
      value: `${balance?.vacationDays ?? 0} dage`,
      color: '#34d399',
      tab: 'balance' as const,
    },
    {
      label: 'Flekssaldo',
      value: `${balance?.flexHours ?? 0} timer`,
      color: '#60a5fa',
      tab: 'balance' as const,
    },
    {
      label: 'Arbejdstid afventer',
      value: pendingWork,
      color: '#ffd166',
      tab: 'work' as const,
    },
    {
      label: 'Ansøgninger afventer',
      value: pendingLeave,
      color: '#fb7185',
      tab: 'leave' as const,
    },
  ];
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 6, md: 3 }}>
          <Card
            onClick={() => onOpen(item.tab)}
            sx={{ p: 2, minHeight: 145, cursor: 'pointer', borderLeft: `4px solid ${item.color}` }}
          >
            <Typography sx={{ color: item.color, fontSize: 30, fontWeight: 900 }}>
              {item.value}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>{item.label}</Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function RecordList({
  title,
  records,
}: {
  title: string;
  records: Array<{
    id: string;
    title: string;
    detail: string;
    status: ApprovalStatus;
    comment?: string;
  }>;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        {title}
      </Typography>
      {records.length === 0 && <Alert severity="info">Ingen registreringer endnu.</Alert>}
      {records.map((record) => (
        <Card key={record.id} sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 900 }}>{record.title}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{record.detail}</Typography>
              {record.comment && (
                <Typography variant="body2" sx={{ color: 'warning.main', mt: 0.5 }}>
                  Kommentar: {record.comment}
                </Typography>
              )}
            </Box>
            <StatusChip status={record.status} />
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

function BalanceLine({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
    </Stack>
  );
}

function BalanceDialog({
  balance,
  onClose,
  onSave,
}: {
  balance: EmployeeBalance | null;
  onClose: () => void;
  onSave: (
    field: keyof Pick<
      EmployeeBalance,
      'vacationDays' | 'flexHours' | 'personalDays' | 'careDays'
    >,
    value: number,
  ) => void;
}) {
  const [field, setField] = useState<
    keyof Pick<EmployeeBalance, 'vacationDays' | 'flexHours' | 'personalDays' | 'careDays'>
  >('vacationDays');
  const [value, setValue] = useState(0);
  return (
    <Dialog open={Boolean(balance)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Rediger saldo · {balance?.userName}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Saldo"
            value={field}
            onChange={(event) => setField(event.target.value as typeof field)}
          >
            <MenuItem value="vacationDays">Ferie</MenuItem>
            <MenuItem value="flexHours">Flekstimer</MenuItem>
            <MenuItem value="personalDays">Feriefridage</MenuItem>
            <MenuItem value="careDays">Omsorgsdage</MenuItem>
          </TextField>
          <TextField
            type="number"
            label="Ny saldo"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuller</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave(field, value);
            onClose();
          }}
        >
          Gem saldo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('da-DK').format(new Date(`${value}T12:00:00`));
}
