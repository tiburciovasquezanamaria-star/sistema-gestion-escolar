const API_URL = import.meta.env.VITE_API_URL || "https://sistema-escolar-ana-tiburcio.loca.lt";

const requestJson = async (url, options = {}) => {
  const token = sessionStorage.getItem("sge_token");
  const headers = {
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || data?.error || `Error del servidor: ${res.status}`;
    throw new Error(message);
  }
  return data;
};

export const getAttendance = async (fecha, curso, seccion) => {
  return await requestJson(
    `${API_URL}/api/attendance?fecha=${encodeURIComponent(fecha)}&curso=${encodeURIComponent(curso)}&seccion=${encodeURIComponent(seccion)}`,
    { method: "GET" }
  );
};

export const saveAttendance = async (records) => {
  return await requestJson(`${API_URL}/api/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  });
};
