"use client";

import React, { useState, useEffect } from 'react';

interface DocumentMetadata {
  id: string;
  studentId: string;
  originalFilename: string;
  status: string;
  rejectionReason?: string;
  uploadedAt: string;
}

export default function DocumentUploadDropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [existingDocs, setExistingDocs] = useState<DocumentMetadata[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        const sub = payload.sub; // UUID of student
        setStudentId(sub);
        fetchDocuments(sub);
      } catch (e) {
        console.error("Invalid token", e);
        setLoadingDocs(false);
      }
    } else {
      setLoadingDocs(false);
    }
  }, []);

  const fetchDocuments = async (sub: string) => {
    try {
      const res = await fetch(`http://localhost:8084/api/documents/student/${sub}`);
      if (res.ok) {
        const data = await res.json();
        setExistingDocs(data);
      }
    } catch (error) {
      console.error("Error fetching docs", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type !== "application/pdf") {
        setMessage("❌ Only PDF files are allowed for the Bank Certificate.");
        return;
      }
      setFile(e.dataTransfer.files[0]);
      setMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type !== "application/pdf") {
        setMessage("❌ Only PDF files are allowed for the Bank Certificate.");
        return;
      }
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file || !studentId || !idNumber || !accountNumber) {
      setMessage("❌ Please fill in all fields (Cédula, Account Number) and provide the PDF Document.");
      return;
    }

    if (idNumber.length < 10) {
      setMessage("❌ Cédula must be at least 10 characters long.");
      return;
    }

    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);
    formData.append("idNumber", idNumber);
    formData.append("accountNumber", accountNumber);

    try {
      const response = await fetch("http://localhost:8084/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ Document uploaded securely (AES-256 Encrypted).");
        setFile(null);
        setIdNumber('');
        setAccountNumber('');
        fetchDocuments(studentId); // Refresh status
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (error) {
      setMessage("❌ Network error.");
    } finally {
      setUploading(false);
    }
  };

  if (loadingDocs) {
    return <div className="text-center text-cyan-200 animate-pulse">Loading secure vault...</div>;
  }

  const latestDoc = existingDocs.length > 0 ? existingDocs[existingDocs.length - 1] : null;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20">
      
      {/* Visibility of System Status (Heuristic #1) */}
      {latestDoc && latestDoc.status !== 'REJECTED' ? (
        <div className="text-center">
          <div className={`inline-block p-4 rounded-full mb-4 border ${latestDoc.status === 'VALIDATED' ? 'bg-green-500/20 border-green-500/50' : 'bg-yellow-500/20 border-yellow-500/50'}`}>
            <svg className={`w-12 h-12 ${latestDoc.status === 'VALIDATED' ? 'text-green-400' : 'text-yellow-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {latestDoc.status === 'VALIDATED' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {latestDoc.status === 'VALIDATED' ? 'Dossier Approved' : 'Under Review'}
          </h2>
          <p className="text-gray-300">
            {latestDoc.status === 'VALIDATED' 
              ? 'Your scholarship documents have been successfully verified.' 
              : 'Your documents are currently being verified by the administration. You will be notified of any changes.'}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Submit Bank Dossier</h2>
          
          {latestDoc && latestDoc.status === 'REJECTED' && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <h3 className="text-red-400 font-bold mb-1 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Submission Rejected
              </h3>
              <p className="text-red-200 text-sm">{latestDoc.rejectionReason || "Please review your documents and upload again."}</p>
            </div>
          )}

          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Student ID (Auto-completed)</label>
              <input 
                type="text" 
                value={studentId}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">ID Number (Cédula)</label>
              <input 
                type="text" 
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500"
                placeholder="e.g. 17XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Bank Account Number</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500"
                placeholder="Enter the account number written in the certificate"
              />
            </div>
          </div>

          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-cyan-500/5 transition-all group"
          >
            <input 
              type="file" 
              id="file-upload" 
              accept=".pdf"
              className="hidden" 
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className="w-10 h-10 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-cyan-100 font-medium text-base">
                {file ? file.name : "Upload Bank Certificate (PDF)"}
              </p>
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transform hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? "Encrypting & Uploading..." : "Submit Dossier"}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-center font-medium ${message.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
