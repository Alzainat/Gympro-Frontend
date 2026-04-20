import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";
import AuthCard, { AuthUI } from "../components/AuthCard";
import { theme } from "../theme/uiTheme";

function EyeIcon({ off = false, size = 18 }) {
  if (off) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7.12 7.12C5 8.6 3.53 10.7 2.5 12c1.8 2.3 5.3 6 9.5 6 1.4 0 2.7-.3 3.85-.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9.9 4.3C10.6 4.1 11.3 4 12 4c4.2 0 7.7 3.7 9.5 6-0.7 0.9-1.6 2.1-2.7 3.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12c1.8-2.3 5.3-6 9.5-6s7.7 3.7 9.5 6c-1.8 2.3-5.3 6-9.5 6s-7.7-3.7-9.5-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function ResetPassword() {
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    token: params.get("token") || "",
    email: params.get("email") || "",
    password: "",
    password_confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [eyeHover1, setEyeHover1] = useState(false);
  const [eyeHover2, setEyeHover2] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await resetPassword(form);
      setMessage(res.message || "Password reset successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          JSON.stringify(err?.response?.data) ||
          err?.message ||
          "Reset password failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const eyeActive1 = showPassword || eyeHover1;
  const eyeActive2 = showConfirmPassword || eyeHover2;

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Choose a new password for your account."
    >
      {message && <p style={AuthUI.success}>{message}</p>}
      {error && <p style={AuthUI.error}>{error}</p>}

      <form onSubmit={submit} style={s.form}>
        <label style={s.label}>
          <span style={s.labelText}>Email</span>
          <input
            type="email"
            value={form.email}
            readOnly
            style={{
              ...AuthUI.input,
              opacity: 0.7,
              cursor: "not-allowed",
              background: "rgba(255,255,255,0.62)",
            }}
          />
        </label>

        <label style={s.label}>
          <span style={s.labelText}>New Password</span>
          <div style={s.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ ...AuthUI.input, marginBottom: 0, paddingRight: 56 }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              onMouseEnter={() => setEyeHover1(true)}
              onMouseLeave={() => setEyeHover1(false)}
              style={{
                ...s.eyeBtn,
                color: eyeActive1 ? theme.colors.accent : theme.colors.textFaint,
                boxShadow: eyeActive1 ? theme.shadow.glow : "none",
                borderColor: eyeActive1
                  ? "rgba(122,92,207,0.22)"
                  : theme.colors.border,
                transform: eyeHover1
                  ? "translateY(-50%) scale(1.02)"
                  : "translateY(-50%)",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon off={showPassword} />
            </button>
          </div>
        </label>

        <label style={s.label}>
          <span style={s.labelText}>Confirm Password</span>
          <div style={s.passwordWrap}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              required
              style={{ ...AuthUI.input, marginBottom: 0, paddingRight: 56 }}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              onMouseEnter={() => setEyeHover2(true)}
              onMouseLeave={() => setEyeHover2(false)}
              style={{
                ...s.eyeBtn,
                color: eyeActive2 ? theme.colors.accent : theme.colors.textFaint,
                boxShadow: eyeActive2 ? theme.shadow.glow : "none",
                borderColor: eyeActive2
                  ? "rgba(122,92,207,0.22)"
                  : theme.colors.border,
                transform: eyeHover2
                  ? "translateY(-50%) scale(1.02)"
                  : "translateY(-50%)",
              }}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              <EyeIcon off={showConfirmPassword} />
            </button>
          </div>
        </label>

        <button
          type="submit"
          style={{ ...AuthUI.button(loading), ...s.submitBtn }}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
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
    color: theme.colors.textDim,
    letterSpacing: 0.4,
    fontWeight: 600,
  },

  passwordWrap: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },

  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    background: "rgba(255,255,255,0.72)",
    border: `1px solid ${theme.colors.border}`,
    cursor: "pointer",
    transition: theme.motion.fast,
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
    color: theme.colors.accent,
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 14,
  },
};