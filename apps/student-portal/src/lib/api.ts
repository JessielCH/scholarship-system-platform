export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const method = (options.method || 'GET').toUpperCase();
  if (!headers.has('Content-Type') && !(options.body instanceof FormData) && method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || 'Error en la petición al servidor');
  }

  return response.json();
}

export async function fetchBlobWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    throw new Error('Error al descargar el archivo');
  }
  return response.blob();
}
