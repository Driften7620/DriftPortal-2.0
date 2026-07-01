import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HomeIcon from '@mui/icons-material/Home';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PasswordIcon from '@mui/icons-material/Password';
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
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { useState } from 'react';
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
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const { user, isDemoMode, signOut } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        pb: compact ? 'calc(80px + env(safe-area-inset-bottom))' : 3,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(7, 11, 18, 0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar
          sx={{
            gap: { xs: 0.5, md: 2 },
            minHeight: { xs: 64, md: 80 },
            px: { xs: 1.5, sm: 2, md: 3 },
          }}
        >
          <Box
            component="button"
            onClick={() => navigate('/')}
            aria-label="Gå til dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, md: 1.5 },
              bgcolor: 'transparent',
              border: 0,
              color: 'inherit',
              cursor: 'pointer',
              p: 0,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 18, md: 20 },
                borderRadius: 1,
                bgcolor: '#ef2b2d',
                boxShadow: 'inset 0 -8px 0 #05070b',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: '#00e5ff',
                fontWeight: 800,
                fontSize: { xs: '1.15rem', md: '1.5rem' },
              }}
            >
              Status
            </Typography>
            <Chip
              size="small"
              label="ONLINE"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
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

          <Stack
            direction="row"
            spacing={{ xs: 0, sm: 0.5, md: 1 }}
            sx={{ ml: 'auto', alignItems: 'center', flexShrink: 0 }}
          >
            <IconButton aria-label="Scan QR-kode">
              <QrCodeScannerIcon />
            </IconButton>
            <IconButton aria-label="Skift tema" onClick={colorMode.toggleMode}>
              {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {compact ? (
              <>
                <IconButton
                  aria-label="Åbn profilmenu"
                  onClick={(event) => setProfileAnchor(event.currentTarget)}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={() => setProfileAnchor(null)}
                >
                  <MenuItem disabled>
                    {user?.fullName ?? 'Bruger'}
                    {isDemoMode ? ' · demo' : ''}
                  </MenuItem>
                  {!isDemoMode && (
                    <MenuItem
                      onClick={() => {
                        setProfileAnchor(null);
                        navigate('/account/password');
                      }}
                    >
                      <ListItemIcon>
                        <PasswordIcon fontSize="small" />
                      </ListItemIcon>
                      Skift adgangskode
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      setProfileAnchor(null);
                      void signOut();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Log ud
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Chip
                icon={<AccountCircleIcon />}
                label={`${user?.fullName ?? 'Bruger'}${isDemoMode ? ' · demo' : ''}`}
                onClick={(event) => setProfileAnchor(event.currentTarget)}
                sx={{ fontWeight: 700, cursor: 'pointer' }}
              />
            )}
            {!compact && (
              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
              >
                <MenuItem disabled>
                  {user?.fullName ?? 'Bruger'}
                  {isDemoMode ? ' · demo' : ''}
                </MenuItem>
                {!isDemoMode && (
                  <MenuItem
                    onClick={() => {
                      setProfileAnchor(null);
                      navigate('/account/password');
                    }}
                  >
                    <ListItemIcon>
                      <PasswordIcon fontSize="small" />
                    </ListItemIcon>
                    Skift adgangskode
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setProfileAnchor(null);
                    void signOut();
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Log ud
                </MenuItem>
              </Menu>
            )}
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
            pt: 1,
            pb: 'calc(8px + env(safe-area-inset-bottom))',
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
