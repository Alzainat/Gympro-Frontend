import { useEffect, useMemo, useState } from "react";
import { theme, ui } from "../../theme/uiTheme";
import {
  deleteProgressPhoto,
  getProgressComparison,
  getProgressPhotos,
  uploadProgressPhoto,
} from "../../services/progressPhotoService";

const POSES = [
  { value: "", label: "All" },
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" },
];

const TYPES = [
  { value: "baseline", label: "Baseline" },
  { value: "progress", label: "Progress" },
  { value: "comparison", label: "Comparison" },
];

export default function ProgressPhotos() {
  const [photos, setPhotos] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filterPose, setFilterPose] = useState("");
  const [comparisonPose, setComparisonPose] = useState("front");
  const [months, setMonths] = useState(3);

  const [form, setForm] = useState({
    photo_type: "progress",
    pose: "front",
    taken_at: "",
    notes: "",
    image: null,
  });

  const loadPhotos = async (pose = filterPose) => {
    try {
      setLoading(true);
      setError("");
      const data = await getProgressPhotos(pose);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load progress photos.");
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (m = months, pose = comparisonPose) => {
    try {
      setComparing(true);
      setError("");
      const data = await getProgressComparison(m, pose);
      setComparison(data);
    } catch (e) {
      setComparison(null);
      setError(e?.response?.data?.message || "No comparison photo found yet.");
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    loadPhotos("");
    loadComparison(3, "front");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    return photos.reduce((acc, photo) => {
      const key = photo.pose || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!form.image) {
      setError("Please choose an image first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const fd = new FormData();
      fd.append("image", form.image);
      fd.append("photo_type", form.photo_type);
      if (form.pose) fd.append("pose", form.pose);
      if (form.taken_at) fd.append("taken_at", form.taken_at);
      if (form.notes) fd.append("notes", form.notes);

      await uploadProgressPhoto(fd);

      setSuccess("Photo uploaded successfully.");
      setForm({
        photo_type: "progress",
        pose: "front",
        taken_at: "",
        notes: "",
        image: null,
      });

      await loadPhotos(filterPose);
      await loadComparison(months, comparisonPose);
    } catch (e2) {
      setError(e2?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this photo?");
    if (!ok) return;

    try {
      setError("");
      setSuccess("");
      await deleteProgressPhoto(id);
      setSuccess("Photo deleted successfully.");
      await loadPhotos(filterPose);
      await loadComparison(months, comparisonPose);
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed.");
    }
  };

  const onFilterChange = async (value) => {
    setFilterPose(value);
    await loadPhotos(value);
  };

  const runComparison = async () => {
    await loadComparison(months, comparisonPose);
  };

  return (
    <div style={page.page}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <style>{`
        .dark-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 18px;
          padding-right: 44px;
        }

        .dark-select option {
          background: #16213a;
          color: #ffffff;
        }

        .dark-input::file-selector-button {
          display: none;
        }

        .dark-input::-webkit-file-upload-button {
          display: none;
        }

        @media (max-width: 980px) {
          .progress-grid {
            grid-template-columns: 1fr !important;
          }

          .compare-grid {
            grid-template-columns: 1fr !important;
          }

          .form-row {
            grid-template-columns: 1fr !important;
          }

          .compare-controls {
            grid-template-columns: 1fr !important;
          }

          .gallery-header {
            flex-direction: column;
            align-items: stretch !important;
          }
        }
      `}</style>

      <div style={page.container}>
        <div style={page.card}>
          <div style={page.headerRow}>
            <div>
              <h2 style={page.title}>Progress Photos</h2>
              <p style={page.sub}>
                Upload your current photo now, then compare it with another one after 3 months.
              </p>
            </div>
          </div>

          {(error || success) && (
            <div
              style={{
                ...page.alert,
                ...(error ? page.alertError : page.alertSuccess),
              }}
            >
              {error || success}
            </div>
          )}

          <div className="progress-grid" style={layout.grid}>
            <section style={box.wrap}>
              <h3 style={box.title}>Upload New Photo</h3>

              <form onSubmit={handleUpload} style={formStyles.wrap}>
                <div className="form-row" style={formStyles.row}>
                  <div>
                    <label style={formStyles.label}>Photo Type</label>
                    <select
                      className="dark-select"
                      value={form.photo_type}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, photo_type: e.target.value }))
                      }
                      style={formStyles.input}
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={formStyles.label}>Pose</label>
                    <select
                      className="dark-select"
                      value={form.pose}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, pose: e.target.value }))
                      }
                      style={formStyles.input}
                    >
                      {POSES.filter((x) => x.value !== "").map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={formStyles.label}>Taken At</label>
                  <input
                    type="date"
                    value={form.taken_at}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, taken_at: e.target.value }))
                    }
                    style={formStyles.input}
                  />
                </div>

                <div>
                  <label style={formStyles.label}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    style={formStyles.textarea}
                    placeholder="Optional note..."
                  />
                </div>

                <div>
                  <label style={formStyles.label}>Choose Image</label>

                  <label style={fileUpload.wrap}>
                    <input
                      className="dark-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          image: e.target.files?.[0] || null,
                        }))
                      }
                      style={fileUpload.hiddenInput}
                    />

                    <div style={fileUpload.inner}>
                      <div style={fileUpload.button}>Choose File</div>
                      <div style={fileUpload.fileName}>
                        {form.image ? form.image.name : "No file selected"}
                      </div>
                    </div>
                  </label>
                </div>

                <button type="submit" style={formStyles.button} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              </form>
            </section>

            <section style={box.wrap}>
              <h3 style={box.title}>3-Month Comparison</h3>

              <div className="compare-controls" style={compareControls.wrap}>
                <div>
                  <label style={formStyles.label}>Months</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value || 3))}
                    style={formStyles.input}
                  />
                </div>

                <div>
                  <label style={formStyles.label}>Pose</label>
                  <select
                    className="dark-select"
                    value={comparisonPose}
                    onChange={(e) => setComparisonPose(e.target.value)}
                    style={formStyles.input}
                  >
                    {POSES.filter((x) => x.value !== "").map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "end" }}>
                  <button type="button" onClick={runComparison} style={formStyles.buttonAlt}>
                    {comparing ? "Comparing..." : "Compare"}
                  </button>
                </div>
              </div>

              {!comparison?.before ? (
                <div style={empty.wrap}>No comparison data yet.</div>
              ) : (
                <>
                  <div style={compareMeta}>
                    Target date: <b>{comparison.target_date}</b>
                  </div>

                  <div className="compare-grid" style={compareGrid.wrap}>
                    <div style={compareGrid.card}>
                      <div style={compareGrid.label}>Before</div>
                      <img
                        src={comparison.before.image_url}
                        alt="Before"
                        style={compareGrid.image}
                      />
                      <div style={compareGrid.meta}>
                        {comparison.before.taken_at || "-"} • {comparison.before.pose || "-"}
                      </div>
                    </div>

                    <div style={compareGrid.card}>
                      <div style={compareGrid.label}>After</div>
                      {comparison.after ? (
                        <>
                          <img
                            src={comparison.after.image_url}
                            alt="After"
                            style={compareGrid.image}
                          />
                          <div style={compareGrid.meta}>
                            {comparison.after.taken_at || "-"} • {comparison.after.pose || "-"}
                          </div>
                        </>
                      ) : (
                        <div style={empty.wrap}>
                          No photo found yet after {comparison.target_date}.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>

          <section style={{ ...box.wrap, marginTop: 18 }}>
            <div className="gallery-header" style={galleryHeader.wrap}>
              <h3 style={box.title}>My Photos</h3>

              <div style={galleryHeader.actions}>
                <select
                  className="dark-select"
                  value={filterPose}
                  onChange={(e) => onFilterChange(e.target.value)}
                  style={formStyles.input}
                >
                  {POSES.map((p) => (
                    <option key={p.value || "all"} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div style={empty.wrap}>Loading photos...</div>
            ) : !photos.length ? (
              <div style={empty.wrap}>No progress photos uploaded yet.</div>
            ) : (
              <div style={galleryGroups.wrap}>
                {Object.keys(grouped).map((groupKey) => (
                  <div key={groupKey} style={galleryGroups.section}>
                    <div style={galleryGroups.heading}>
                      {(groupKey || "other").toUpperCase()}
                    </div>

                    <div style={gallery.wrap}>
                      {grouped[groupKey].map((photo) => (
                        <div key={photo.id} style={gallery.card}>
                          <img
                            src={photo.image_url}
                            alt={`Progress ${photo.id}`}
                            style={gallery.image}
                          />

                          <div style={gallery.body}>
                            <div style={gallery.tags}>
                              <span style={gallery.tag}>{photo.photo_type}</span>
                              <span style={gallery.tag}>{photo.pose || "no pose"}</span>
                            </div>

                            <div style={gallery.meta}>
                              {photo.taken_at || "No date"}
                            </div>

                            {photo.notes ? (
                              <div style={gallery.notes}>{photo.notes}</div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleDelete(photo.id)}
                              style={gallery.deleteBtn}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const page = {
  page: {
    ...ui.page,
    padding: theme.layout.pagePadding,
  },
  container: {
    maxWidth: theme.layout.contentMax,
    margin: "0 auto",
  },
  card: {
    width: "100%",
    padding: 22,
    borderRadius: theme.radius.lg,
    background: theme.colors.card,
    backdropFilter: "blur(20px)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    color: theme.colors.text,
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
  },
  sub: {
    margin: "8px 0 0",
    color: theme.colors.textDim,
    fontSize: 14,
  },
  alert: {
    padding: "12px 14px",
    borderRadius: theme.radius.md,
    marginBottom: 16,
    fontWeight: 700,
  },
  alertError: {
    background: "rgba(255, 80, 80, 0.12)",
    border: "1px solid rgba(255, 80, 80, 0.30)",
    color: "#ffb3b3",
  },
  alertSuccess: {
    background: "rgba(0,245,212,.12)",
    border: "1px solid rgba(0,245,212,.30)",
    color: theme.colors.primary,
  },
};

const layout = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
};

const box = {
  wrap: {
    padding: 16,
    borderRadius: theme.radius.lg,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 14,
  },
};

const formStyles = {
  wrap: {
    display: "grid",
    gap: 12,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: 800,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 22,
    border: `1px solid rgba(255,255,255,.09)`,
    background: "linear-gradient(180deg, rgba(23,32,57,.96), rgba(16,24,46,.96))",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 15,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
  },
  textarea: {
    width: "100%",
    minHeight: 110,
    padding: "14px 16px",
    borderRadius: 18,
    border: `1px solid rgba(255,255,255,.09)`,
    background: "linear-gradient(180deg, rgba(23,32,57,.96), rgba(16,24,46,.96))",
    color: "#ffffff",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 15,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
  },
  button: {
    padding: "13px 16px",
    border: "none",
    borderRadius: 16,
    background: theme.gradients.primary,
    color: "#061018",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: theme.shadow.glow,
    fontSize: 14,
  },
  buttonAlt: {
    padding: "13px 16px",
    borderRadius: 16,
    border: `1px solid rgba(255,255,255,.10)`,
    background: "linear-gradient(180deg, rgba(30,39,66,.96), rgba(17,24,45,.96))",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    width: "100%",
    fontSize: 14,
  },
};

const fileUpload = {
  wrap: {
    display: "block",
    width: "100%",
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.09)",
    background: "linear-gradient(180deg, rgba(23,32,57,.96), rgba(16,24,46,.96))",
    boxSizing: "border-box",
    minHeight: 62,
  },
  button: {
    flexShrink: 0,
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(0,245,212,.12)",
    border: "1px solid rgba(0,245,212,.28)",
    color: theme.colors.primary,
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  fileName: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.92,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

const compareControls = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 12,
    marginBottom: 16,
  },
};

const compareMeta = {
  marginBottom: 12,
  color: theme.colors.textDim,
};

const compareGrid = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  card: {
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.03)",
    padding: 12,
  },
  label: {
    fontWeight: 900,
    marginBottom: 10,
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 320,
    objectFit: "cover",
    borderRadius: 16,
    display: "block",
    border: `1px solid ${theme.colors.border}`,
  },
  meta: {
    marginTop: 10,
    color: theme.colors.textDim,
    fontSize: 13,
  },
};

const galleryHeader = {
  wrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  actions: {
    minWidth: 180,
  },
};

const galleryGroups = {
  wrap: {
    display: "grid",
    gap: 24,
  },
  section: {
    display: "grid",
    gap: 12,
  },
  heading: {
    fontSize: 14,
    fontWeight: 900,
    color: theme.colors.primary,
    letterSpacing: 1,
  },
};

const gallery = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.03)",
    boxShadow: "0 8px 24px rgba(0,0,0,.18)",
  },
  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block",
  },
  body: {
    padding: 12,
    display: "grid",
    gap: 10,
  },
  tags: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,245,212,.10)",
    border: "1px solid rgba(0,245,212,.25)",
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textDim,
  },
  notes: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 1.6,
  },
  deleteBtn: {
    padding: "10px 12px",
    borderRadius: theme.radius.md,
    border: "1px solid rgba(255,80,80,.25)",
    background: "rgba(255,80,80,.08)",
    color: "#ffb3b3",
    cursor: "pointer",
    fontWeight: 800,
  },
};

const empty = {
  wrap: {
    padding: 18,
    borderRadius: theme.radius.md,
    border: `1px dashed ${theme.colors.border}`,
    color: theme.colors.textDim,
    background: "rgba(255,255,255,.02)",
  },
};