import api from "./api";

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const setupTwoFactor = async () => {
  const { data } = await api.post("/auth/2fa/setup");
  return data;
};

export const verifyTwoFactor = async (otp) => {
  const { data } = await api.post("/auth/2fa/verify", { otp });
  return data;
};
