const API_URL = import.meta.env.VITE_API_URL || "https://sistema-gestion-escolar.onrender.com";
const API_BASE = `${API_URL}/api`;

// ─── Authentication ─────────────────────────────────────────────────────────

export async function login(usuario, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, password }),
  });
  return res.json();
}

export async function register(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function changePassword(passwordActual, passwordNuevo) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ passwordActual, passwordNuevo }),
  });
  return res.json();
}

export async function getMe() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ─── Token Management ────────────────────────────────────────────────────────

export function saveSession(token, user) {
  sessionStorage.setItem("sge_token", token);
  sessionStorage.setItem("sge_user", JSON.stringify(user));
}

export function getToken() {
  return sessionStorage.getItem("sge_token");
}

export function getUser() {
  const u = sessionStorage.getItem("sge_user");
  return u ? JSON.parse(u) : null;
}

export function clearSession() {
  sessionStorage.removeItem("sge_token");
  sessionStorage.removeItem("sge_user");
}

export function isAuthenticated() {
  return !!getToken();
}

// ─── Settings API ────────────────────────────────────────────────────────────

export async function getSettings() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateSettings(data) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
