const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export async function getApplications({ page = 1, limit = 5, status = '' } = {}, signal) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);

  const res = await fetch(`${API_URL}/applications?${params}`, { signal });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}
