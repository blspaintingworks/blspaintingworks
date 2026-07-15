export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_BASE = `${BACKEND_URL}/api`;

// Helper for making authenticated requests
export async function apiRequest(path: string, options: RequestInit = {}) {
  // Ensure cookies are sent
  options.credentials = 'include';
  
  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed: ${res.status}`);
  }
  return res.json().catch(() => ({}));
}
