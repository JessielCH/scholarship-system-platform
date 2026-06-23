"use client";

import React, { useState } from 'react';

export default function DocumentUploadDropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !studentId) {
      setMessage("Please provide both Student ID and a Document.");
      return;
    }

    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);

    try {
      const response = await fetch("http://localhost:8084/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ Document uploaded securely (AES-256 Encrypted).");
        setFile(null);
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (error) {
      setMessage("❌ Network error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Upload Required Documents</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-cyan-200 mb-2">Student ID</label>
        <input 
          type="text" 
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500"
          placeholder="e.g. UCE-2026-001"
        />
      </div>

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-cyan-500/50 rounded-2xl p-10 text-center cursor-pointer hover:bg-cyan-500/5 transition-all group"
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className="w-12 h-12 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-cyan-100 font-medium text-lg">
            {file ? file.name : "Drag & drop or click to browse"}
          </p>
          <p className="text-sm text-gray-400 mt-2">Maximum file size: 10MB</p>
        </label>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transform hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Encrypting & Uploading...
            </span>
          ) : "Upload Document"}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-xl text-center font-medium ${message.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
