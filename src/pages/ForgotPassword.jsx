import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import AuthCard, { AuthUI } from "../components/AuthCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setError("");
      setMessage(res.message || "Password reset link sent successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password?"
      subtitle="Enter your email and we’ll send you a reset link."
    >
      {message && <p style={AuthUI.success}>{message}</p>}
      {error && <p style={AuthUI.error}>{error}</p>}

      <form onSubmit={submit} style={s.form}>
        <label style={s.label}>
          <span style={s.labelText}>Email</span>
          <input
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={AuthUI.input}
          />
        </label>

        <button
          type="submit"
          style={{ ...AuthUI.button(loading), ...s.submitBtn }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div style={s.bottomWrap}>
          <Link to="/login" style={s.link}>
            Back to Login
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

const s = {
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  label: {
    width: "100%",
    display: "grid",
    gap: 8,
    marginBottom: 6,
  },

  labelText: {
    fontSize: 12,
    color: "rgba(255,255,255,.65)",
    letterSpacing: 0.4,
  },

  submitBtn: {
    maxWidth: 320,
    width: "100%",
    alignSelf: "center",
    marginTop: 10,
  },

  bottomWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: 14,
  },

  link: {
    color: "#00f5d4",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 14,
  },
};