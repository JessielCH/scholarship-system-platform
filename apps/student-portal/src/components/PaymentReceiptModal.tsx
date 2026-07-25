'use client';

import React from 'react';
import { ShieldCheck, Printer, Download, X, CheckCircle2, Award, FileText, Building } from 'lucide-react';
import { PaymentReceipt } from '../lib/receipts';

interface PaymentReceiptModalProps {
  receipt: PaymentReceipt;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Top Action Bar (Non-printable) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-uce-red" /> Comprobante Oficial de Desembolso
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Printer size={14} />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Receipt Printable Content */}
        <div className="p-8 overflow-y-auto space-y-6 font-sans text-slate-800" id="printable-receipt">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-uce-red text-white p-2 rounded-lg font-black text-sm uppercase tracking-tighter">
                  UCE
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase tracking-tight text-slate-900">Universidad Central del Ecuador</h3>
                  <p className="text-xs text-slate-600 font-semibold">Dirección General de Bienestar y Becas Universitarias</p>
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="inline-block bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded text-xs border border-green-300">
                COMIP-PAG-PAGADO
              </span>
              <p className="text-[11px] font-mono text-slate-500 mt-1">Ref: {receipt.transactionId}</p>
            </div>
          </div>

          {/* Title & Amount Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-6 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Concepto del Pago</p>
              <h4 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                <Award className="text-yellow-400 shrink-0" size={20} /> {receipt.type}
              </h4>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-[10px] text-indigo-300 uppercase font-semibold">Monto Desembolsado</p>
              <span className="text-3xl font-black text-green-400 font-mono">${receipt.amount}.00</span>
              <span className="text-xs text-slate-300 block">USD</span>
            </div>
          </div>

          {/* Detailed Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Beneficiario (ID Alumno)</span>
              <strong className="text-slate-900 font-mono text-sm block mt-0.5">{receipt.studentId}</strong>
              {receipt.studentEmail && <span className="text-slate-600 block mt-1">{receipt.studentEmail}</span>}
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Facultad y Carrera</span>
              <strong className="text-slate-900 font-sans text-sm block mt-0.5 truncate">{receipt.faculty || 'Ciencias Quirúrgicas / General'}</strong>
              <span className="text-slate-600 block mt-1 truncate">{receipt.career || 'Carrera Universitaria'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Fecha y Hora del Depósito</span>
              <strong className="text-slate-800 text-xs block mt-1">{receipt.date}</strong>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Referencia Cryptográfica Stripe</span>
              <strong className="font-mono text-indigo-700 text-xs block mt-1 truncate">{receipt.stripeReference}</strong>
            </div>
          </div>

          {/* Auditor Certification Box */}
          <div className="border-t border-dashed border-slate-300 pt-5 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Documento Verificado e Inmutable (Auditoría UCE)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Este comprobante ha sido autorizado electrónicamente por <strong>{receipt.coordinatorApproval}</strong> en cumplimiento con la normativa de becas y ayudas estudiantiles del Sistema de Gestión de Información Distribuida.
                </p>
              </div>
            </div>
          </div>

          {/* Footer signatures */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500 font-medium">
            <div>
              <span>Sistema Informático Universitario — UCE 2026</span>
            </div>
            <div className="text-right font-mono">
              <span>HASH: {receipt.transactionId.slice(-10)}-{receipt.stripeReference.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
