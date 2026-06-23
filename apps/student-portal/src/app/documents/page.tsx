import DocumentUploadDropzone from "@/components/DocumentUploadDropzone";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 drop-shadow-sm">
          Secure Document Vault
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Upload your required documentation for the scholarship adjudication process. 
          All files are secured with <span className="text-cyan-400 font-semibold">Military-Grade AES-256 Encryption</span> before being stored in the UCE Private Cloud.
        </p>
      </div>
      
      <div className="w-full max-w-2xl">
        <DocumentUploadDropzone />
      </div>

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>Central University of Ecuador • Distributed Systems • Sprint 5</p>
      </div>
    </div>
  );
}
