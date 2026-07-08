'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../lib/api';
import { useState, useEffect } from 'react';
import { LogOut, Search, FileCheck, UserCheck, ShieldAlert } from 'lucide-react';

import { BulkUpload } from '../../components/BulkUpload';

interface RankingScore {
  RecordID: string;
  StudentID: string;
  Faculty: string;
  Career: string;
  Score: number;
  Type: string;
  IsTopTenPercent: boolean;
  IsApproved: boolean;
}

interface DocumentData {
  id: string;
  studentId: string;
  originalFilename: string;
  status: string;
}

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'revision' | 'upload'>('revision');
  const [visibleCount, setVisibleCount] = useState(50); // Pagination limit for performance

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF'))) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch real records from Academic Engine
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['adminRecords'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/v1/queries/academic/rankings');
        return (res || []) as RankingScore[];
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    refetchInterval: 15000,
  });

  // Fetch documents from Document Service
  const { data: documents = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ['adminDocuments'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/documents/all');
        return (res || []) as DocumentData[];
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    refetchInterval: 15000,
  });

  const filteredDocs = records.filter((doc: RankingScore) => {
    if (!doc.Type) return false; // Hide students without scholarship
    
    const matchSearch = doc.StudentID?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFaculty = facultyFilter ? doc.Faculty === facultyFilter : true;
    
    const matchType = typeFilter ? doc.Type === typeFilter : true;
    
    return matchSearch && matchFaculty && matchType;
  });

  const uniqueFaculties = Array.from(new Set(records.map((r: RankingScore) => r.Faculty)));

  if (authLoading || isLoading || isDocsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-uce-blue border-t-uce-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="text-uce-red" /> Administración de Becas</h1>
          <h2 className="text-sm text-gray-400">Panel de Control UCE</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-gray-300">{user?.email}</span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 mt-8">
        
        {/* Ingestion & Metrics (Simplified) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full text-uce-blue">
              <UserCheck size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Expedientes Evaluados</p>
              <p className="text-3xl font-bold text-gray-800">{records.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-full text-green-600">
              <FileCheck size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Becas Aprobadas</p>
              <p className="text-3xl font-bold text-gray-800">
                {records.filter(r => r.Type).length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
             <button 
                onClick={async () => {
                  try {
                    await fetchWithAuth('/v1/commands/academic/process', { method: 'POST' });
                    queryClient.invalidateQueries({ queryKey: ['adminRecords'] });
                    alert('Datos calculados exitosamente. Actualizando vista...');
                  } catch (err) {
                    console.error(err);
                    alert('Error al calcular datos');
                  }
                }}
                className="bg-uce-blue hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition text-sm">
                + Cargar Datos (Ingest)
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab('revision')}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'revision' ? 'border-uce-blue text-uce-blue' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Revisión Documental
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'upload' ? 'border-uce-blue text-uce-blue' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Carga Masiva (Excel)
          </button>
        </div>

        {activeTab === 'upload' ? (
          <BulkUpload />
        ) : (
          /* Dossiers List */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-800">Expedientes Estudiantiles</h3>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por Cédula o ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uce-blue"
                />
              </div>
              <select 
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uce-blue"
              >
                <option value="">Todas las Facultades</option>
                {uniqueFaculties.map((f: string) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-uce-blue"
              >
                <option value="">Todos los Resultados</option>
                <option value="EXCELLENCE">Beca Excelencia</option>
                <option value="VULNERABILITY">Beca Vulnerabilidad</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredDocs.slice(0, visibleCount).map((doc: RankingScore) => {
              const studentDocs = documents.filter((d: DocumentData) => d.studentId === doc.StudentID);
              const pendingDoc = studentDocs.find((d: DocumentData) => d.status === 'WAITING');

              return (
              <div key={doc.RecordID} className="p-6 bg-gray-50 border border-gray-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden transition hover:shadow-md">
                <div className="mb-4 md:mb-0 space-y-1">
                  <p className="text-sm text-gray-500">Estudiante ID: <span className="font-mono text-gray-800 font-bold">{doc.StudentID}</span></p>
                  <p className="text-sm text-gray-500">Facultad: <span className="font-bold text-gray-800">{doc.Faculty}</span></p>
                  <p className="text-sm text-gray-500">Carrera: <span className="font-bold text-gray-800">{doc.Career}</span></p>
                  <p className="text-sm text-gray-500">Puntaje: <span className="font-bold text-gray-800">{doc.Score?.toFixed(2)}</span> <span className={`px-2 py-0.5 ml-2 rounded text-xs font-bold ${!doc.Type ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>({doc.Type || 'SIN BECA'})</span></p>
                  
                  {pendingDoc && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                       <p className="text-yellow-800 font-bold flex items-center gap-2 mb-2">
                         <FileCheck size={16} /> Documento subido: {pendingDoc.originalFilename} (Pendiente Revisión)
                       </p>
                       <div className="flex gap-2">
                         <button 
                           onClick={async () => {
                             try {
                               await fetchWithAuth(`/documents/admin/review/${pendingDoc.id}?status=APPROVED`, {
                                 method: 'PUT'
                               });
                               queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
                               alert('Documento Aprobado con éxito. Se iniciará el desembolso.');
                             } catch (err) {
                               console.error(err);
                               alert('Error al aprobar');
                             }
                           }}
                           className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition">
                           Aprobar
                         </button>
                         <button 
                           onClick={async () => {
                             const reason = prompt("Motivo de rechazo:");
                             if (reason) {
                               try {
                                 await fetchWithAuth(`/documents/admin/review/${pendingDoc.id}?status=REJECTED&reason=${encodeURIComponent(reason)}`, {
                                   method: 'PUT'
                                 });
                                 queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
                                 alert('Documento Rechazado');
                               } catch (err) {
                                 console.error(err);
                                 alert('Error al rechazar');
                               }
                             }
                           }}
                           className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition">
                           Rechazar
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )})}
            
            {filteredDocs.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setVisibleCount(c => c + 50)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-bold"
                >
                  Cargar Más
                </button>
              </div>
            )}

            {filteredDocs.length === 0 && (
              <p className="text-gray-500 text-center py-8">No se encontraron expedientes.</p>
            )}
          </div>
        </div>
        )}
      </main>

    </div>
  );
}
