import api from "./api";

export const getTickets = async () => {
  const { data } = await api.get("/tickets");
  return data;
};

export const getTicketStats = async () => {
  const { data } = await api.get("/tickets/stats");
  return data;
};

export const getTicket = async (id) => {
  const { data } = await api.get(`/tickets/${id}`);
  return data;
};

export const createTicket = async (payload) => {
  const { data } = await api.post("/tickets", payload);
  return data;
};

export const getMessages = async (id) => {
  const { data } = await api.get(`/tickets/${id}/messages`);
  return data;
};

export const sendMessage = async (id, text) => {
  const { data } = await api.post(`/tickets/${id}/messages`, { text });
  return data;
};

export const assignTicket = async (id) => {
  const { data } = await api.patch(`/tickets/${id}/assign`);
  return data;
};

export const updateTicketStatus = async (id, status, resolutionNote) => {
  const { data } = await api.patch(`/tickets/${id}/status`, { status, resolutionNote });
  return data;
};

export const reopenTicket = async (id) => {
  const { data } = await api.patch(`/tickets/${id}/reopen`);
  return data;
};

export const updateTicketDetails = async (id, payload) => {
  const { data } = await api.patch(`/tickets/${id}`, payload);
  return data;
};

export const runAiTriage = async (id) => {
  const { data } = await api.post(`/tickets/${id}/ai-triage`);
  return data;
};

export const getMatchingWorkers = async (category) => {
  const { data } = await api.get("/users/workers", { params: { category } });
  return data;
};

export const getWorkerProfile = async (id) => {
  const { data } = await api.get(`/users/workers/${id}/profile`);
  return data;
};

export const acceptTicket = async (id) => {
  const { data } = await api.patch(`/tickets/${id}/accept`);
  return data;
};

export const rejectTicket = async (id) => {
  const { data } = await api.patch(`/tickets/${id}/reject`);
  return data;
};

export const getTicketReview = async (id) => {
  const { data } = await api.get(`/tickets/${id}/review`);
  return data;
};

export const submitReview = async (id, rating, comment) => {
  const { data } = await api.post(`/tickets/${id}/review`, { rating, comment });
  return data;
};
