import { createTheme, type PaletteMode } from '@mui/material/styles';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: '#00e5ff' },
      secondary: { main: '#ffd166' },
      success: { main: '#34d399' },
      warning: { main: '#fbbf24' },
      error: { main: '#ff6b6b' },
      background: {
        default: isDark ? '#070b12' : '#f4f7fb',
        paper: isDark ? '#101722' : '#ffffff',
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      h1: { fontWeight: 800, letterSpacing: 0 },
      h2: { fontWeight: 800, letterSpacing: 0 },
      h3: { fontWeight: 800, letterSpacing: 0 },
      button: { fontWeight: 700, textTransform: 'none' },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: '1px solid rgba(148, 163, 184, 0.18)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { minHeight: 44 },
        },
      },
    },
  });
}
