import axios from "axios";

const API_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCookie("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async buyerLogin(email: string, password: string) {
    const response = await api.post("/auth/buyer/login", { email, password });
    return response.data;
  },

  async dealerLogin(email: string, password: string) {
    const response = await api.post("/auth/dealer/login", { email, password });
    return response.data;
  },

  async registerBuyer(buyerData: {
    buyerName: string;
    email: string;
    password: string;
    phoneNumber: string;
    profilePhoto: string | null;
  }) {
    // Just return the response without handling auth data
    const response = await api.post("/buyer", buyerData);
    return response.data;
  },

  async registerDealer(dealerData: {
    businessName: string;
    licenseNumber: string;
    email: string;
    password: string;
    phoneNumber: string;
    profilePhoto: string | null;
  }) {
    // Just return the response without handling auth data
    const response = await api.post("/dealer", dealerData);
    return response.data;
  },

  logout() {
    // Clear cookies
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "userInfo=; path=/; max-age=0";

    // Also clear localStorage to be safe
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
    }
  },

  getCurrentUser() {
    try {
      const userInfo = getCookie("userInfo");

      if (!userInfo) {
        // Try localStorage as fallback (for migration)
        if (typeof window !== "undefined") {
          const legacyUserInfo = localStorage.getItem("userInfo");
          if (legacyUserInfo) {
            return JSON.parse(legacyUserInfo);
          }
        }
        return null;
      }

      return JSON.parse(decodeURIComponent(userInfo));
    } catch (error) {
      console.error("Error parsing user info:", error);
      // Clear potentially corrupted data
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "userInfo=; path=/; max-age=0";
      return null;
    }
  },

  setAuthData(accessToken: string, user: any) {
    try {
      // Set cookies with proper expiration (7 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      document.cookie = `accessToken=${accessToken}; path=/; expires=${expiryDate.toUTCString()}`;
      document.cookie = `userInfo=${encodeURIComponent(
        JSON.stringify(user)
      )}; path=/; expires=${expiryDate.toUTCString()}`;

      // Clear localStorage if we're fully migrating to cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
      }
    } catch (error) {
      console.error("Error setting auth data:", error);
    }
  },
};

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null; // For SSR

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default api;
