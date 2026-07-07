'use client';

import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, ArrowLeft, CreditCard, Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Mock data for payments
  const pendingFees = [
    { id: 'FEE-001', description: 'Matrícula Semestre Actual', amount: 150.00, dueDate: '2026-08-15', status: 'PENDING' }
  ];

  const paymentHistory = [
    { id: 'PAY-092', description: 'Matrícula Semestre Anterior', amount: 150.00, date: '2026-02-10', method: 'Tarjeta de Crédito', status: 'COMPLETED' },
    { id: 'PAY-051', description: 'Certificado de Notas', amount: 5.50, date: '2025-11-20', method: 'Transferencia', status: 'COMPLETED' }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-uce-blue border-t-uce-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-uce-blue text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-blue-800 rounded-full transition-colors flex items-center">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Universidad Central del Ecuador</h1>
            <h2 className="text-sm text-gray-300">Gestión de Pagos</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:inline">{user?.email}</span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 mt-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="text-uce-blue" />
              Portal de Pagos
            </h2>
            <p className="text-gray-500 mt-1">Revisa tus obligaciones financieras y tu historial de pagos.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-uce-blue text-uce-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock size={16} />
            Pagos Pendientes
            {pendingFees.length > 0 && (
              <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold">
                {pendingFees.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-uce-blue text-uce-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText size={16} />
            Historial de Pagos
          </button>
        </div>

        {/* Tab Content: Pending */}
        {activeTab === 'pending' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {pendingFees.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
                <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                <h3 className="text-xl font-bold text-gray-800">¡Al día!</h3>
                <p className="text-gray-500 mt-2">No tienes valores pendientes por pagar en este momento.</p>
              </div>
            ) : (
              pendingFees.map((fee) => (
                <div key={fee.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-semibold">Pendiente</span>
                      <span className="text-gray-400 text-sm font-mono">{fee.id}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{fee.description}</h4>
                    <p className="text-sm text-gray-500">Vence: <span className="font-medium text-gray-700">{fee.dueDate}</span></p>
                  </div>
                  <div className="flex flex-col md:items-end gap-3">
                    <span className="text-2xl font-black text-gray-900">${fee.amount.toFixed(2)}</span>
                    <button className="bg-uce-blue hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm w-full md:w-auto">
                      Pagar Ahora <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                    <th className="p-4 font-semibold whitespace-nowrap">Referencia</th>
                    <th className="p-4 font-semibold">Descripción</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Fecha</th>
                    <th className="p-4 font-semibold">Método</th>
                    <th className="p-4 font-semibold text-right">Monto</th>
                    <th className="p-4 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-mono text-gray-500">{payment.id}</td>
                      <td className="p-4 text-sm font-medium text-gray-800">{payment.description}</td>
                      <td className="p-4 text-sm text-gray-600">{payment.date}</td>
                      <td className="p-4 text-sm text-gray-600">{payment.method}</td>
                      <td className="p-4 text-sm font-bold text-gray-900 text-right">${payment.amount.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                          <CheckCircle size={12} /> Pagado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paymentHistory.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No hay historial de pagos disponible.
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
