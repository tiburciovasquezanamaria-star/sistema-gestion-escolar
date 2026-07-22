const API_URL = import.meta.env.VITE_API_URL || "https://sistema-gestion-escolar.onrender.com";

const requestJson = async (url, options = {}) => {
  const token = sessionStorage.getItem("sge_token");
  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || data?.error || `Error del servidor: ${res.status}`;
    throw new Error(message);
  }
  return data;
};

export const getCourses = async () =>
  requestJson(`${API_URL}/api/courses`, { method: "GET" });

export const getSeccionCupos = async () =>
  requestJson(`${API_URL}/api/courses/seccion-cupos`, { method: "GET" });

export const createCourse = async (data) =>
  requestJson(`${API_URL}/api/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateCourse = async (id, data) =>
  requestJson(`${API_URL}/api/courses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateMaestro = async (id, profesor) =>
  requestJson(`${API_URL}/api/courses/${id}/maestro`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profesor }),
  });

export const deleteCourse = async (id) =>
  requestJson(`${API_URL}/api/courses/${id}`, { method: "DELETE" });
