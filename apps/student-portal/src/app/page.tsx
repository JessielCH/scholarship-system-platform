'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers/auth-provider';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-uce-blue border-t-uce-red rounded-full animate-spin"></div>
        <p className="mt-4 text-uce-blue font-semibold">Cargando Sistema de Becas...</p>
      </div>
    </main>
  );
}
