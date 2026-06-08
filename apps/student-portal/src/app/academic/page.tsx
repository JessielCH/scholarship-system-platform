"use client";
import { useState } from "react";

export default function AcademicEngineUI() {
  const [recordId, setRecordId] = useState("UID-000000");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8081/api/v1/academic/seed", {
        method: "POST",
        headers: { "X-User-Role": "ADMIN" },
      });
      const data = await res.json();
      alert(data.message || "Operación exitosa");
    } catch (e) {
      alert("Error conectando con Academic Engine");
    }
    setLoading(false);
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8081/api/v1/academic/process", {
        method: "POST",
        headers: { "X-User-Role": "ADMIN" },
      });
      const data = await res.json();
      alert(data.message || "Procesamiento completado");
    } catch (e) {
      alert("Error conectando con Academic Engine");
    }
    setLoading(false);
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8081/api/v1/academic/status?record_id=${recordId}`, {
        method: "GET",
        headers: { "X-User-Role": "STUDENT" },
      });
      if (res.ok) {
        setResult(await res.json());
      } else {
        setResult({ error: "Postulación no encontrada o no procesada aún." });
      }
    } catch (e) {
      setResult({ error: "Error de red consultando el estado." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Motor Académico <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">UCE</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Módulo SS-20: Cálculos de rankings académicos y vulnerabilidad con Arquitectura Hexagonal y Goroutines.
          </p>
        </div>

        {/* Admin Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Panel de Administrador (Coordinación UCE)
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-600">Simulación del flujo de procesamiento de miles de estudiantes de forma concurrente.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleSeed} 
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition duration-200 border border-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                1. Poblar BD (10k registros de prueba)
              </button>
              <button 
                onClick={handleProcess} 
                disabled={loading}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                2. Calcular Rankings (Goroutines)
              </button>
            </div>
          </div>
        </div>

        {/* Student Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Panel del Estudiante
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
                placeholder="ID de Registro (ej. UID-000000)"
              />
              <button 
                onClick={checkStatus} 
                disabled={loading}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Consultar Resultado
              </button>
            </div>
            
            {result && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Respuesta del Sistema</h3>
                  {result.error ? (
                    <p className="text-red-500 font-medium flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {result.error}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Estudiante ID</p>
                          <p className="font-semibold text-gray-900">{result.StudentID}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Facultad</p>
                          <p className="font-semibold text-gray-900">{result.Faculty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Estado de Beca</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.IsApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {result.IsApproved ? "APROBADA" : "DENEGADA"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Tipo de Beca</p>
                          <p className="font-semibold text-indigo-600">{result.Type || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
