import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Alert, Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPasswordUpdateRedirectUrl } from '../services/authRedirect';
import { supabase } from '../services/supabaseClient';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase er ikke konfigureret.');
      return;
    }

    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getPasswordUpdateRedirectUrl(),
    });
    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setIsSent(true);
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card
        component={isSent ? 'div' : 'form'}
        onSubmit={isSent ? undefined : handleSubmit}
        sx={{ width: 'min(440px, 100%)', p: { xs: 2.5, sm: 3.5 } }}
      >
        <Stack spacing={2.25}>
          <MarkEmailReadIcon color="primary" sx={{ fontSize: 44 }} />
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Nulstil adgangskode
          </Typography>

          {isSent ? (
            <>
              <Alert severity="success">
                Hvis emailadressen findes, er der sendt et sikkert link til at vælge en ny
                adgangskode.
              </Alert>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/login', { replace: true })}
              >
                Tilbage til login
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ color: 'text.secondary' }}>
                Indtast din emailadresse. Du modtager et link, hvis adressen findes i systemet.
              </Typography>
              {error && <Alert severity="warning">{error}</Alert>}
              <TextField
                required
                autoFocus
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <Button variant="contained" size="large" type="submit" disabled={isSubmitting}>
                Send nulstillingslink
              </Button>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/login', { replace: true })}
              >
                Tilbage
              </Button>
            </>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
