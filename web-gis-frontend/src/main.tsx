import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AppShell } from './components/layout/AppShell';
import { RequireAuth } from './components/layout/RequireAuth';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MapPage } from './pages/MapPage';
import { PlotsPage } from './pages/PlotsPage';
import { PublicPucPage } from './pages/PublicPucPage';
import { TracePage } from './pages/TracePage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/puc/:puc', element: <PublicPucPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'map', element: <MapPage /> },
          { path: 'plots', element: <PlotsPage /> },
          { path: 'trace', element: <TracePage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);

