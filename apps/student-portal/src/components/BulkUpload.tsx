'use client';

import { useState } from 'react';
import * as xlsx from 'xlsx';
import { UploadCloud, CheckCircle2, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/api';

interface ExcelRow {
  ID: string;
  Email: string;
  Nombres: string;
  Apellidos: string;
  Facultad: string;
  Semestre: number;
  Promedio: number;
  PuntajeVulnerabilidad: number;
}

export function BulkUpload() {
  const [data, setData] = useState<ExcelRow[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<'pending' | 'success' | 'error'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const processFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMsg('');
    setErrorMsg('');
    setAiAnalysis('pending');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = xlsx.utils.sheet_to_json(ws) as Record<string, unknown>[];

        // Simulate AI validating format
        setTimeout(() => {
          if (parsedData.length > 0 && 'Email' in parsedData[0] && 'Promedio' in parsedData[0]) {
            setData(parsedData as unknown as ExcelRow[]);
            setAiAnalysis('success');
          } else {
            setData(null);
            setAiAnalysis('error');
          }
        }, 800);
      } catch (err) {
        setAiAnalysis('error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const uploadMutation = useMutation({
    mutationFn: async (rows: ExcelRow[]) => {
      // 1. Bulk Register Users
      const users = rows.map(r => ({
        id: r.ID,
        email: r.Email,
        role: 'STUDENT'
      }));
      
      await fetchWithAuth('/auth/bulk-register', {
        method: 'POST',
        body: JSON.stringify({
          defaultPassword: 'student123',
          users
        })
      });

      // 2. Bulk Insert Academic Records
      const records = rows.map(r => ({
        ID: r.ID,
        StudentID: r.ID,
        Email: r.Email,
        Faculty: r.Facultad,
        Career: r.Facultad + ' General',
        Semester: r.Semestre,
        GPA: r.Promedio,
        VulnerabilityScore: r.PuntajeVulnerabilidad
      }));

      await fetchWithAuth('/v1/commands/academic/bulk-record', {
        method: 'POST',
        body: JSON.stringify({ records })
      });
    },
    onSuccess: () => {
      setSuccessMsg(`Se han insertado ${data?.length} registros correctamente.`);
      setData(null);
      setIsProcessing(false);
      
      // Force refresh of the admin dashboard records
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (err: Error | unknown) => {
      setErrorMsg((err as Error).message || 'Error al procesar la carga.');
      setIsProcessing(false);
    }
  });

  const handleImport = () => {
    if (!data) return;
    setIsProcessing(true);
    uploadMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Carga Masiva de Estudiantes</h3>
          <p className="text-sm text-gray-500 mt-1">Sube un archivo Excel (.xlsx) para crear múltiples cuentas y registros académicos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {/* AI Instructions Panel */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-uce-blue"></div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm text-uce-blue">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Asistente IA de Validación</h4>
                <p className="text-xs text-blue-800 mt-1 mb-3">
                  Para procesar la carga, el sistema utiliza IA para reconocer automáticamente las columnas. Asegúrate de incluir:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['ID', 'Email', 'Nombres', 'Apellidos', 'Facultad', 'Semestre', 'Promedio', 'PuntajeVulnerabilidad'].map(col => (
                    <span key={col} className="px-2 py-1 bg-white border border-blue-200 text-blue-700 text-[10px] font-mono rounded font-bold">{col}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={processFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-gray-100 text-gray-500 rounded-full">
                <UploadCloud size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Arrastra tu Excel aquí</p>
                <p className="text-xs text-gray-400 mt-1">o haz clic para explorar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Status and Preview */}
          {aiAnalysis === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm font-medium animate-in zoom-in-95">
              <AlertCircle size={18} className="text-red-600" />
              La IA detectó que el formato no es válido o faltan columnas obligatorias (Ej. Email, Promedio).
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm font-medium mt-4 animate-in zoom-in-95">
              <AlertCircle size={18} className="text-red-600" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 text-sm font-medium mb-4 animate-in zoom-in-95">
              <CheckCircle2 size={18} className="text-green-600" />
              {successMsg}
            </div>
          )}

          {aiAnalysis === 'success' && data && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <span className="text-sm font-medium">Formato validado exitosamente. Se encontraron <strong className="font-bold">{data.length}</strong> registros.</span>
                </div>
                <button 
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="bg-uce-blue hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />} 
                  {isProcessing ? 'Procesando...' : 'Iniciar Importación'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="px-4 py-3">ID / Email</th>
                        <th className="px-4 py-3">Estudiante</th>
                        <th className="px-4 py-3">Facultad</th>
                        <th className="px-4 py-3">Métricas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-gray-800">{row.ID}</div>
                            <div className="text-xs text-gray-500">{row.Email}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{row.Apellidos}, {row.Nombres}</td>
                          <td className="px-4 py-3 text-xs">{row.Facultad} <span className="block text-gray-400">Sem. {row.Semestre}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 text-xs font-mono">
                              <span className="text-green-700">GPA: {row.Promedio}</span>
                              <span className="text-orange-700">Vuln: {row.PuntajeVulnerabilidad}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.length > 5 && (
                  <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 font-medium border-t border-gray-200">
                    Mostrando 5 de {data.length} registros
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
