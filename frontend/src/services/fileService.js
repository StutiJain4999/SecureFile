import api from "./api";

export const fetchFiles = async () => {
  const { data } = await api.get("/files");
  return data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/files/upload", formData);
  return data;
};

export const updateFileContent = async (fileId, content) => {
  const { data } = await api.put(`/files/${fileId}`, { content });
  return data;
};

export const deleteFile = async (fileId) => {
  await api.delete(`/files/${fileId}`);
};

export const shareFileWithUser = async (fileId, email, level) => {
  const { data } = await api.post(`/files/${fileId}/share/user`, { email, level });
  return data;
};

export const createShareLink = async (fileId, expiresInMinutes) => {
  const { data } = await api.post(`/files/${fileId}/share/link`, { expiresInMinutes });
  return data;
};

export const downloadFile = async (fileId, fileName) => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: "blob"
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const fetchLogs = async () => {
  const { data } = await api.get("/admin/logs");
  return data;
};

export const fetchUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const toggleUserStatus = async (userId, isActive) => {
  const { data } = await api.patch(`/admin/users/${userId}/status`, { isActive });
  return data;
};
