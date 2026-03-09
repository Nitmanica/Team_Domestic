/**
 * API client for TrustRoute Escrow backend.
 * Uses VITE_API_URL (e.g. http://localhost:3001) and token from localStorage.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('trustroute_token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<T> {
  const { body, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : rest.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText || 'Request failed');
  return data as T;
}

// Auth
export type User = { id: number; email: string; role: string; full_name?: string; wallet_address?: string };
export type AuthResponse = { user: User; token: string };
export const auth = {
  register: (body: { email: string; password: string; role: string; fullName?: string; walletAddress?: string }) =>
    api<AuthResponse>('/register', { method: 'POST', body: { ...body, full_name: body.fullName, wallet_address: body.walletAddress } }),
  login: (email: string, password: string) =>
    api<AuthResponse>('/login', { method: 'POST', body: { email, password } }),
};

// Orders
export type Order = {
  id: number;
  order_id: string;
  customer_id: number;
  driver_id?: number;
  pickup_location?: string;
  drop_location?: string;
  cargo_category?: string;
  weight_kg?: number;
  vehicle_type?: string;
  distance_km?: number;
  amount_wei: string;
  amount_display?: string;
  status: string;
  escrow_tx_lock?: string;
  escrow_contract_address?: string;
  created_at: string;
  customer_name?: string;
  driver_name?: string;
};
export const orders = {
  create: (body: {
    pickup_location?: string;
    drop_location?: string;
    cargo_category?: string;
    weight_kg?: number;
    vehicle_type?: string;
    distance_km?: number;
    amount_wei: string;
    amount_display?: string;
  }) => api<Order>('/order', { method: 'POST', body }),
  get: (orderId: string) => api<Order>(`/order/${orderId}`),
  myCustomer: () => api<Order[]>('/orders/customer'),
  myDriver: () => api<Order[]>('/orders/driver'),
  available: () => api<Order[]>('/orders/available'),
  accept: (orderId: string) => api<Order>(`/order/${orderId}/accept`, { method: 'PATCH' }),
  all: () => api<Order[]>('/orders/all'),
};

// Escrow
export const escrow = {
  lock: (order_id: string) =>
    api<{ success: boolean; order_id: string; status: string; tx_hash?: string | null; message?: string }>('/escrow/lock', { method: 'POST', body: { order_id } }),
  release: (order_id: string) =>
    api<{ success: boolean; order_id: string; status: string; tx_hash?: string | null }>('/escrow/release', { method: 'POST', body: { order_id } }),
};

// Delivery
export const delivery = {
  proof: (body: { order_id: string; image_url?: string; gps_lat?: number; gps_lng?: number; notes?: string }) =>
    api<{ proof: unknown; order_id: string; status: string }>('/delivery/proof', { method: 'POST', body }),
  confirm: (order_id: string) =>
    api<{ success: boolean; order_id: string }>('/delivery/confirm', { method: 'POST', body: { order_id } }),
};

// Disputes
export type Dispute = { id: number; order_id: number; order_ref?: string; raised_by: number; reason?: string; status: string; amount_display?: string };
export const disputes = {
  create: (order_id: string, reason?: string) =>
    api<Dispute>('/dispute', { method: 'POST', body: { order_id, reason } }),
  list: () => api<Dispute[]>('/disputes'),
  resolve: (body: { dispute_id: number; resolution: string; resolution_notes?: string; penalty_amount_wei?: string }) =>
    api<Dispute>('/admin/dispute/resolve', { method: 'POST', body }),
};
