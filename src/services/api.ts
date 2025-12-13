import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// --- URL MƏNTİQİ ---
// Bu funksiya mühitə görə (Server və ya Brauzer) düzgün URL-i seçir.
// Gələcəkdə .env faylından idarə etmək üçün 'process.env' istifadə edirik.
const getBaseUrl = (): string => {
  // 1. Əgər brauzerdəyiksə (Client Side)
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "https://api.guventurizm.az/api";
  }
  
  // 2. Əgər serverdəyiksə (SSR / Docker daxili)
  // Docker daxilində localhost bəzən işləmir, ona görə gələcəkdə bura 
  // http://backend-service:5072 kimi daxili ad yaza bilərik.
  return process.env.INTERNAL_API_URL || "http://localhost:5072/api";
};

// --- AXIOS INSTANCE ---
const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  // Sorğu 15 saniyə ərzində cavab verməzsə ləğv et (sonsuz gözləmənin qarşısını alır)
  timeout: 15000, 
});

export const uploadConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

// --- REQUEST INTERCEPTOR (Sorğu göndərilmədən öncə) ---
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Yalnız brauzerdə işləyərkən Cookie-dən tokeni oxuyuruq
    if (typeof window !== "undefined") {
      const token = Cookies.get("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR (Cavab gəldikdən sonra) ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Əgər 401 (Unauthorized) xətası gələrsə və biz brauzerdəyiksə
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        Cookies.remove("accessToken");
        // Ehtiyac olarsa istifadəçini login səhifəsinə yönləndir:
        // window.location.href = "/auth/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;