import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/api";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if token is stored in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      getUserProfile(token);
    } else {
      setAuthState({ ...authState, isLoading: false });
    }
  }, []);

  // Helper function to get user profile with token
  const getUserProfile = async (token: string) => {
    try {
      const userData = await authApi.getProfile(token);
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error("Authentication error:", error);
      localStorage.removeItem("token");
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem("token", data.token);
      
      setAuthState({
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture
        },
        isAuthenticated: true,
        isLoading: false
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("Registering with direct fetch call to: https://render-backend-2664.onrender.com/api/users");
      
      // Use a direct fetch call with the hardcoded URL
      const response = await fetch('https://render-backend-2664.onrender.com/api/users', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem("token", data.token);
      
      setAuthState({
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture
        },
        isAuthenticated: true,
        isLoading: false
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const data = await authApi.updateProfile(token, userData);
      
      // Update token if returned from API
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      setAuthState({
        ...authState,
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture
        }
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
