import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTOR (Sorğu Çıxmamışdan Əvvəl) ---
api.interceptors.request.use(
  (config) => {
    // 1. Brauzerin yaddaşından (Local Storage) tokeni axtarırıq
    // "accessToken" adını biz qoyuruq, Login olanda bu adla yadda saxlayacağıq.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      // 2. Əgər token varsa, Header-ə "Bearer eyJ..." kimi əlavə et
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR (Cavab Gələndə) ---
// Bunu da əlavə edirəm ki, əgər Tokenin vaxtı bitibsə (401 xətası),
// istifadəçini avtomatik Login səhifəsinə atsın.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token keçərsizdir və ya yoxdur
      // İstersen burada localStorage.removeItem("accessToken") edə bilərsən
      // window.location.href = "/login"; // (Əgər login səhifən varsa)
      console.error("İcazə yoxdur! Zəhmət olmasa giriş edin.");
    }
    return Promise.reject(error);
  }
);

export const uploadConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export default api;