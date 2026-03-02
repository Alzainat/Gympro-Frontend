import { useEffect, useState } from "react";
import axios from "../api/axios";

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
        // لو صار خطأ (مثلاً توكن)، ما نفتح المودال.
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

  if (loading) return null;
  if (!open) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3 style={{ marginTop: 0 }}>Complete your body info</h3>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          Please enter your height, weight, and (optional) body fat %.
        </p>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
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
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    color: "white",
  },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 13, opacity: 0.85 },
  input: {
    height: 40,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    padding: "0 12px",
    outline: "none",
  },
  button: {
    height: 42,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    background: "rgba(255,0,0,0.12)",
    border: "1px solid rgba(255,0,0,0.25)",
    padding: 10,
    borderRadius: 10,
    fontSize: 13,
  },
};