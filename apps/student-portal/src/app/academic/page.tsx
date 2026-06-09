"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface StatusResult {
  error?: string;
  StudentID?: string;
  Faculty?: string;
  IsApproved?: boolean;
  Type?: string;
  Score?: number;
}

export default function AcademicEngineUI() {
  const router = useRouter();
  const [recordId, setRecordId] = useState("UID-000001");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Directory State
  const [directory, setDirectory] = useState<StatusResult[]>([]);
  const [facultyFilter, setFacultyFilter] = useState("");
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [dirLoading, setDirLoading] = useState(false);



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
        setResult({ error: "Application not found or not processed yet." });
      }
    } catch {
      setResult({ error: "Network error checking status." });
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
    } catch {
      alert("Error loading directory");
    }
    setDirLoading(false);
  };

  const filteredDirectory = directory.filter(item => onlyApproved ? item.IsApproved : true);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center relative">
          <button 
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            className="absolute right-0 top-0 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Sign Out
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl pt-4">
            UCE Academic Engine <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Core</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            SS-20 Module: Academic rankings and vulnerability calculations with Hexagonal Architecture and Goroutines.
          </p>
        </div>



        {/* Student Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Student Portal
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
                placeholder="Record ID (e.g. UID-000000)"
              />
              <button 
                onClick={checkStatus} 
                disabled={loading}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Check Status
              </button>
            </div>
            
            {result && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">System Response</h3>
                  {result.error ? (
                    <p className="text-red-500 font-medium flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {result.error}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Student ID</p>
                          <p className="font-semibold text-gray-900">{result.StudentID}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Faculty</p>
                          <p className="font-semibold text-gray-900">{result.Faculty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Scholarship Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.IsApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {result.IsApproved ? "APPROVED" : "DENIED"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Scholarship Type</p>
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
              Scholarship Directory
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Faculty (Optional)</label>
                <select 
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                >
                  <option value="">-- ALL FACULTIES --</option>
                  <option value="Agronomía">Agronomía</option>
                  <option value="Arquitectura y Urbanismo">Arquitectura y Urbanismo</option>
                  <option value="Artes">Artes</option>
                  <option value="Ciencias Administrativas">Ciencias Administrativas</option>
                  <option value="Ciencias Agrícolas">Ciencias Agrícolas</option>
                  <option value="Ciencias Biológicas">Ciencias Biológicas</option>
                  <option value="Ciencias de la Discapacidad">Ciencias de la Discapacidad</option>
                  <option value="Ciencias Económicas">Ciencias Económicas</option>
                  <option value="Ciencias Médicas">Ciencias Médicas</option>
                  <option value="Ciencias Psicológicas">Ciencias Psicológicas</option>
                  <option value="Ciencias Químicas">Ciencias Químicas</option>
                  <option value="Ciencias Sociales y Humanas">Ciencias Sociales y Humanas</option>
                  <option value="Comunicación Social">Comunicación Social</option>
                  <option value="Cultura Física">Cultura Física</option>
                  <option value="Filosofía, Letras y Ciencias de la Educación">Filosofía, Letras y Ciencias de la Educación</option>
                  <option value="Ingeniería Ciencias Físicas y Matemática">Ingeniería Ciencias Físicas y Matemática</option>
                  <option value="Ingeniería en Geología, Minas, Petróleos y Ambiental">Ingeniería en Geología, Minas, Petróleos y Ambiental</option>
                  <option value="Ingeniería Química">Ingeniería Química</option>
                  <option value="Jurisprudencia, Ciencias Políticas y Sociales">Jurisprudencia, Ciencias Políticas y Sociales</option>
                  <option value="Medicina Veterinaria y Zootecnia">Medicina Veterinaria y Zootecnia</option>
                  <option value="Odontología">Odontología</option>
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
                <label htmlFor="onlyApproved" className="ml-2 text-gray-700 font-medium">Only Approved</label>
              </div>
              <button 
                onClick={loadDirectory} 
                disabled={dirLoading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {dirLoading ? "Loading..." : "Load Directory"}
              </button>
            </div>

            {filteredDirectory.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scholarship Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDirectory.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.StudentID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Faculty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{(row.Score || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.IsApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {row.IsApproved ? "APPROVED" : "DENIED"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{row.Type || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredDirectory.length > 100 && (
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 text-center border-t border-gray-200">
                    Showing top 100 results out of {filteredDirectory.length} total.
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
