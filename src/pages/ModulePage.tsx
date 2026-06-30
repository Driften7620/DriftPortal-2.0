import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConstructionIcon from '@mui/icons-material/Construction';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Box, Button, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { driftModules } from '../data/modules';
import { canAccessModule } from '../features/auth/roleAccess';
import { FacilityServicePage } from '../modules/facility/FacilityServicePage';
import { MineOpgaverPage } from '../modules/facility/MineOpgaverPage';
import { MaalerLogPage } from '../modules/maalerlog/MaalerLogPage';
import { RunderingPage } from '../modules/rundering/RunderingPage';

export function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const module = driftModules.find((item) => item.id === moduleId);

  if (!module) return <Navigate to="/" replace />;
  if (!canAccessModule(user, module.id)) return <Navigate to="/" replace />;

  if (module.id === 'maalerlog') return <MaalerLogPage />;
  if (module.id === 'rundering') return <RunderingPage />;
  if (module.id === 'facility-service') return <FacilityServicePage />;
  if (module.id === 'mine-opgaver') return <MineOpgaverPage />;

  const Icon = module.icon;

  return (
    <Stack spacing={3}>
      <Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Tilbage til oversigt
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            border: `2px solid ${module.accent}`,
            bgcolor: `${module.accent}14`,
          }}
        >
          <Icon sx={{ color: module.accent, fontSize: 42 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ color: module.accent }}>
            {module.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 18 }}>{module.description}</Typography>
        </Box>
        <Chip label={`${module.sprint} · ${module.status}`} sx={{ fontWeight: 800 }} />
      </Stack>

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ConstructionIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Klar til portering
            </Typography>
          </Stack>
          <Typography sx={{ color: 'text.secondary' }}>
            Dette modul er oprettet som en React-side og koblet på routeren. Næste sprint flytter
            funktionerne fra den nuværende `index.html` ind i services, hooks og komponenter.
          </Typography>
          <Divider />
          <Typography sx={{ fontWeight: 800 }}>Funktioner der skal bevares fra den gamle app:</Typography>
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
            {module.legacyCoverage.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" startIcon={<QrCodeScannerIcon />}>
              Scan QR-kode
            </Button>
            <Button variant="outlined">Se historik</Button>
            <Button variant="outlined">Åbn indstillinger</Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
