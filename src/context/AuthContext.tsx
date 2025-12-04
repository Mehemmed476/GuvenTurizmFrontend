"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface DecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string; // <--- Username buradadır
    role?: string | string[];
    unique_name?: string; // Bəzən burada olur
    sub?: string;
    exp?: number;
}

interface User {
    id: string;
    userName: string; // <--- Yeni sahə
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const decodeUser = (token: string): User | null => {
        try {
            const decoded: DecodedToken = jwtDecode(token);

            // Vaxtı bitibsə
            if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;

            // Rolu tapmaq
            const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
            const role = Array.isArray(roleClaim) ? roleClaim[0] : (roleClaim || "User");

            // Adı tapmaq (Token-dən)
            const nameClaim = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.unique_name || "İstifadəçi";

            return {
                id: decoded.sub || "",
                userName: nameClaim, // <--- Adı mənimsədirik
                role: role
            };
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const token = Cookies.get("accessToken");
        if (token) {
            const userData = decodeUser(token);
            if (userData) {
                setUser(userData);
            } else {
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        Cookies.set("accessToken", token, { expires: 1, secure: true, sameSite: 'Strict' });
        const userData = decodeUser(token);
        setUser(userData);
    };

    const logout = () => {
        Cookies.remove("accessToken");
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}