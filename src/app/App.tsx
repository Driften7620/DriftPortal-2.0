import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { useColorMode } from '../hooks/useColorMode';
import { AppShell } from '../layouts/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ModulePage } from '../pages/ModulePage';
import { createAppTheme } from './theme';

export function App() {
  const colorMode = useColorMode();
  const theme = createAppTheme(colorMode.mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell colorMode={colorMode} />}>
                <Route index element={<DashboardPage />} />
                <Route path="/module/:moduleId" element={<ModulePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
