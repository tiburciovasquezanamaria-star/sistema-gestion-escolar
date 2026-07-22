const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

export const getGrades = async () => {
  return await requestJson(`${API_URL}/api/grades`, { method: "GET" });
};

export const createGrade = async (data) => {
  return await requestJson(`${API_URL}/api/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const updateGrade = async (id, data) => {
  return await requestJson(`${API_URL}/api/grades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteGrade = async (id) => {
  return await requestJson(`${API_URL}/api/grades/${id}`, {
    method: "DELETE",
  });
};
