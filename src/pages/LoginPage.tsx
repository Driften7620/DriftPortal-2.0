import LockIcon from '@mui/icons-material/Lock';
import { Alert, Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fejlede');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoLogin() {
    signInDemo();
    navigate(from, { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card component="form" onSubmit={handleSubmit} sx={{ width: 'min(420px, 100%)', p: 3 }}>
        <Stack spacing={2.25}>
          <LockIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            DriftPortal 2.0
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Log ind med Supabase Auth, eller brug demo-login indtil miljøvariablerne er sat op.
          </Typography>
          {error && <Alert severity="warning">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <TextField
            label="Adgangskode"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          <Button variant="contained" size="large" type="submit" disabled={isSubmitting}>
            Log ind
          </Button>
          <Button onClick={() => navigate('/forgot-password')}>Glemt adgangskode?</Button>
          <Button variant="outlined" size="large" onClick={handleDemoLogin}>
            Fortsæt som demo-admin
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
