const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── Token storage ──────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("anihub_token");
}

export function setToken(token: string): void {
  localStorage.setItem("anihub_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("anihub_token");
  localStorage.removeItem("anihub_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("anihub_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem("anihub_user", JSON.stringify(user));
}

// ── API calls ──────────────────────────────────────────

export async function apiRegister(
  email: string, username: string, password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al registrarse");
  }
  return res.json();
}

export async function apiLogin(
  email: string, password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Credenciales incorrectas");
  }
  return res.json();
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
