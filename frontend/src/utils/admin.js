import api from "./api";

export const getAdminOverview = async () => {
  const { data } = await api.get("/admin/overview");
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const blockUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/block`);
  return data;
};

export const unblockUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/unblock`);
  return data;
};

export const warnUser = async (id, message) => {
  const { data } = await api.post(`/admin/users/${id}/warn`, { message });
  return data;
};

export const getAdminWarnings = async () => {
  const { data } = await api.get("/admin/warnings");
  return data;
};
