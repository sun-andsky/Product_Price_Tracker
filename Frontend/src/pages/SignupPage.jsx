import { Link } from "react-router-dom";
import React, { useState } from "react";
import { signupUser } from "../api/api";
import { toast } from "react-toastify"; // ✅ import toast
import "./SignupPage.css";

function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signupUser(form);

      if (result.message) {
        toast.success("🎉 " + result.message, {
          className: "signup-toast signup-toast--success",
        });
        setForm({ username: "", email: "", password: "" }); // Clear form
      } else if (result.error) {
        // Optional error-specific messages
        if (result.error.includes("username")) {
          toast.error("⚠️ Username already taken", {
            className: "signup-toast signup-toast--error",
          });
        } else if (result.error.includes("email")) {
          toast.error("📧 Email already registered", {
            className: "signup-toast signup-toast--error",
          });
        } else if (result.error.includes("password")) {
          toast.warn("🔐 Password must be at least 6 characters", {
            className: "signup-toast signup-toast--warn",
          });
        } else {
          toast.error("❌ " + result.error, {
            className: "signup-toast signup-toast--error",
          });
        }
      } else {
        toast.error("Unexpected server response", {
          className: "signup-toast signup-toast--error",
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed. Please try again.", {
        className: "signup-toast signup-toast--error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="logo-brand">
        <i className="bi bi-box-seam-fill icon"></i>
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

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
