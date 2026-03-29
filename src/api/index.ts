import type {
  LoginRequest,
  LoginResponse,
  CreateClientRequest,
  CreateClientResponse,
  ClientsResponse,
  StatsResponse,
  ServerConfigResponse,
} from '../types';

const API_BASE = '/api/v1';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.error('Response not OK:', response.status, response.statusText);
    let errorMessage: string;
    try {
      const error = await response.json();
      console.error('Error JSON:', error);
      errorMessage = error.message || error.error || `HTTP ${response.status}`;
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      try {
        errorMessage = await response.text();
        console.error('Error text:', errorMessage);
      } catch (textError) {
        console.error('Failed to get text:', textError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  console.log('Login attempt:', credentials.username);
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse<LoginResponse>(response);
}

export async function getClients(): Promise<ClientsResponse> {
  const token = getToken();
  console.log('getClients, token exists:', !!token);
  const response = await fetch(`${API_BASE}/clients`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<ClientsResponse>(response);
}

export async function createClient(
  data: CreateClientRequest
): Promise<CreateClientResponse> {
  console.log('createClient:', data);
  const response = await fetch(`${API_BASE}/client`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<CreateClientResponse>(response);
}

export async function getStats(): Promise<StatsResponse> {
  console.log('getStats');
  const response = await fetch(`${API_BASE}/stats`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<StatsResponse>(response);
}

export async function getServerConfig(): Promise<ServerConfigResponse> {
  console.log('getServerConfig');
  const response = await fetch(`${API_BASE}/server-config`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<ServerConfigResponse>(response);
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}
