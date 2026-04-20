import { useEffect, useState } from "react";
import axios from "../api/axios";
import { theme, ui } from "../theme/uiTheme";

export default function HealthProfileModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/member/health-profile");
        const data = res.data?.data;

        const missing =
          !data ||
          data.height == null ||
          data.weight == null ||
          data.height === "" ||
          data.weight === "";

        if (mounted && missing) {
          setOpen(true);
        }
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/member/health-profile", {
        height: Number(height),
        weight: Number(weight),
        body_fat_percentage: bodyFat === "" ? null : Number(bodyFat),
      });

      setOpen(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(" ")
          : "Failed to save");

      setError(msg);
    }
  };

  if (loading || !open) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Complete your body info</h3>
          <p style={styles.subtitle}>
            Please enter your height, weight, and optional body fat percentage.
          </p>
        </div>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Height (cm)</label>
            <input
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              type="number"
              min="50"
              max="260"
              step="0.01"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              type="number"
              min="20"
              max="500"
              step="0.01"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Body Fat % (optional)</label>
            <input
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              type="number"
              min="1"
              max="80"
              step="0.01"
              style={styles.input}
            />
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" style={styles.button}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(47,35,71,0.28)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },

  modal: {
    ...ui.card,
    maxWidth: 460,
    padding: 24,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 0,
    color: theme.colors.textDim,
    fontSize: 14,
    lineHeight: 1.6,
  },

  form: {
    display: "grid",
    gap: 12,
  },

  field: {
    display: "grid",
    gap: 6,
  },

  label: {
    fontSize: 13,
    color: theme.colors.textDim,
    fontWeight: 600,
  },

  input: {
    ...ui.input,
    height: 44,
    padding: "0 14px",
  },

  button: {
    ...ui.button(false),
    marginTop: 6,
  },

  error: {
    ...ui.error,
    marginBottom: 0,
  },
};