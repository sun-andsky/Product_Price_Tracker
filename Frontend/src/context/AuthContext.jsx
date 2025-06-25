// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";

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
      const res = await fetch("http://localhost:8000/api/users/profile/", {
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
