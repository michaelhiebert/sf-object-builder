import axios from "axios";

export const whoami = async () => {
  const response = await axios.get("/auth/whoami", { withCredentials: true });
  
  return response.data;
};

export const logout = async () => {
  const response = await axios.post("/auth/logout", null, {
    withCredentials: true,
  });

  return response.data;
};
