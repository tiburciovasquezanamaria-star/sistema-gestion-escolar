const API_URL = import.meta.env.VITE_API_URL || "https://sistema-gestion-escolar.onrender.com";

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
    const message = data?.message || `Error del servidor: ${res.status}`;
    throw new Error(message);
  }
  return data;
};

export const getStudents = async () => {
  return await requestJson(`${API_URL}/api/students`, { method: "GET" });
};

export const registerStudent = async (data) => {
  return await requestJson(`${API_URL}/api/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const deleteStudent = async (id) => {
  return await requestJson(`${API_URL}/api/students/${id}`, {
    method: "DELETE",
  });
};

export const archiveStudent = async (id) => {
  return await requestJson(`${API_URL}/api/students/${id}/archive`, {
    method: "PUT",
  });
};

export const unarchiveStudent = async (id) => {
  return await requestJson(`${API_URL}/api/students/${id}/unarchive`, {
    method: "PUT",
  });
};
