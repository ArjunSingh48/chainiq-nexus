import type { SupervisorRequest } from '@/data/supervisorMockData';

const STORE_KEY = 'proqai_supervisor_requests';

export function loadSupervisorRequests(): SupervisorRequest[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSupervisorRequests(requests: SupervisorRequest[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(requests));
  } catch {}
}

export function addSupervisorRequest(request: SupervisorRequest) {
  const existing = loadSupervisorRequests();
  if (existing.some((r) => r.id === request.id)) return;
  existing.unshift(request);
  saveSupervisorRequests(existing);
}

export function updateSupervisorRequestStatus(id: string, status: 'approved' | 'rejected') {
  const existing = loadSupervisorRequests();
  const updated = existing.map((r) => (r.id === id ? { ...r, status } : r));
  saveSupervisorRequests(updated);
}
