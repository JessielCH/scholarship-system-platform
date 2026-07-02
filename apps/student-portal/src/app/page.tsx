'use client';

import { useQuery } from '@tanstack/react-query';

// Mock API call for the happy path
const fetchSagaStatus = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'FUNDS_ALLOCATED',
        studentName: 'Juan Pérez',
        amount: 500,
        currency: 'USD',
      });
    }, 2000);
  });
};

function Skeleton() {
  return (
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['sagaStatus'],
    queryFn: fetchSagaStatus,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="bg-uce-blue p-6 rounded-t-xl text-white text-center">
          <h1 className="text-3xl font-bold">Universidad Central del Ecuador</h1>
          <h2 className="text-xl mt-2 text-uce-gold">Sistema de Becas - Flujo Feliz</h2>
        </div>
        
        <div className="bg-white border-x border-b border-gray-200 p-8 shadow-lg rounded-b-xl">
          <h3 className="text-2xl font-semibold text-uce-red mb-6 border-b-2 border-uce-red inline-block pb-2">
            Estado de Solicitud de Beca
          </h3>

          {isLoading ? (
            <div className="mt-8 space-y-8">
              <Skeleton />
              <Skeleton />
            </div>
          ) : (
            <div className="space-y-6 text-gray-800 text-lg">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="font-semibold">Estudiante:</span>
                <span>{(data as any).studentName}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="font-semibold">Estado de Saga:</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  {(data as any).status}
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="font-semibold">Monto Desembolsado:</span>
                <span className="text-uce-blue font-bold text-xl">
                  ${(data as any).amount} {(data as any).currency}
                </span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Flujo completado exitosamente integrando <span className="font-semibold text-uce-blue">Spring State Machine (Sagas)</span> y <span className="font-semibold text-uce-red">NestJS (Pagos Stripe)</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
