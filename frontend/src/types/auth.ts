export interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Firm {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  firmId?: string | null;
  firm?: Firm | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: SafeUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  firmId?: string;
}
