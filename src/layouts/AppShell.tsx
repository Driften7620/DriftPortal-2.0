import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HomeIcon from '@mui/icons-material/Home';
import LightModeIcon from '@mui/icons-material/LightMode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  AppBar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

interface AppShellProps {
  colorMode: {
    mode: PaletteMode;
    toggleMode: () => void;
  };
}

export function AppShell({ colorMode }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const compact = useMediaQuery('(max-width:720px)');
  const { user, isDemoMode, signOut } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', pb: compact ? 10 : 3 }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(7, 11, 18, 0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 72, md: 80 } }}>
          <Box
            component="button"
            onClick={() => navigate('/')}
            aria-label="Gå til dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: 'transparent',
              border: 0,
              color: 'inherit',
              cursor: 'pointer',
              p: 0,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 20,
                borderRadius: 1,
                bgcolor: '#ef2b2d',
                boxShadow: 'inset 0 -8px 0 #05070b',
              }}
            />
            <Typography variant="h5" sx={{ color: '#00e5ff', fontWeight: 800 }}>
              Status
            </Typography>
            <Chip
              size="small"
              label="ONLINE"
              sx={{
                color: '#00e5ff',
                bgcolor: 'rgba(0, 229, 255, 0.1)',
                fontWeight: 800,
                letterSpacing: 1,
              }}
            />
          </Box>

          {!compact && (
            <TextField
              size="small"
              placeholder="Søg i DriftPortal..."
              sx={{ ml: 'auto', width: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <Stack direction="row" spacing={1} sx={{ ml: compact ? 'auto' : 0 }}>
            <IconButton aria-label="Scan QR-kode">
              <QrCodeScannerIcon />
            </IconButton>
            <IconButton aria-label="Skift tema" onClick={colorMode.toggleMode}>
              {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Chip
              icon={<AccountCircleIcon />}
              label={`${user?.fullName ?? 'Bruger'}${isDemoMode ? ' · demo' : ''}`}
              onDelete={signOut}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ width: 'min(1180px, 100%)', mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        <Outlet />
      </Box>

      {compact && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            bgcolor: 'rgba(7, 11, 18, 0.94)',
            borderTop: '1px solid rgba(148, 163, 184, 0.16)',
            backdropFilter: 'blur(18px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            py: 1,
          }}
        >
          {[
            { label: 'Oversigt', icon: <HomeIcon />, to: '/' },
            { label: 'Søg', icon: <SearchIcon />, to: location.pathname },
            { label: 'Indst.', icon: <SettingsIcon />, to: '/module/administration' },
            { label: 'Skift', icon: <SwapHorizIcon />, to: '/' },
          ].map((item) => (
            <Box
              key={item.label}
              component="button"
              onClick={() => navigate(item.to)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25,
                color: '#94a3b8',
                bgcolor: 'transparent',
                border: 0,
                font: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {item.icon}
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
