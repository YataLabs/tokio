import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokio_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.params) {
    config.params = {};
  }
  config.params.tz_offset = new Date().getTimezoneOffset();
  return config;
});

export default client;
