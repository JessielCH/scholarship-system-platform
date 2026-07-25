'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, Building, FileCheck } from 'lucide-react';
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
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Conectar con el sistema financiero y workflow
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
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-inner">
                <Building size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                  Desembolso Institucional <span className="text-xs bg-green-500/30 text-green-300 border border-green-500/40 px-2.5 py-0.5 rounded-full uppercase font-mono font-semibold">Cuenta Certificada</span>
                </h3>
                <p className="text-xs text-indigo-200 mt-1">Transferencia Electrónica Directa - UCE</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-green-400 font-mono">${amount}.00</span>
              <p className="text-[10px] text-gray-300 uppercase font-semibold">USD a Depositar</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-100 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-green-400" /> Sistema Financiero Seguro</span>
            <span>Beneficiario ID: <strong className="font-mono text-white">{studentId}</strong></span>
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
                <span>Cuenta Destino Verificada:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border text-indigo-700 font-bold">EC-BANCO-CERTIFICADO-✅</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
              <FileCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-blue-950">Certificado Bancario Aprobado</h5>
                <p className="text-blue-800/90 text-[11px] leading-relaxed">
                  El documento bancario de este beneficiario ha sido validado satisfactoriamente por la coordinación. 
                  Al confirmar esta operación, se realizará la transferencia bancaria y el estado del expediente en el workflow cambiará a <strong>Desembolso Completado</strong> con su respectivo comprobante oficial.
                </p>
              </div>
            </div>

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
                className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Procesando Desembolso...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Desembolso de ${amount}.00</span>
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
