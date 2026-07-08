'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './providers/auth-provider';
import { PushNotifications } from '../components/PushNotifications';
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <PushNotifications />
      </AuthProvider>
    </QueryClientProvider>
  );
}
