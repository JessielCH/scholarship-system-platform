"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      // Decode the JWT Payload (which is the middle part of the token)
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);

      setRole(payload.role || "STUDENT");
      setEmail(payload.email || "");
    } catch (e) {
      console.error("Invalid token", e);
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Welcome to your Dashboard
      </h1>
      
      <div className={`p-8 backdrop-blur rounded-xl max-w-2xl text-center border shadow-xl mb-6 ${role === 'ADMIN' ? 'bg-purple-900/30 border-purple-500 shadow-purple-500/50' : 'bg-white/10 border-white/20'}`}>
        <h2 className="text-3xl font-extrabold mb-2">
          {role === "ADMIN" ? "👋 ¡Hola, Admin!" : "👋 ¡Hola, Estudiante!"}
        </h2>
        <p className="text-gray-300 font-mono text-sm mb-4">{email}</p>
        
        {role === "ADMIN" ? (
          <p className="text-purple-300">Tienes acceso total al panel de control y revisión de becas.</p>
        ) : (
          <p className="text-blue-300">Puedes proceder a enviar tu solicitud de beca y revisar tus calificaciones.</p>
        )}
      </div>

      <div className="p-8 bg-white/10 backdrop-blur rounded-xl max-w-2xl text-center">
        <p className="text-lg text-gray-300">
          You are successfully logged in through the API Gateway (RS256). 
          The Frontend decoded your JWT to validate your identity securely.
        </p>
        <button 
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/");
          }}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
