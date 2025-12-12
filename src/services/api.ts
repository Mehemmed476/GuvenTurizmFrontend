import axios from "axios";
import Cookies from "js-cookie";

// --- URL MANTIĞI (EN ÖNEMLİ KISIM) ---
// Eğer tarayıcıdaysak (client) -> https://api.guventurizm.az
// Eğer sunucudaysak (server/SSR) -> http://localhost:5072 (Docker iç ağına veya Localhost'a gider)
const API_URL = typeof window === "undefined" 
    ? "http://localhost:5072/api" 
    : "https://api.guventurizm.az/api";

export const uploadConfig = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
    async (config) => {
        let token;

        // Tarayıcıdaysak Cookie'den al
        if (typeof window !== "undefined") {
            token = Cookies.get("accessToken");
        } 
        // Sunucudaysak (SSR), Next.js'in "cookies" kütüphanesini kullanmak gerekir
        // Ancak basit axios instance'larında bu zordur.
        // Genellikle SSR'da token'i "getServerSideProps" veya Server Component içinden göndeririz.
        // Şimdilik burayı boş geçiyoruz, SSR'da public verilere erişim için token gerekmez.
        
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
            if (typeof window !== "undefined") {
                // Sadece tarayıcıdaysa sil
                Cookies.remove("accessToken");
                // Opsiyonel: window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;