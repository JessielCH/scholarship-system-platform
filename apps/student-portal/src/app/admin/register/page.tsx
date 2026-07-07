"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserPlus, Lock } from "lucide-react";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data: unknown = await res.json();
        throw new Error((data as { message?: string }).message || "Registration failed");
      }

      router.push("/?admin_registered=true");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] transition-all duration-300 hover:shadow-[0_0_80px_rgba(236,72,153,0.4)] z-10">
        <div className="text-center mb-8">
          <div className="mx-auto bg-gradient-to-tr from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-sm">Admin Portal</h1>
          <p className="text-purple-200 mt-2 font-medium">Register administrative access</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center backdrop-blur-sm flex items-center gap-2 justify-center">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1 flex items-center gap-2">
              <UserPlus size={16} /> Admin Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-gray-500 backdrop-blur-sm"
              placeholder="admin@uce.edu.ec"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1 flex items-center gap-2">
              <Lock size={16} /> Secure Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-gray-500 backdrop-blur-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(168,85,247,0.3)] transform transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-white/10"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering...
              </span>
            ) : "Provision Access"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-purple-300/70 border-t border-white/10 pt-6">
          System access is strictly monitored. <br/>
          <Link href="/" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors inline-block mt-2 hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
