import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    console.log('Checking stored auth:', { hasUser: !!storedUser, hasToken: !!token });

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ User restored from storage:', parsedUser.email);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log('Login function called with:', userData);
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      _id: userData._id || userData.id
    };
    
    setUser(normalizedUser);
    setIsAuthenticated(true);
    
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("token", token);
    
    console.log('User logged in successfully:', normalizedUser.email);
    console.log('Auth state updated:', { isAuthenticated: true });
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log('User logged out successfully');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};