import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { supabase } from '../../services/supabaseClient';
import { supabaseConfiguration } from '../../services/supabaseConfig';

type TestState = 'idle' | 'testing' | 'ok' | 'login-required' | 'schema-missing' | 'error';

export function BackendSetupPanel() {
  const [testState, setTestState] = useState<TestState>('idle');
  const [testMessage, setTestMessage] = useState('');

  async function testConnection() {
    if (!supabase) {
      setTestState('error');
      setTestMessage(supabaseConfiguration.issue ?? 'Supabase er ikke konfigureret.');
      return;
    }

    setTestState('testing');
    setTestMessage('');
    const { error } = await supabase.from('portal_settings').select('id').limit(1);

    if (!error) {
      setTestState('ok');
      setTestMessage('Databasen svarer, og DriftPortal-skemaet er fundet.');
      return;
    }

    const message = error.message.toLowerCase();
    if (message.includes('could not find') || message.includes('does not exist')) {
      setTestState('schema-missing');
      setTestMessage('Forbindelsen virker, men databaseskemaet er ikke installeret endnu.');
      return;
    }
    if (
      message.includes('jwt') ||
      message.includes('permission') ||
      message.includes('row-level security')
    ) {
      setTestState('login-required');
      setTestMessage('Supabase svarer. Log ind med en rigtig bruger for at teste adgangsreglerne.');
      return;
    }
    setTestState('error');
    setTestMessage(error.message);
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Supabase og server
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Kontrollér forbindelsen, databasen og de serverfunktioner, som appen skal bruge.
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SetupCard
            icon={<VpnKeyIcon />}
            title="Offentlig forbindelse"
            status={supabaseConfiguration.isConfigured ? 'Klar' : 'Mangler'}
            color={supabaseConfiguration.isConfigured ? 'success' : 'warning'}
            detail={
              supabaseConfiguration.isConfigured
                ? `Projekt: ${supabaseConfiguration.projectRef}`
                : 'URL og public anon key skal indsættes.'
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SetupCard
            icon={<StorageIcon />}
            title="Database og Storage"
            status={testState === 'ok' ? 'Klar' : 'Ikke testet'}
            color={testState === 'ok' ? 'success' : 'default'}
            detail="Tabeller, adgangsregler og private filområder."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SetupCard
            icon={<CloudQueueIcon />}
            title="Serverfunktioner"
            status="Forberedt"
            color="info"
            detail="Sikker brugerinvitation, mails og kommende automatisering."
          />
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        startIcon={testState === 'testing' ? <CircularProgress size={18} /> : <RefreshIcon />}
        disabled={testState === 'testing'}
        onClick={() => void testConnection()}
        sx={{ alignSelf: { sm: 'flex-start' } }}
      >
        Test Supabase-forbindelse
      </Button>

      {!supabaseConfiguration.isConfigured && (
        <Alert severity="warning">
          {supabaseConfiguration.issue} Appen fortsætter sikkert i demo- og offline-tilstand.
        </Alert>
      )}
      {testMessage && (
        <Alert
          severity={
            testState === 'ok'
              ? 'success'
              : testState === 'login-required'
                ? 'info'
                : testState === 'schema-missing'
                  ? 'warning'
                  : 'error'
          }
          icon={testState === 'ok' ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
        >
          {testMessage}
        </Alert>
      )}
    </Stack>
  );
}

function SetupCard({
  icon,
  title,
  status,
  color,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  color: 'default' | 'success' | 'warning' | 'info';
  detail: string;
}) {
  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Typography sx={{ flex: 1, fontWeight: 900 }}>{title}</Typography>
          <Chip size="small" color={color} label={status} />
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {detail}
        </Typography>
      </Stack>
    </Card>
  );
}
