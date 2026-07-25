'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { saveReceipt, generateStripeHash, PaymentReceipt } from '../lib/receipts';

interface StripePaymentModalProps {
  studentId: string;
  studentName?: string;
  faculty?: string;
  career?: string;
  amount: number;
  type: string;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  studentId,
  studentName = "Estudiante UCE",
  faculty = "Ciencias y Tecnología",
  career = "Carrera General",
  amount,
  type,
  onClose,
  onSuccess,
}) => {
  const [apiKey, setApiKey] = useState('sk_test_51MzQ8GHL9z7QvX8K_UCE_DEV_KEY_2026');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.startsWith('sk_test_')) {
      setError('Por favor utiliza una clave de prueba válida de Stripe Connect (debe iniciar con sk_test_)');
      return;
    }
    setError('');
    setProcessing(true);

    // Simulate cryptographic negotiation with Stripe Connect and UCE Bank API
    setTimeout(() => {
      const txId = `TX-UCE-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      const newReceipt: PaymentReceipt = {
        transactionId: txId,
        studentId,
        studentEmail: `${studentId}@uce.edu.ec`,
        faculty,
        career,
        amount,
        currency: 'USD',
        type: type === 'EXCELLENCE' ? 'Beca por Excelencia Académica' : 'Beca de Apoyo Socioeconómico',
        date: new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'full', timeStyle: 'medium' }),
        stripeReference: generateStripeHash(),
        status: 'COMPLETED',
        coordinatorApproval: 'Coordinador de Bienestar Universitario & IA Auditor',
      };

      saveReceipt(newReceipt);
      setReceipt(newReceipt);
      setProcessing(false);
      setStep('success');
      onSuccess(newReceipt);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-inner">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                  Stripe Connect <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full uppercase font-mono">Modo Sandbox</span>
                </h3>
                <p className="text-xs text-indigo-200 mt-1">Desembolso automatizado y certificado</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-green-400 font-mono">${amount}.00</span>
              <p className="text-[10px] text-gray-300 uppercase font-semibold">USD Transferencia</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-100 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-green-400" /> Encriptación TLS 256-bit</span>
            <span>ID Beneficiario: <strong className="font-mono text-white">{studentId}</strong></span>
          </div>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Beneficiario:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{studentName} ({studentId})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tipo de Beca:</span>
                <span className="font-bold text-slate-900">{type === 'EXCELLENCE' ? 'Beca de Excelencia ($800)' : 'Beca Socioeconómica ($500)'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Facultad:</span>
                <span className="font-semibold text-slate-800">{faculty}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cuenta de Destino:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border text-indigo-700 font-medium">EC-BANCO-PICHINCHA-****9821</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                <span>Clave API de Stripe (Sandbox/Pruebas)</span>
                <span className="text-indigo-600 text-[11px] normal-case font-medium">Pre-cargada desde Entorno QA</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk_test_..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-800 outline-none transition"
                  disabled={processing}
                  required
                />
                <Lock size={14} className="absolute right-3 top-3 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Esta simulación valida la conexión webhooks y emite el comprobante oficial firmado que sirve como respaldo legal para el administrador y el alumno.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-slate-700 text-xs font-bold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Conectando con Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar y Desembolsar $ {amount}.00</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">¡Transferencia de Beca Completada!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Se ha procesado exitosamente el depósito por <strong>${amount}.00 USD</strong> en la cuenta del estudiante y se generó el respaldo digital para el sistema de auditoría UCE.
            </p>

            {receipt && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-1.5 font-mono text-slate-700 my-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">N° Comprobante:</span>
                  <strong className="text-indigo-600">{receipt.transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Stripe Ref:</span>
                  <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded">{receipt.stripeReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Estado:</span>
                  <span className="text-green-700 font-bold font-sans flex items-center gap-1"><CheckCircle2 size={12}/> Aprobado y Pagado</span>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md"
              >
                Finalizar y Ver Comprobante
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
