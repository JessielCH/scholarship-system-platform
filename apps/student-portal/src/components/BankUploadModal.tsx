import React, { useState } from "react";
import { Check, UploadCloud, X, Loader2 } from "lucide-react";
import { fetchWithAuth } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BankUploadModal = ({ studentId, onClose, onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "BANK_CERT");
      formData.append("studentId", studentId);

      // Envia al gateway -> document-service
      return fetchWithAuth("/documents/upload", {
        method: "POST",
        body: formData, // fetchWithAuth will NOT set Content-Type so the browser sets it with boundary
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sagaStatus"] });
      onSuccess();
    },
    onError: (err: Error) => {
      setError(err.message || "Error al subir el documento");
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-800">Subir Certificado Bancario</h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
              <UploadCloud className="mx-auto text-gray-400 mb-4" size={40} />
              <p className="text-sm text-gray-600 mb-4">Haz clic para seleccionar o arrastra un PDF aquí</p>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-4 py-2 bg-uce-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
              >
                Seleccionar PDF
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900 line-clamp-1">{file.name}</p>
                  <p className="text-xs text-blue-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => setFile(null)} className="text-blue-500 hover:text-blue-700 p-1">
                  <X size={16} />
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-xs text-gray-600 text-center">
                La IA extraerá el número de cuenta automáticamente para validarlo.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => uploadMutation.mutate()}
                  disabled={uploadMutation.isPending}
                  className="flex-1 px-4 py-2 bg-uce-red text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-800 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 className="animate-spin" size={18} /> Subiendo...</>
                  ) : (
                    <><Check size={18} /> Confirmar Subida</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
