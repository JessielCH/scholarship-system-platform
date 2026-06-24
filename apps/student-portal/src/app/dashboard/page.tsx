"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentUploadDropzone from "@/components/DocumentUploadDropzone";

interface AcademicStatus {
  Score: number;
  Type: string;
  IsApproved: boolean;
}

interface DocumentMetadata {
  id: string;
  studentId: string;
  idNumber: string;
  accountNumber: string;
  originalFilename: string;
  status: string;
  rejectionReason?: string;
  uploadedAt: string;
}

export default function Dashboard() {
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Admin states
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const fetchStatus = async (sub: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/v1/queries/academic/status?record_id=${sub}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAcademicStatus(data);
      } else {
        setAcademicStatus(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/documents/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error fetching docs", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(payload.role || "STUDENT");
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(payload.email || "");

      if (payload.role === "ADMIN") {
        fetchAllDocuments();
      } else {
        fetchStatus(payload.sub);
      }
    } catch (e) {
      console.error("Invalid token", e);
      router.push("/");
    }
   
  }, [router]);


  const handleReview = async (docId: string, status: string, reason?: string) => {
    try {
      const token = localStorage.getItem("token");
      let url = `/api/documents/admin/review/${docId}?status=${status}`;
      if (reason) url += `&reason=${encodeURIComponent(reason)}`;
      
      const res = await fetch(url, { 
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRejectModalOpen(false);
        setRejectReason("");
        fetchAllDocuments(); // Refresh list
      }
    } catch (err) {
      console.error("Error reviewing doc", err);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/documents/download/${docId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Download failed. Please try again.");
      }
    } catch (err) {
      console.error("Error downloading doc", err);
    }
  };

  // Filter docs for Admin
  const filteredDocs = documents.filter(doc => 
    doc.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.idNumber && doc.idNumber.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Welcome to your Dashboard
      </h1>
      
      <div className={`p-8 backdrop-blur rounded-xl max-w-4xl text-center border shadow-xl mb-6 w-full ${role === 'ADMIN' ? 'bg-purple-900/20 border-purple-500 shadow-purple-500/30' : 'bg-white/10 border-white/20'}`}>
        <h2 className="text-3xl font-extrabold mb-2">
          {role === "ADMIN" ? "👋 Welcome, Admin" : "👋 Welcome, Student"}
        </h2>
        <p className="text-gray-300 font-mono text-sm mb-4">{email}</p>
        
        {role === "ADMIN" ? (
          <div className="mt-8 text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Student Dossiers</h3>
              <input 
                type="text" 
                placeholder="Search by Student ID or Cédula..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="grid gap-6">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="p-6 bg-black/40 border border-purple-500/30 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
                  
                  {/* Visual Flag for WAITING */}
                  {doc.status === 'WAITING' && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                      🔔 Student uploaded documents!
                    </div>
                  )}

                  <div className="mb-4 md:mb-0 space-y-1">
                    <p className="text-sm text-gray-400">Student ID: <span className="font-mono text-white">{doc.studentId}</span></p>
                    <p className="text-sm text-gray-400">Cédula: <span className="font-mono text-white">{doc.idNumber || 'N/A'}</span></p>
                    <p className="text-sm text-gray-400">Account #: <span className="font-mono text-white">{doc.accountNumber || 'N/A'}</span></p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        doc.status === 'WAITING' ? 'bg-yellow-500/20 text-yellow-300' :
                        doc.status === 'VALIDATED' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleDownload(doc.id, doc.originalFilename)}
                      className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/50 rounded-lg hover:bg-blue-600/40 transition text-center text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      📄 View Bank Cert (PDF)
                    </button>
                    
                    {doc.status === 'WAITING' && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleReview(doc.id, 'VALIDATED')}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition text-sm font-bold"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => { setSelectedDocId(doc.id); setRejectModalOpen(true); }}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition text-sm font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredDocs.length === 0 && (
                <p className="text-gray-400 text-center py-8">No documents found.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-blue-300 mt-4">
            <h3 className="text-xl font-bold mb-4 text-white">Tu Estado Académico</h3>
            {loadingStatus ? (
              <p>Cargando tu información...</p>
            ) : academicStatus ? (
              <div className="grid grid-cols-2 gap-4 text-left bg-black/40 p-6 rounded-lg border border-white/10">
                <p className="text-gray-400">Puntaje Final:</p>
                <p className="font-mono text-green-400 font-bold">{(academicStatus.Score || 0).toFixed(2)}</p>
                <p className="text-gray-400">Estado de Beca:</p>
                <p className={`font-bold ${academicStatus.IsApproved ? 'text-blue-400' : 'text-red-400'}`}>
                  {academicStatus.IsApproved ? (academicStatus.Type || 'BECA APROBADA') : 'RECHAZADA'}
                </p>
              </div>
            ) : (
              <p className="text-yellow-400">Tu expediente aún no ha sido procesado o no existe.</p>
            )}
            
            {academicStatus?.IsApproved && (
              <div className="mt-8 border-t border-white/10 pt-8">
                <DocumentUploadDropzone />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        {role === "ADMIN" && (
          <button 
            onClick={() => router.push("/academic")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded font-bold transition text-white"
          >
            ← Back to Academic Engine
          </button>
        )}
        <button 
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/");
          }}
          className="px-4 py-2 bg-red-600/50 hover:bg-red-500 border border-red-500/50 rounded font-bold transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/50 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Reject Document</h3>
            <p className="text-sm text-gray-400 mb-4">Please provide a mandatory reason for rejecting this document so the student can fix it.</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 mb-4 min-h-[100px]"
              placeholder="E.g., Bank account number does not match the certificate..."
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReview(selectedDocId, 'REJECTED', rejectReason)}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
