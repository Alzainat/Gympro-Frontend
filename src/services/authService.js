import api, { setAuthToken } from "../api/axios";

export const login = async (data) => {
  const res = await api.post("/login", data);
  const token = res.data.token;

  localStorage.setItem("token", token);
  setAuthToken(token);

  return res.data;
};

export const register = async (data) => {
  const res = await api.post("/register", data);
  const token = res.data.token;

  localStorage.setItem("token", token);
  setAuthToken(token);

  return res.data;
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (e) {}

  localStorage.removeItem("token");
  setAuthToken(null);
};

export const forgotPassword = async (data) => {
  const response = await api.post("/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/reset-password", data);
  return response.data;
};