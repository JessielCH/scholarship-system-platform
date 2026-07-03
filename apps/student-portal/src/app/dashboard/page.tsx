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
      // Fetch rankings to see if student was awarded a scholarship
      const rankings = await fetchWithAuth('/v1/queries/academic/rankings');
      const myRanking = rankings?.find((r: any) => r.StudentID === user?.sub);

      if (!myRanking || !myRanking.Type) {
        return { status: 'NOT_BENEFICIARY', studentId: user?.sub };
      }

      let currentStatus = 'WAITING';
      let rejectionReason = '';
      try {
        const documents = await fetchWithAuth(`/documents/student/${user?.sub}`);
        if (documents && documents.length > 0) {
          // Get most recent document
          const latestDoc = documents[documents.length - 1];
          if (latestDoc.status === 'REJECTED') {
             currentStatus = 'REJECTED';
             rejectionReason = latestDoc.rejectionReason || 'Documento no válido.';
          } else if (latestDoc.status === 'APPROVED') {
             currentStatus = 'APPROVED'; // Or DISBURSED if saga is done, but we use APPROVED for now
          } else if (latestDoc.status === 'WAITING') {
             currentStatus = 'VALIDATING_DOC';
          }
        }
      } catch (e) {
        console.error("Error fetching documents", e);
      }

      // If they have a scholarship, we simulate the saga status for the UI demo
      return {
        status: currentStatus,
        rejectionReason: rejectionReason,
        studentId: user?.sub,
        amount: myRanking.Type === 'EXCELLENCE' ? 800 : 500,
        type: myRanking.Type,
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
        {scholarship?.status === 'NOT_BENEFICIARY' ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-12 text-center animate-in zoom-in-95">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hola, {user?.email}</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Lo sentimos, tras evaluar tus promedios y situación socioeconómica, 
              no resultaste beneficiario de una beca para el actual período académico.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 text-center animate-in fade-in">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">¡Hola, {user?.email}!</h2>
              <h3 className="text-xl font-bold text-uce-blue mb-2">¡Felicidades, ganaste la Beca {scholarship?.type === 'EXCELLENCE' ? 'por Excelencia' : 'por Vulnerabilidad'}!</h3>
              <p className="text-gray-500">
                Sigue los pasos a continuación para completar tu proceso y recibir el desembolso de ${scholarship?.amount}.
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

          {scholarship?.status === 'REJECTED' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-4">
                <FileText className="text-red-600 mt-1" />
                <div>
                  <h4 className="font-bold text-red-800">Documento Rechazado</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Tu documento fue revisado pero ha sido rechazado por el siguiente motivo: 
                    <br/><br/>
                    <strong className="bg-red-100 p-2 rounded block">{scholarship.rejectionReason}</strong>
                    <br/>
                    Por favor, sube el documento correcto para continuar con tu trámite.
                  </p>
                  <button 
                    onClick={() => setShowBankModal(true)}
                    className="mt-4 bg-uce-red hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                  >
                    Volver a Subir Certificado Bancario
                  </button>
                </div>
              </div>
            </div>
          )}

          {scholarship?.status === 'VALIDATING_DOC' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-4">
                <FileText className="text-blue-600 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-800">Documento en Revisión</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Hemos recibido tu documento correctamente. Actualmente está siendo revisado por el coordinador.
                    Te notificaremos cuando sea aprobado o si necesitas subirlo nuevamente.
                  </p>
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
          
          {scholarship?.status !== 'WAITING' && scholarship?.status !== 'VALIDATING_DOC' && scholarship?.status !== 'REJECTED' && scholarship?.status !== 'ACADEMIC_OK' && scholarship?.status !== 'APPROVED' && scholarship?.status !== 'DISBURSED' && (
             <p className="text-gray-500 italic">No tienes acciones pendientes en este momento. Te notificaremos cuando haya actualizaciones.</p>
          )}

        </div>
        </>
        )}
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
