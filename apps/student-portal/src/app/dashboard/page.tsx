'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../lib/api';
import { Timeline } from '../../components/Timeline';
import { BankUploadModal } from '../../components/BankUploadModal';
import { ContractUploadModal } from '../../components/ContractUploadModal';
import { FloatingChatbot } from '../../components/FloatingChatbot';
import { useState, useEffect } from 'react';
import { LogOut, FileText, CheckCircle2 } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [showBankModal, setShowBankModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'STUDENT' && user.role !== 'ADMIN'))) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Query to get scholarship status from API Gateway -> Saga Service or Document Service
  // For this implementation, we will fetch from academic or saga, but since identity might not have it all,
  // we'll mock the data fetching structure that points to our saga-service.
  const { data: scholarship, isLoading, refetch } = useQuery({
    queryKey: ['sagaStatus', user?.sub],
    queryFn: async () => {
      // In a real system we would fetch the specific user's saga state.
      // fetchWithAuth(`/saga/status/${user.sub}`)
      // For presentation we simulate the payload the Saga would return
      return {
        status: 'WAITING', // 'SELECTED', 'WAITING', 'VALIDATED', 'ACADEMIC_OK', 'APPROVED', 'DISBURSED', 'REJECTED'
        studentId: user?.sub,
        amount: 500,
        documents: [],
      };
    },
    enabled: !!user?.sub,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-uce-blue border-t-uce-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-uce-blue text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Universidad Central del Ecuador</h1>
          <h2 className="text-sm text-gray-300">Portal del Estudiante</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.email}</span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">¡Bienvenido a tu Beca!</h2>
          <p className="text-gray-500">
            Sigue los pasos a continuación para completar tu proceso y recibir el desembolso.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <Timeline currentStatus={scholarship?.status || 'SELECTED'} />
        </div>

        {/* Action Area depending on Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Acciones Requeridas</h3>
          
          {scholarship?.status === 'WAITING' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-4">
                <FileText className="text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-800">Faltan Documentos</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Para poder continuar con la validación de tu beca, necesitamos que subas tu 
                    certificado bancario. Una vez validado, se generará tu contrato.
                  </p>
                  <button 
                    onClick={() => setShowBankModal(true)}
                    className="mt-4 bg-uce-red hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                  >
                    Subir Certificado Bancario
                  </button>
                </div>
              </div>
            </div>
          )}

          {scholarship?.status === 'ACADEMIC_OK' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-4">
                <FileText className="text-blue-600 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-800">Contrato Listo para Firma</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Tu certificado fue validado y hemos generado tu contrato. Por favor, 
                    descárgalo, fírmalo y vuelve a subirlo aquí.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <button className="bg-white border border-uce-blue text-uce-blue hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
                      Descargar Contrato (PDF)
                    </button>
                    <button 
                      onClick={() => setShowContractModal(true)}
                      className="bg-uce-blue hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      Subir Contrato Firmado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(scholarship?.status === 'APPROVED' || scholarship?.status === 'DISBURSED') && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
              <CheckCircle2 className="mx-auto text-green-500 mb-2" size={48} />
              <h4 className="font-bold text-green-800 text-xl">¡Todo está listo!</h4>
              <p className="text-sm text-green-700 mt-2">
                Tu beca ha sido aprobada exitosamente por la Inteligencia Artificial y el Coordinador.
                {scholarship?.status === 'DISBURSED' && (
                  <span className="block mt-2 font-bold text-lg">Monto depositado: $ {scholarship.amount}</span>
                )}
              </p>
            </div>
          )}
          
          {scholarship?.status !== 'WAITING' && scholarship?.status !== 'ACADEMIC_OK' && scholarship?.status !== 'APPROVED' && scholarship?.status !== 'DISBURSED' && (
             <p className="text-gray-500 italic">No tienes acciones pendientes en este momento. Te notificaremos cuando haya actualizaciones.</p>
          )}

        </div>
      </main>

      <FloatingChatbot />

      {showBankModal && user?.sub && (
        <BankUploadModal 
          studentId={user.sub} 
          onClose={() => setShowBankModal(false)} 
          onSuccess={() => {
            setShowBankModal(false);
            refetch();
          }} 
        />
      )}

      {showContractModal && user?.sub && (
        <ContractUploadModal 
          studentId={user.sub} 
          onClose={() => setShowContractModal(false)} 
          onSuccess={() => {
            setShowContractModal(false);
            refetch();
          }} 
        />
      )}
    </div>
  );
}
