import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    console.log("Checking stored auth:", {
      hasUser: !!storedUser,
      hasToken: !!token,
    });

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log("✅ User restored from storage:", parsedUser.email);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const register = async (userData) => {
    console.log(
      "Register function called with:",
      userData.email,
      "Type:",
      userData.userType
    );

    try {
      const response = await authAPI.register(userData);
      const { user: registeredUser, token } = response.data;

      const normalizedUser = {
        ...registeredUser,
        id: registeredUser.id || registeredUser._id,
        _id: registeredUser._id || registeredUser.id,
        userType: registeredUser.userType || userData.userType,
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);

      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", token);

      console.log(
        "User registered successfully:",
        normalizedUser.email,
        "as",
        normalizedUser.userType
      );
      return normalizedUser;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = (userData, token) => {
    console.log("Login function called with:", userData);

    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      _id: userData._id || userData.id,
      userType: userData.userType,
    };

    setUser(normalizedUser);
    setIsAuthenticated(true);

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("token", token);

    console.log(
      "User logged in successfully:",
      normalizedUser.email,
      "Type:",
      normalizedUser.userType
    );
    console.log("Auth state updated:", { isAuthenticated: true });
  };

  const logout = () => {
    console.log("Logging out user");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    console.log("User logged out successfully");
  };
  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
