'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './providers/auth-provider';
import { PushNotifications } from '@/components/push-notifications';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PushNotifications />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
