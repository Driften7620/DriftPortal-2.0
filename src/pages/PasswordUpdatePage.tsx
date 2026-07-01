import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PasswordIcon from '@mui/icons-material/Password';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearPasswordUpdateRedirect } from '../services/authRedirect';
import { supabase } from '../services/supabaseClient';

interface PasswordUpdatePageProps {
  recovery?: boolean;
}

export function PasswordUpdatePage({ recovery = false }: PasswordUpdatePageProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isReady, setIsReady] = useState(!recovery);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!recovery) return;
    if (!supabase) {
      setError('Supabase er ikke konfigureret.');
      return;
    }

    let isMounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted || !session) return;
      setIsReady(true);
      setError('');
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) {
        setIsReady(true);
        return;
      }

      const urlError = readUrlError();
      setError(urlError ?? 'Linket er udløbet eller ugyldigt. Bed om et nyt link.');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [recovery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase er ikke konfigureret.');
      return;
    }
    if (password.length < 10) {
      setError('Adgangskoden skal være på mindst 10 tegn.');
      return;
    }
    if (password !== confirmation) {
      setError('De to adgangskoder er ikke ens.');
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setIsComplete(true);
  }

  function continueToPortal() {
    if (recovery) {
      clearPasswordUpdateRedirect();
      return;
    }
    navigate('/', { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card
        component={isComplete ? 'div' : 'form'}
        onSubmit={isComplete ? undefined : handleSubmit}
        sx={{ width: 'min(460px, 100%)', p: { xs: 2.5, sm: 3.5 } }}
      >
        <Stack spacing={2.25}>
          {isComplete ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 46 }} />
          ) : (
            <PasswordIcon color="primary" sx={{ fontSize: 46 }} />
          )}
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {isComplete
              ? 'Adgangskoden er gemt'
              : recovery
                ? 'Vælg adgangskode'
                : 'Skift adgangskode'}
          </Typography>

          {isComplete ? (
            <>
              <Alert severity="success">
                Din nye adgangskode er aktiv. Du kan nu fortsætte til DriftPortal.
              </Alert>
              <Button variant="contained" size="large" onClick={continueToPortal}>
                Fortsæt til DriftPortal
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ color: 'text.secondary' }}>
                Brug mindst 10 tegn. En lang adgangskode er både stærkere og lettere at huske.
              </Typography>
              {error && <Alert severity="warning">{error}</Alert>}
              <TextField
                required
                autoFocus
                disabled={!isReady}
                label="Ny adgangskode"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label={showPassword ? 'Skjul adgangskode' : 'Vis adgangskode'}
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                required
                disabled={!isReady}
                label="Gentag adgangskode"
                type={showPassword ? 'text' : 'password'}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
              />
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={!isReady || isSubmitting}
              >
                Gem adgangskode
              </Button>
              {!recovery && (
                <Button onClick={() => navigate(-1)} disabled={isSubmitting}>
                  Annuller
                </Button>
              )}
            </>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

function readUrlError() {
  const hashParameters = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const description =
    new URLSearchParams(window.location.search).get('error_description') ??
    hashParameters.get('error_description');
  return description ? decodeURIComponent(description.replace(/\+/g, ' ')) : null;
}
