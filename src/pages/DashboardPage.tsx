import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Card, CardActionArea, Chip, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { dashboardMetrics, driftModules } from '../data/modules';
import { canAccessModule } from '../features/auth/roleAccess';

const statusLabel = {
  ok: 'Klar',
  warning: 'Kræver fokus',
  critical: 'Alarm',
  planned: 'Planlagt',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const visibleModules = driftModules.filter((module) => canAccessModule(user, module.id));

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: '#fff', mb: 1 }}>
          God formiddag, {user?.fullName ?? 'bruger'}!
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 20 }}>
          Hvad vil du arbejde med?
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {dashboardMetrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderLeft: `4px solid ${metric.tone}` }}>
              <Typography sx={{ color: metric.tone, fontWeight: 800, fontSize: 32 }}>
                {metric.value}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {metric.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {visibleModules.map((module) => {
          const Icon = module.icon;
          return (
            <Grid key={module.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: { xs: 184, md: 210 },
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
                  <Stack spacing={1.25} alignItems="center">
                    <Icon sx={{ fontSize: 44, color: module.accent }} />
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

      <Button
        endIcon={<ArrowForwardIcon />}
        variant="contained"
        size="large"
        onClick={() => navigate('/module/rundering')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Fortsæt med Rundering
      </Button>
    </Stack>
  );
}
