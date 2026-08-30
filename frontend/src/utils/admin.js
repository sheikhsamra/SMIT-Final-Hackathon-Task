import api from "./api";

export const getAdminOverview = async () => {
  const { data } = await api.get("/admin/overview");
  return data;
};
