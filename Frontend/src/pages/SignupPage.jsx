// signup.jsx
import { Link } from "react-router-dom"; // ✅ make sure react-router-dom is installed
import React, { useState } from "react";
import { signupUser } from "../api/api";
import "./SignupPage.css";

function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await signupUser(form);
      if (result.message) {
        setMessage("✅ " + result.message);
        setForm({ username: "", email: "", password: "" }); // Clear form on success
      } else if (result.error) {
        setMessage("❌ " + result.error);
      } else {
        setMessage("Unexpected server response.");
      }
    } catch (err) {
      setMessage("Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

return (

  <div className="page-wrapper">
      <div className="logo-brand">
        <i class="bi bi-box-seam-fill icon"></i>
        <p>Price Tracker</p>
      </div>
    <div className="signup-container">
      <p className="signup">Signup</p>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
      {message && (
        <p className={`message ${message.startsWith("✅") ? "success" : "error"}`}>
          {message}
        </p>
      )}
      <p className="login-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
  </div>

  </div>
);
}

export default SignupPage;
