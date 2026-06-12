"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AcademicStatus {
  final_score: number;
  scholarship_type: string;
  gpa: number;
  vulnerability_score: number;
}

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

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(payload.role || "STUDENT");
      setEmail(payload.email || "");
    } catch (e) {
      console.error("Invalid token", e);
      router.push("/");
    }
  }, [router]);

  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        const sub = payload.sub; // UUID

        const res = await fetch(`/api/v1/queries/academic/status?record_id=${sub}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
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
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Welcome to your Dashboard
      </h1>
      
      <div className={`p-8 backdrop-blur rounded-xl max-w-2xl text-center border shadow-xl mb-6 w-full ${role === 'ADMIN' ? 'bg-purple-900/30 border-purple-500 shadow-purple-500/50' : 'bg-white/10 border-white/20'}`}>
        <h2 className="text-3xl font-extrabold mb-2">
          {role === "ADMIN" ? "👋 ¡Hola, Admin!" : "👋 ¡Hola, Estudiante!"}
        </h2>
        <p className="text-gray-300 font-mono text-sm mb-4">{email}</p>
        
        {role === "ADMIN" ? (
          <p className="text-purple-300">Tienes acceso total al panel de control y revisión de becas.</p>
        ) : (
          <div className="text-blue-300 mt-4">
            <h3 className="text-xl font-bold mb-4 text-white">Tu Estado Académico</h3>
            {loadingStatus ? (
              <p>Cargando tu información...</p>
            ) : academicStatus ? (
              <div className="grid grid-cols-2 gap-4 text-left bg-black/40 p-6 rounded-lg border border-white/10">
                <p className="text-gray-400">Puntaje Final:</p>
                <p className="font-mono text-green-400 font-bold">{academicStatus.final_score.toFixed(2)}</p>
                <p className="text-gray-400">Estado de Beca:</p>
                <p className="font-bold text-blue-400">{academicStatus.scholarship_type || 'PROCESANDO'}</p>
                <p className="text-gray-400">Promedio (GPA):</p>
                <p className="font-mono">{academicStatus.gpa}</p>
                <p className="text-gray-400">Vulnerabilidad:</p>
                <p className="font-mono">{academicStatus.vulnerability_score}</p>
              </div>
            ) : (
              <p className="text-yellow-400">Tu expediente aún no ha sido procesado o no existe.</p>
            )}
          </div>
        )}
      </div>

      <div className="p-8 bg-white/10 backdrop-blur rounded-xl max-w-2xl text-center">
        <p className="text-lg text-gray-300">
          You are successfully logged in through the API Gateway (RS256). 
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
