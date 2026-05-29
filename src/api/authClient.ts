const AUTH_URL = import.meta.env.VITE_AUTH_BASE_URL ?? 'http://localhost:8081';

export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${AUTH_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `Error ${response.status}`);
  }
  return await response.json() as Promise<T>;
}
