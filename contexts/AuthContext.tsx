"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/api";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: "buyer" | "dealer";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  buyerLogin: (email: string, password: string) => Promise<void>;
  dealerLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerBuyer: (buyerData: any) => Promise<void>;
  registerDealer: (dealerData: any) => Promise<void>;
  updateUserInfo: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a token in local storage from previous versions
        const legacyToken = localStorage.getItem("accessToken");
        const legacyUser = localStorage.getItem("userInfo");

        // If legacy token exists but no cookie, migrate to cookies
        if (legacyToken && !getCookie("accessToken")) {
          console.log("Migrating from localStorage to cookies");
          // Set cookies from localStorage data
          if (legacyUser) {
            const userObj = JSON.parse(legacyUser);
            authService.setAuthData(legacyToken, userObj);
            setUser(userObj);

            // Clean up localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userInfo");
          }
        } else {
          // Use cookie-based auth
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // If no user in cookies, clear any potential corrupted state
            document.cookie = "accessToken=; path=/; max-age=0";
            document.cookie = "userInfo=; path=/; max-age=0";
          }
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
        // Clear potentially corrupted cookies
        document.cookie = "accessToken=; path=/; max-age=0";
        document.cookie = "userInfo=; path=/; max-age=0";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const buyerLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.buyerLogin(email, password);
      authService.setAuthData(data.accessToken, data.user);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const dealerLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.dealerLogin(email, password);
      authService.setAuthData(data.accessToken, data.user);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear cookies
    authService.logout();
    // Clear any localStorage remnants
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    setUser(null);
    router.push("/");
  };

  const registerBuyer = async (buyerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.registerBuyer(buyerData);
      authService.setAuthData(data.accessToken, data.user);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const registerDealer = async (dealerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.registerDealer(dealerData);
      authService.setAuthData(data.accessToken, data.user);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = (updatedUser: User) => {
    setUser(updatedUser);

    const accessToken = getCookie("accessToken");
    if (accessToken) {
      authService.setAuthData(accessToken, updatedUser);
    }
  };

  const value = {
    user,
    loading,
    error,
    buyerLogin,
    dealerLogin,
    logout,
    registerBuyer,
    registerDealer,
    updateUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to get cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
