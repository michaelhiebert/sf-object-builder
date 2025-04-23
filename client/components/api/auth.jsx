import axios from "axios";

export const whoami = async () => {
  const response = await axios.get("/auth/whoami", { withCredentials: true });
  
  return response.data;
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(
      "/auth/login",
      { username, password },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const response = await axios.post("/auth/logout", null, {
    withCredentials: true,
  });

  return response.data;
};
