import { CssBaseline, ThemeProvider } from '@mui/material';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { useColorMode } from '../hooks/useColorMode';
import { AppShell } from '../layouts/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { ModulePage } from '../pages/ModulePage';
import { PasswordUpdatePage } from '../pages/PasswordUpdatePage';
import { isPasswordUpdateRedirect } from '../services/authRedirect';
import { createAppTheme } from './theme';

export function App() {
  const colorMode = useColorMode();
  const theme = createAppTheme(colorMode.mode);
  const passwordUpdateRedirect = isPasswordUpdateRedirect();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <HashRouter>
          <Routes>
            {passwordUpdateRedirect ? (
              <Route path="*" element={<PasswordUpdatePage recovery />} />
            ) : (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/account/password" element={<PasswordUpdatePage />} />
                  <Route element={<AppShell colorMode={colorMode} />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="/module/:moduleId" element={<ModulePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </>
            )}
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
