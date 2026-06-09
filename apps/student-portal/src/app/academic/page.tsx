"use client";
import { useState } from "react";

export default function AcademicEngineUI() {
  const [recordId, setRecordId] = useState("UID-000001");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Directory State
  const [directory, setDirectory] = useState<any[]>([]);
  const [facultyFilter, setFacultyFilter] = useState("");
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [dirLoading, setDirLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/commands/academic/seed", {
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
      const res = await fetch("/api/v1/commands/academic/process", {
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
      const res = await fetch(`/api/v1/queries/academic/status?record_id=${recordId}`, {
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

  const loadDirectory = async () => {
    setDirLoading(true);
    try {
      let url = "/api/v1/queries/academic/rankings";
      if (facultyFilter) {
        url += `?faculty=${encodeURIComponent(facultyFilter)}`;
      }
      const res = await fetch(url, {
        method: "GET",
        headers: { "X-User-Role": "ADMIN" },
      });
      if (res.ok) {
        const data = await res.json();
        setDirectory(data || []);
      }
    } catch (e) {
      alert("Error cargando el directorio");
    }
    setDirLoading(false);
  };

  const filteredDirectory = directory.filter(item => onlyApproved ? item.IsApproved : true);

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

        {/* Directory Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Directorio de Becas (Coordinación)
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Facultad (Opcional)</label>
                <select 
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                >
                  <option value="">Todas las facultades</option>
                  <option value="Artes">Artes</option>
                  <option value="Ciencias Médicas">Ciencias Médicas</option>
                  <option value="Ingeniería Ciencias Físicas y Matemática">Ingeniería Ciencias Físicas y Matemática</option>
                  <option value="Jurisprudencia, Ciencias Políticas y Sociales">Jurisprudencia, Ciencias Políticas y Sociales</option>
                </select>
              </div>
              <div className="flex items-center pb-3">
                <input 
                  type="checkbox" 
                  id="onlyApproved" 
                  checked={onlyApproved}
                  onChange={(e) => setOnlyApproved(e.target.checked)}
                  className="h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="onlyApproved" className="ml-2 text-gray-700 font-medium">Solo Aprobados</label>
              </div>
              <button 
                onClick={loadDirectory} 
                disabled={dirLoading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {dirLoading ? "Cargando..." : "Cargar Directorio"}
              </button>
            </div>

            {filteredDirectory.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facultad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Beca</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDirectory.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.StudentID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Faculty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{row.Score.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.IsApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {row.IsApproved ? "APROBADO" : "DENEGADO"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{row.Type || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredDirectory.length > 100 && (
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 text-center border-t border-gray-200">
                    Mostrando primeros 100 resultados de {filteredDirectory.length} totales.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
