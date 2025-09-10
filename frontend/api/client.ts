import axios from "axios";
import * as SecureStore from "expo-secure-store";


const API_BASE = "http://192.168.1.102:8000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// --- Token helpers ---
async function getAccessToken() {
  return await SecureStore.getItemAsync("accessToken");
}
async function getRefreshToken() {
  return await SecureStore.getItemAsync("refreshToken");
}

// Attach access token to every request
client.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Handle 401s → refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalReq = err.config;
    if (err.response?.status === 401 && !originalReq._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalReq.headers.Authorization = "Bearer " + token;
          return client(originalReq);
        });
      }

      originalReq._retry = true;
      isRefreshing = true;
      try {
        const refresh = await getRefreshToken();
        if (!refresh) throw new Error("No refresh token");
        const resp = await axios.post(`${API_BASE}/auth/token/refresh/`, {
          refresh,
        });
        const newAccess = resp.data.access;
        await SecureStore.setItemAsync("accessToken", newAccess);
        processQueue(null, newAccess);
        originalReq.headers.Authorization = "Bearer " + newAccess;
        return client(originalReq);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default client;
