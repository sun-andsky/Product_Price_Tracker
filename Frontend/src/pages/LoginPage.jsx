// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { loginUser, fetchUsers } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const result = await loginUser(form);

    if (result.token) {
      setToken(result.token);
      localStorage.setItem("authToken", result.token);
      setForm({ email: "", password: "" });

      const userList = await fetchUsers();
      if (userList.error) {
        setError(userList.error);
      } else {
        setUsers(userList.signed_up_users || []);
        navigate("/"); // Redirect to main page
      }
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    
    <div className="page-wrapper">
      <div className="logo-brand">
        <i class="bi bi-box-seam-fill icon"></i>
        <p>Price Tracker</p>
      </div>
      <div className="login-container">
        <p className="login">Login</p>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Login</button>
        </form>

        {error && <p className="message error">❌ {error}</p>}
        {token && !error && (
          <p className="message success">✅ Logged in! Token saved.</p>
        )}

        {users.length > 0 && (
          <div className="user-list">
            <h3>Users:</h3>
            <ul>
              {users.map((u) => (
                <li key={u.id || u._id}>
                  {u.username} - {u.email}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
