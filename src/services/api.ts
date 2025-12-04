import axios from "axios";
import Cookies from "js-cookie"; // <--- Yeni import

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // DƏYİŞİKLİK: Tokeni cookie-dən oxuyuruq
    const token = Cookies.get("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token keçərsizdirsə, cookie-ni silirik
      Cookies.remove("accessToken");
      console.error("Sessiya bitdi. Zəhmət olmasa yenidən giriş edin.");
      // İstəsəniz bura window.location.href = "/" əlavə edə bilərsiniz
    }
    return Promise.reject(error);
  }
);

export const uploadConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export default api;