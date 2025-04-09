"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  themePreference?: "light" | "dark";
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({}),
  logout: async () => {},
  refreshToken: async () => {},
  theme: "light",
  toggleTheme: () => {},
  fetchWithAuth: async () => new Response(),
});

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        const response = await fetch("/api/users/profile", {
          headers: { "Authorization": `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Set theme from user or fallback to localStorage
          if (data.user.themePreference) {
            setTheme(data.user.themePreference);
            document.documentElement.setAttribute("data-theme", data.user.themePreference);
            
            // Add this block to also set the dark class
            if (data.user.themePreference === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
            
            localStorage.setItem("theme", data.user.themePreference);
          } else {
            const savedTheme = localStorage.getItem("theme") as "light" | "dark";
            if (savedTheme === "light" || savedTheme === "dark") {
              setTheme(savedTheme);
              document.documentElement.setAttribute("data-theme", savedTheme);
              
              // Add this block to also set the dark class
              if (savedTheme === "dark") {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
            }
          }
        } else {
          await refreshToken();
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  const refreshToken = async () => {
    try {
      const refreshTokenStr = localStorage.getItem("refreshToken");
      if (!refreshTokenStr) {
        logout();
        return;
      }
      const response = await fetch("/api/users/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenStr }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        const profileResponse = await fetch("/api/users/profile", {
          headers: { "Authorization": `Bearer ${data.accessToken}` },
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser(profileData.user);
          if (profileData.user.themePreference) {
            setTheme(profileData.user.themePreference);
            document.documentElement.setAttribute("data-theme", profileData.user.themePreference);
            localStorage.setItem("theme", profileData.user.themePreference);
          }
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      
      // CHANGE: Instead of using data.user directly, fetch complete profile
      const profileResponse = await fetch("/api/users/profile", {
        headers: { "Authorization": `Bearer ${data.accessToken}` },
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.user);
        
        // Theme handling
        if (profileData.user.themePreference) {
          setTheme(profileData.user.themePreference);
          document.documentElement.setAttribute("data-theme", profileData.user.themePreference);
          localStorage.setItem("theme", profileData.user.themePreference);
        }
      } else {
        // Fallback to using data.user if profile fetch fails
        setUser(data.user);
        if (data.user.themePreference) {
          setTheme(data.user.themePreference);
          document.documentElement.setAttribute("data-theme", data.user.themePreference);
          localStorage.setItem("theme", data.user.themePreference);
        }
      }
      
      return data;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshTokenStr = localStorage.getItem("refreshToken");
      if (refreshTokenStr) {
        await fetch("/api/users/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshTokenStr }),
        });
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save new theme to the server
  const saveThemePreference = async (themeToSave: "light" | "dark") => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;
    try {
      await fetch("/api/users/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ themePreference: themeToSave }),
      });
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Set data-theme attribute as before
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Add or remove the dark class that Tailwind needs for dark mode
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    localStorage.setItem("theme", newTheme);
    if (user) saveThemePreference(newTheme);
  };

  // New utility function for authenticated API calls
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      
      // Add authorization header to the request
      const authOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          "Authorization": `Bearer ${accessToken}`
        }
      };
      
      // Make the request
      let response = await fetch(url, authOptions);
      
      // If token expired (401 Unauthorized), try to refresh and retry
      if (response.status === 401) {
        await refreshToken();
        
        // Get the new token
        accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Authentication failed after token refresh");
        }
        
        // Update headers with new token
        authOptions.headers = {
          ...authOptions.headers,
          "Authorization": `Bearer ${accessToken}`
        };
        
        // Retry the request
        response = await fetch(url, authOptions);
      }
      
      return response;
    } catch (error) {
      console.error("Error in fetchWithAuth:", error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    theme,
    toggleTheme,
    fetchWithAuth,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}