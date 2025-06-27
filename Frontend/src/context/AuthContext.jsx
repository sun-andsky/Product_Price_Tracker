// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { BASE_URL } from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setUser(null); // Token expired or user not found
        return;
      }

      const data = await res.json();
      if (data.username) {
        setUser(data); // Save user to context
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser(); // Load user when app starts
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
