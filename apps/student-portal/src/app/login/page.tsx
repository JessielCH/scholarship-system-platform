'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchWithAuth } from '../../lib/api';
import { useAuth } from '../providers/auth-provider';
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Debe ser un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginSchemaType>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginSchemaType>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: LoginSchemaType) => {
      return fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // The identity-service returns { access_token: "..." }
      if (data.access_token) {
        login(data.access_token);
      } else {
        setAuthError('Error en respuesta del servidor');
      }
    },
    onError: (error: Error) => {
      // Aplicando heurísticas de Nielsen:
      // #9: Ayudar a los usuarios a reconocer, diagnosticar y recuperarse de errores
      // #1: Visibilidad del estado del sistema
      if (error.message.includes('503') || error.message.toLowerCase().includes('failed to fetch')) {
        setAuthError('El servicio de autenticación está en mantenimiento en este momento (Error 503). Por favor, intenta nuevamente en unos minutos. Si el problema persiste, contacta a soporte@uce.edu.ec.');
      } else {
        setAuthError('Las credenciales ingresadas son incorrectas o hubo un problema de red. Verifica tu correo y contraseña e inténtalo de nuevo.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        newErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-uce-blue">
          Universidad Central del Ecuador
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema de Gestión de Becas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-uce-red">
          
          {authError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo Institucional
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="focus:ring-uce-red focus:border-uce-red block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                  placeholder="estudiante@uce.edu.ec"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="focus:ring-uce-red focus:border-uce-red block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-uce-red hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-uce-red transition-colors disabled:bg-red-400"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
