import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BoltIcon from '@mui/icons-material/Bolt';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { dashboardAlerts, dashboardSignals, dashboardTasks } from '../data/dashboard';
import { dashboardMetrics, driftModules } from '../data/modules';
import { canAccessModule } from '../features/auth/roleAccess';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const visibleModules = driftModules.filter((module) => canAccessModule(user, module.id));
  const priorityModules = visibleModules.filter((module) =>
    ['maalerlog', 'rundering', 'facility-service', 'lagerstyring', 'hr', 'tid'].includes(module.id),
  );
  const visibleAlerts = dashboardAlerts.filter((alert) => canAccessModule(user, alert.moduleId));
  const visibleTasks = dashboardTasks.filter((task) => canAccessModule(user, task.moduleId));
  const completedModules = visibleModules.filter((module) => module.status !== 'planned').length;
  const progressValue = Math.round((completedModules / Math.max(visibleModules.length, 1)) * 100);

  return (
    <Stack spacing={3.5}>
      <Card
        sx={{
          p: { xs: 2.25, md: 3 },
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'rgba(10, 15, 25, 0.82)',
          borderColor: 'rgba(0, 229, 255, 0.34)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 85% 20%, rgba(0,229,255,.18), transparent 26rem), radial-gradient(circle at 10% 80%, rgba(52,211,153,.12), transparent 24rem)',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={2.25} sx={{ position: 'relative' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ color: '#fff', mb: 1 }}>
                God formiddag, {user?.fullName ?? 'bruger'}!
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: { xs: 18, md: 20 }, fontWeight: 700 }}>
                DriftPortal 2.0 er online. Her er det vigtigste lige nu.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button variant="contained" startIcon={<QrCodeScannerIcon />}>
                Scan QR
              </Button>
              <Button variant="outlined" startIcon={<SearchIcon />}>
                Søg
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            {dashboardSignals.map((signal) => (
              <Grid key={signal.label} size={{ xs: 12, md: 4 }}>
                <Card sx={{ p: 2, bgcolor: 'rgba(15, 23, 42, 0.68)', borderColor: `${signal.tone}55` }}>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: 12 }}>
                    {signal.label}
                  </Typography>
                  <Typography sx={{ color: signal.tone, fontWeight: 900, fontSize: { xs: 28, md: 32 } }}>
                    {signal.value}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>{signal.helper}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Card>

      <Grid container spacing={2}>
        {dashboardMetrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderLeft: `4px solid ${metric.tone}` }}>
              <Typography sx={{ color: metric.tone, fontWeight: 800, fontSize: 32 }}>{metric.value}</Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>{metric.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <NotificationsActiveIcon sx={{ color: '#ff6b6b' }} />
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Prioriterede hændelser
                </Typography>
                <Chip label={`${visibleAlerts.length} aktive`} size="small" sx={{ ml: 'auto', fontWeight: 800 }} />
              </Stack>
              <Stack spacing={1.25}>
                {visibleAlerts.map((alert) => (
                  <CardActionArea key={alert.id} onClick={() => navigate(`/module/${alert.moduleId}`)} sx={{ borderRadius: 2 }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          alert.severity === 'critical'
                            ? 'rgba(255, 107, 107, 0.12)'
                            : alert.severity === 'warning'
                              ? 'rgba(251, 191, 36, 0.1)'
                              : 'rgba(0, 229, 255, 0.08)',
                        border: '1px solid rgba(148, 163, 184, 0.16)',
                      }}
                    >
                      <WarningAmberIcon
                        sx={{
                          color:
                            alert.severity === 'critical'
                              ? '#ff6b6b'
                              : alert.severity === 'warning'
                                ? '#fbbf24'
                                : '#00e5ff',
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 900 }}>{alert.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {alert.moduleName} · {alert.detail}
                        </Typography>
                      </Box>
                      <Chip label={alert.time} size="small" sx={{ fontWeight: 800 }} />
                      <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                    </Stack>
                  </CardActionArea>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <TaskAltIcon sx={{ color: '#34d399' }} />
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Dagens opgaver
                </Typography>
              </Stack>
              <Stack spacing={1.2}>
                {visibleTasks.map((task) => (
                  <Stack
                    key={task.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.72)' }}
                  >
                    <AccessTimeIcon sx={{ color: task.status === 'waiting' ? '#ffd166' : '#00e5ff' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#fff', fontWeight: 800 }}>{task.title}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {task.owner} · frist {task.due}
                      </Typography>
                    </Box>
                    <Button size="small" onClick={() => navigate(`/module/${task.moduleId}`)}>
                      Åbn
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.25, height: '100%', borderColor: 'rgba(0,229,255,.28)' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CloudSyncIcon sx={{ color: '#00e5ff' }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Sprintstatus
                </Typography>
              </Stack>
              <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {completedModules} af {visibleModules.length} moduler er oprettet i React-skallen.
              </Typography>
              <LinearProgress variant="determinate" value={progressValue} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Næste datalag: MålerLog, Rundering og Dashboard-statistik fra Supabase.
              </Typography>
            </Stack>
          </Card>
        </Grid>
        {priorityModules.slice(0, 2).map((module) => {
          const Icon = module.icon;
          return (
            <Grid key={module.id} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  p: 2.25,
                  height: '100%',
                  borderColor: `${module.accent}88`,
                  bgcolor: 'rgba(15, 23, 42, 0.74)',
                }}
              >
                <Stack spacing={1.5}>
                  <Icon sx={{ fontSize: 38, color: module.accent }} />
                  <Typography variant="h5" sx={{ color: module.accent, fontWeight: 900 }}>
                    {module.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>{module.description}</Typography>
                  <Button onClick={() => navigate(`/module/${module.id}`)} endIcon={<ChevronRightIcon />}>
                    Åbn modul
                  </Button>
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Stack direction="row" spacing={1.25} alignItems="center">
        <BoltIcon sx={{ color: '#00e5ff' }} />
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Moduler
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>

      <Grid container spacing={2}>
        {visibleModules.map((module) => {
          const Icon = module.icon;
          return (
            <Grid key={module.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: { xs: 168, md: 190 },
                  bgcolor: 'rgba(15, 23, 42, 0.74)',
                  borderColor: module.accent,
                  boxShadow: `inset 0 0 0 1px ${module.accent}33`,
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/module/${module.id}`)}
                  sx={{
                    height: '100%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Stack spacing={1.1} alignItems="center">
                    <Icon sx={{ fontSize: 40, color: module.accent }} />
                    <Typography variant="h6" sx={{ color: module.accent, fontWeight: 800, lineHeight: 1.15 }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {module.description}
                    </Typography>
                    {module.badge && (
                      <Chip
                        icon={<WarningAmberIcon />}
                        label={module.badge}
                        size="small"
                        sx={{
                          bgcolor: '#ff6b6b',
                          color: '#fff',
                          fontWeight: 800,
                          '& .MuiChip-icon': { color: '#fff' },
                        }}
                      />
                    )}
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
