/**
 * API utility for making requests to the backend
 * Uses relative URLs to work with the Vite proxy
 */

const API_BASE = '/api';

export interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { token, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Only set Content-Type if body is not FormData
  // FormData should NOT have Content-Type set (browser sets it automatically with boundary)
  if (!(fetchOptions.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else {
    // Remove Content-Type for FormData so browser can set it properly
    headers.delete('Content-Type');
  }
  
  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;
  
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
}

export async function apiGet(endpoint: string, token?: string) {
  return apiFetch(endpoint, {
    method: 'GET',
    token,
  });
}

export async function apiPost(
  endpoint: string,
  data?: Record<string, unknown> | FormData,
  token?: string
) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
    token,
  });
}

export async function apiPut(
  endpoint: string,
  data?: Record<string, unknown> | FormData,
  token?: string
) {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
    token,
  });
}

export async function apiDelete(endpoint: string, token?: string) {
  return apiFetch(endpoint, {
    method: 'DELETE',
    token,
  });
}
