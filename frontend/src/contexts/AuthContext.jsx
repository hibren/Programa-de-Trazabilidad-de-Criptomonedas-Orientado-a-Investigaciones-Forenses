"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setPerfil(null);
  }, []);

  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/administracion/usuarios/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Failed to fetch user, logging out.");
        logout();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    }
  }, [logout]);

  const fetchPerfil = useCallback(async (authToken) => {
    if (!authToken) {
      setPerfil(null);
      setLoading(false);
      return;
    }
    try {
      // Asumimos que la API está en /api, configurado en next.config.js
      const response = await fetch('http://localhost:8000/administracion/usuarios/me/perfil', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPerfil(data);
      } else {
        console.error("Failed to fetch profile, logging out.");
        logout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchPerfil(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchPerfil]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true);
    fetchPerfil(newToken);
    fetchUser(newToken);
  };

  const value = { token, perfil, user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);