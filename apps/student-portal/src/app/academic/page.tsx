"use client";
import { useState, useEffect } from "react";
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
  
  // Directory State
  const [directory, setDirectory] = useState<StatusResult[]>([]);
  const [dirLoading, setDirLoading] = useState(false);

  // Filter State
  const [searchId, setSearchId] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "EXCELLENCE" | "VULNERABILITY">("ALL");

  const loadDirectory = async () => {
    setDirLoading(true);
    try {
      let url = "/api/v1/queries/academic/rankings";
      if (facultyFilter) {
        url += `?faculty=${encodeURIComponent(facultyFilter)}`;
      }
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method: "GET",
        headers: { 
          "X-User-Role": "ADMIN",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
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

  // Auto-load on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDirectory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyFilter]);

  // Derived filtered directory
  const filteredDirectory = directory.filter((item) => {
    // 1. Search filter
    if (searchId && !item.StudentID?.toLowerCase().includes(searchId.toLowerCase())) {
      return false;
    }
    // 2. Tab filter
    if (activeTab === "EXCELLENCE" && item.Type !== "EXCELLENCE") {
      return false;
    }
    if (activeTab === "VULNERABILITY" && item.Type !== "VULNERABILITY") {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Academic Engine <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Command Center</span>
            </h1>
            <p className="mt-2 text-slate-400">
              Goroutines-powered Sub-millisecond Ranking Cache
            </p>
          </div>
          <button 
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            className="px-6 py-2 bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg"
          >
            Sign Out
          </button>
        </div>

        {/* Toolbar: Search, Filters & Tabs */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Search Bar */}
            <div className="md:col-span-5 relative group">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Search Student</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white placeholder-slate-500"
                  placeholder="e.g. student_500"
                />
              </div>
            </div>

            {/* Faculty Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Filter Faculty</label>
              <select 
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white appearance-none"
              >
                <option value="">-- Global Directory (All) --</option>
                <option value="Agronomía">Agronomía</option>
                <option value="Arquitectura y Urbanismo">Arquitectura y Urbanismo</option>
                <option value="Artes">Artes</option>
                <option value="Ciencias Administrativas">Ciencias Administrativas</option>
                <option value="Ciencias Agrícolas">Ciencias Agrícolas</option>
                <option value="Ciencias Biológicas">Ciencias Biológicas</option>
                <option value="Ciencias Económicas">Ciencias Económicas</option>
                <option value="Ciencias Médicas">Ciencias Médicas</option>
                <option value="Ciencias Psicológicas">Ciencias Psicológicas</option>
                <option value="Ciencias Químicas">Ciencias Químicas</option>
                <option value="Ingeniería Ciencias Físicas y Matemática">Ingeniería Físicas y Matemática</option>
                <option value="Ingeniería Química">Ingeniería Química</option>
                <option value="Jurisprudencia, Ciencias Políticas y Sociales">Jurisprudencia</option>
                <option value="Odontología">Odontología</option>
              </select>
            </div>

            {/* Reload Button */}
            <div className="md:col-span-3">
              <button 
                onClick={loadDirectory} 
                disabled={dirLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 focus:ring-offset-slate-900"
              >
                {dirLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                )}
                Sync State
              </button>
            </div>

          </div>

          {/* Tabs */}
          <div className="border-t border-slate-700 bg-slate-800/50">
            <div className="flex px-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`py-4 px-6 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === "ALL" ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                All Applications
              </button>
              <button
                onClick={() => setActiveTab("EXCELLENCE")}
                className={`py-4 px-6 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === "EXCELLENCE" ? "border-purple-400 text-purple-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                Academic Excellence
              </button>
              <button
                onClick={() => setActiveTab("VULNERABILITY")}
                className={`py-4 px-6 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === "VULNERABILITY" ? "border-pink-400 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                Socioeconomic Vulnerability
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-widest">Student ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-widest">Faculty</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-300 uppercase tracking-widest">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredDirectory.length > 0 ? (
                  filteredDirectory.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {row.StudentID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{row.Faculty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">
                        <span className="bg-slate-900 px-2 py-1 rounded text-cyan-300 border border-slate-700">
                          {(row.Score || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${row.IsApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {row.IsApproved ? "APPROVED" : "DENIED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        {row.Type === "EXCELLENCE" ? (
                          <span className="text-purple-400">EXCELLENCE</span>
                        ) : row.Type === "VULNERABILITY" ? (
                          <span className="text-pink-400">VULNERABILITY</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg">No students found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredDirectory.length > 100 && (
            <div className="bg-slate-900/80 px-6 py-3 border-t border-slate-700 text-center text-xs text-slate-500 font-mono">
              Showing top 100 results to optimize DOM rendering.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
