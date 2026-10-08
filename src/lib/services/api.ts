export const API_URL = (import.meta.env?.VITE_API_URL || 'https://api.18-225-234-22.sslip.io/api/v1').replace(/\/$/, '');
const CLIENT_KEY = 'portfolio:client-id';
export class APIError extends Error {
  constructor(public status: number, message: string, public retryAfter = 0) { super(message); }
}
export function clientID(): string {
  const stored = window.localStorage.getItem(CLIENT_KEY);
  if (stored && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(stored) && stored !== '00000000-0000-0000-0000-000000000000') return stored;
  const id = crypto.randomUUID();
  window.localStorage.setItem(CLIENT_KEY, id);
  return id;
}
export async function api<T>(path: string, method = 'GET', body?: unknown, privateData = true): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const headers: Record<string, string> = {};
    if (privateData) headers['X-Client-ID'] = clientID();
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(API_URL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
    if (response.status === 204) return undefined as T;
    const payload = await response.json();
    if (!response.ok) {
      const retryAfter = Number(response.headers.get('Retry-After')) || 0;
      throw new APIError(response.status, response.status === 429 ? `Espera ${retryAfter || 60} segundos antes de volver a intentar.` : payload.error?.message || 'No se pudo completar la solicitud.', retryAfter);
    }
    return payload.data as T;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error('No se pudo conectar con el servidor. Vuelve a intentar.');
  } finally { clearTimeout(timeout); }
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.';
}
