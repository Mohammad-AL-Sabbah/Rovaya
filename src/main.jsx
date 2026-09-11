// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import './index.css';
import { AppRoutes } from './Routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = createTheme({
  dir: 'rtl',
  primaryColor: 'rovaya',
  fontFamily: 'Tajawal, sans-serif',
  headings: {
    fontFamily: 'Tajawal, sans-serif',
  },
  colors: {
    // لون ROVAYA الأخضر الخاص
    rovaya: [
      '#E8F8F1',
      '#B8ECD4',
      '#87E0B7',
      '#57D49A',
      '#27C48E', // اللون الأساسي
      '#1FA878',
      '#178D62',
      '#0F714C',
      '#075636',
      '#003B20',
    ],
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <AppRoutes />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);