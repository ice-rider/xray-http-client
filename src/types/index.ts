export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_in: number;
}

export interface Client {
  id: string;
  flow: string;
  email: string;
}

export interface CreateClientRequest {
  flow: string;
  client_name: string;
  email?: string;
}

export interface CreateClientResponse {
  id: string;
  flow: string;
  link: string;
}

export interface ClientStats {
  id: string;
  email: string;
  flow: string;
  uplink: number;
  downlink: number;
  total: number;
}

export interface ClientsResponse {
  clients: Client[];
}

export interface StatsResponse {
  clients: ClientStats[];
}
