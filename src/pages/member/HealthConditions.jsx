import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { theme, ui } from "../../theme/uiTheme";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_URL ||
  "http://127.0.0.1:8000";

export default function HealthConditions() {
  const [form, setForm] = useState({
    type: "injury",
    name: "",
    severity: "medium",
    notes: "",
  });

  const [items, setItems] = useState([]);

  const [blocked, setBlocked] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const [blockedMeals, setBlockedMeals] = useState([]);
  const [mealWarnings, setMealWarnings] = useState([]);

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [animKey, setAnimKey] = useState(0);

  const canSave = useMemo(() => {
    return form.type && form.name.trim().length > 0 && form.severity && !loadingSave;
  }, [form, loadingSave]);

  const hasResults =
    blocked.length > 0 ||
    warnings.length > 0 ||
    blockedMeals.length > 0 ||
    mealWarnings.length > 0;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/")) return `${API_BASE}${path}`;
    return `${API_BASE}/${path}`;
  };

  const loadConditions = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/member/health-conditions");
      setItems(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadConditions();
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveCondition = async () => {
    if (!canSave) return;

    setLoadingSave(true);

    try {
      await api.post("/member/health-conditions", {
        type: form.type,
        name: form.name.trim(),
        severity: form.severity,
        notes: form.notes.trim() || null,
      });

      setForm({
        type: "injury",
        name: "",
        severity: "medium",
        notes: "",
      });

      await loadConditions();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSave(false);
    }
  };

  const deleteCondition = async (id) => {
    try {
      await api.delete(`/member/health-conditions/${id}`);
      await loadConditions();
      await checkExercises();
    } catch (e) {
      console.error(e);
    }
  };

  const checkExercises = async () => {
    setLoadingCheck(true);

    try {
      const res = await api.post("/member/health-conditions/check", {});

      console.log("Health check response:", res.data);

      setBlocked(res.data?.blocked_exercises || []);
      setWarnings(res.data?.warnings || []);

      setBlockedMeals(res.data?.blocked_meals || []);
      setMealWarnings(res.data?.meal_warnings || []);

      setAnimKey((k) => k + 1);
    } catch (e) {
      console.error(e);

      setBlocked([]);
      setWarnings([]);
      setBlockedMeals([]);
      setMealWarnings([]);
    } finally {
      setLoadingCheck(false);
    }
  };

  const resetResults = () => {
    setBlocked([]);
    setWarnings([]);
    setBlockedMeals([]);
    setMealWarnings([]);
    setAnimKey((k) => k + 1);
  };

  const renderSafetyList = (list, options) => {
    const {
      emptyTitle,
      emptySub,
      tagStyle,
      tagText,
      keyPrefix,
    } = options;

    if (list.length === 0) {
      return (
        <div style={empty.box}>
          <div style={empty.title}>{emptyTitle}</div>
          <div style={empty.sub}>{emptySub}</div>
        </div>
      );
    }

    return (
      <div style={exerciseList.wrap}>
        {list.map((x, idx) => {
          const imageSrc = getImageUrl(x.image);
          const itemId = x.exercise_id || x.meal_id || idx;

          return (
            <div
              key={`${keyPrefix}-${itemId}-${idx}`}
              style={exerciseCard.wrap}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.border = `1px solid ${
                  theme.colors.borderSoft || theme.colors.border
                }`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.border = `1px solid ${theme.colors.border}`;
              }}
            >
              <div style={exerciseCard.left}>
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={x.name || "Item"}
                    style={exerciseCard.image}
                  />
                ) : (
                  <div style={exerciseCard.placeholder}>
                    <span style={exerciseCard.placeholderIcon}>
                      {keyPrefix.includes("meal") ? "🍽️" : "🏋️"}
                    </span>
                    <span style={exerciseCard.placeholderText}>No image</span>
                  </div>
                )}
              </div>

              <div style={exerciseCard.right}>
                <div style={exerciseCard.topRow}>
                  <div style={exerciseCard.titleCol}>
                    <h4 style={exerciseCard.exerciseName}>{x.name ?? "-"}</h4>

                    <div style={metaRow.wrap}>
                      <span style={tagStyle}>{tagText}</span>

                      {x.matched_condition ? (
                        <span style={metaRow.target}>
                          Condition: {x.matched_condition}
                        </span>
                      ) : null}

                      {x.matched_keyword ? (
                        <span style={metaRow.target}>
                          Match: {x.matched_keyword}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {x.reason ? (
                  <div style={exerciseCard.reasonBox}>
                    <span style={exerciseCard.reasonLabel}>Reason</span>
                    <span style={exerciseCard.reasonText}>{x.reason}</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={page.page}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={page.container}>
        <div style={page.card}>
          <div style={page.header}>
            <div>
              <h2 style={page.title}>Health Conditions</h2>
              <div style={page.subtitle}>
                Add your injury, allergy, or condition, save it to your profile,
                then check which exercises or meals are blocked or require
                caution.
              </div>
            </div>
            <div style={page.badge}>Safety Check</div>
          </div>

          <div style={formBox.wrap}>
            <label style={formBox.label}>Type</label>
            <div style={formBox.radioRow}>
              {["injury", "condition", "allergy"].map((type) => (
                <label key={type} style={formBox.radioCard(form.type === type)}>
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={form.type === type}
                    onChange={(e) => onChange("type", e.target.value)}
                  />
                  <span style={formBox.radioText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>

            <label style={{ ...formBox.label, marginTop: 16 }}>
              Condition / Injury / Allergy Name
            </label>
            <input
              style={formBox.input}
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Examples: knee injury, shoulder pain, back pain, lactose..."
            />

            <label style={{ ...formBox.label, marginTop: 16 }}>Severity</label>
            <div style={formBox.radioRow}>
              {["low", "medium", "high"].map((severity) => (
                <label
                  key={severity}
                  style={formBox.radioCard(form.severity === severity)}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={severity}
                    checked={form.severity === severity}
                    onChange={(e) => onChange("severity", e.target.value)}
                  />
                  <span style={formBox.radioText}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </span>
                </label>
              ))}
            </div>

            <label style={{ ...formBox.label, marginTop: 16 }}>Notes</label>
            <textarea
              style={formBox.textarea}
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Extra notes for the trainer..."
            />

            <div style={formBox.actions}>
              <button
                style={formBox.primary(!canSave)}
                disabled={!canSave}
                onClick={saveCondition}
              >
                {loadingSave ? "Saving..." : "Save Condition"}
              </button>

              <button
                style={formBox.secondary(loadingCheck)}
                disabled={loadingCheck}
                onClick={checkExercises}
              >
                {loadingCheck ? "Checking..." : "Check Safety"}
              </button>

              <button style={formBox.secondary(false)} onClick={resetResults}>
                Reset Results
              </button>
            </div>

            <div style={formBox.helperRow}>
              <span style={formBox.helperDot} />
              <span style={formBox.helperText}>
                The check uses your saved conditions from the database.
              </span>
            </div>
          </div>

          <div style={section.wrap}>
            <div style={section.head}>
              <div style={section.title}>Saved Conditions</div>
              <div style={section.line} />
              <div style={section.count}>{items.length}</div>
            </div>

            {pageLoading ? (
              <div style={empty.box}>
                <div style={empty.title}>Loading...</div>
              </div>
            ) : items.length === 0 ? (
              <div style={empty.box}>
                <div style={empty.title}>No saved conditions yet.</div>
                <div style={empty.sub}>
                  Add a condition above, then click Save Condition.
                </div>
              </div>
            ) : (
              <div style={savedList.wrap}>
                {items.map((item) => (
                  <div key={item.id} style={savedCard.wrap}>
                    <div style={savedCard.topRow}>
                      <div style={savedCard.left}>
                        <div style={savedCard.name}>{item.name}</div>

                        <div style={savedCard.metaRow}>
                          <span style={savedCard.type}>{item.type}</span>
                          <span style={savedCard.severity(item.severity)}>
                            {item.severity}
                          </span>
                        </div>
                      </div>

                      <button
                        style={savedCard.deleteBtn}
                        onClick={() => deleteCondition(item.id)}
                      >
                        Delete
                      </button>
                    </div>

                    {item.notes ? (
                      <div style={savedCard.notes}>{item.notes}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div key={animKey} style={anim.wrap}>
            <div style={section.wrap}>
              <div style={section.head}>
                <div style={section.title}>Blocked Exercises</div>
                <div style={section.pillBlocked}>Strict</div>
                <div style={section.line} />
                <div style={section.count}>{blocked.length}</div>
              </div>

              {renderSafetyList(blocked, {
                emptyTitle: "No blocked exercises found.",
                emptySub: "Save your conditions, then click Check Safety.",
                tagStyle: severityTag.blocked,
                tagText: "BLOCKED",
                keyPrefix: "blocked-exercise",
              })}
            </div>

            <div style={{ height: 14 }} />

            <div style={section.wrap}>
              <div style={section.head}>
                <div style={section.title}>Exercise Warnings</div>
                <div style={section.pillWarn}>Caution</div>
                <div style={section.line} />
                <div style={section.count}>{warnings.length}</div>
              </div>

              {renderSafetyList(warnings, {
                emptyTitle: "No exercise warnings found.",
                emptySub: "You’re good to go based on the current saved conditions.",
                tagStyle: severityTag.warning,
                tagText: "WARNING",
                keyPrefix: "warning-exercise",
              })}
            </div>

            <div style={{ height: 14 }} />

            <div style={section.wrap}>
              <div style={section.head}>
                <div style={section.title}>Blocked Meals</div>
                <div style={section.pillBlocked}>Strict</div>
                <div style={section.line} />
                <div style={section.count}>{blockedMeals.length}</div>
              </div>

              {renderSafetyList(blockedMeals, {
                emptyTitle: "No blocked meals found.",
                emptySub: "Save your allergies or conditions, then click Check Safety.",
                tagStyle: severityTag.blocked,
                tagText: "BLOCKED MEAL",
                keyPrefix: "blocked-meal",
              })}
            </div>

            <div style={{ height: 14 }} />

            <div style={section.wrap}>
              <div style={section.head}>
                <div style={section.title}>Meal Warnings</div>
                <div style={section.pillWarn}>Caution</div>
                <div style={section.line} />
                <div style={section.count}>{mealWarnings.length}</div>
              </div>

              {renderSafetyList(mealWarnings, {
                emptyTitle: "No meal warnings found.",
                emptySub: "You’re good to go based on the current saved conditions.",
                tagStyle: severityTag.warning,
                tagText: "MEAL WARNING",
                keyPrefix: "meal-warning",
              })}
            </div>

            {!hasResults && !loadingCheck ? (
              <div style={{ ...page.note, marginTop: 14 }}>
                No results yet — save conditions, then click <b>Check Safety</b>.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */

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
    padding: 24,
    borderRadius: theme.radius.lg,
    background: theme.colors.card,
    backdropFilter: "blur(20px)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    color: theme.colors.text,
    position: "relative",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: theme.colors.textStrong,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textDim,
    fontSize: 14,
    lineHeight: 1.5,
    maxWidth: 720,
  },
  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(122,92,207,.18)",
    background: "rgba(122,92,207,.10)",
    color: theme.colors.accent,
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  note: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
};

const formBox = {
  wrap: {
    padding: 18,
    borderRadius: theme.radius.lg,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.soft,
  },
  label: {
    display: "block",
    fontSize: 12,
    color: theme.colors.textFaint,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 8,
  },
  radioRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  radioCard: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 14,
    border: `1px solid ${active ? "rgba(122,92,207,.22)" : theme.colors.border}`,
    background: active ? "rgba(122,92,207,.10)" : "rgba(255,255,255,.72)",
    cursor: "pointer",
    fontWeight: 700,
    color: active ? theme.colors.accent : theme.colors.text,
    boxShadow: active ? theme.shadow.soft : "none",
  }),
  radioText: {
    color: theme.colors.text,
    textTransform: "capitalize",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.9)",
    color: theme.colors.text,
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: "12px 14px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.9)",
    color: theme.colors.text,
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    transition: theme.motion.base,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  primary: (disabled) => ({
    padding: "12px 16px",
    borderRadius: theme.radius.pill,
    border: "none",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    background: theme.gradients.primary,
    color: "#4a2d00",
    boxShadow: disabled ? "none" : theme.shadow.button,
    transition: theme.motion.base,
  }),
  secondary: (disabled) => ({
    padding: "12px 14px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.text,
    transition: theme.motion.base,
    boxShadow: theme.shadow.soft,
  }),
  helperRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    color: theme.colors.textDim,
    fontSize: 13,
  },
  helperDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: theme.gradients.mixed,
    boxShadow: theme.shadow.soft,
    flex: "0 0 auto",
  },
  helperText: {},
};

const section = {
  wrap: {
    marginTop: 16,
    padding: 16,
    borderRadius: theme.radius.lg,
    background: "rgba(255,255,255,.45)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.soft,
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  line: {
    height: 1,
    flex: 1,
    background: `linear-gradient(90deg, ${theme.colors.border}, transparent)`,
    opacity: 0.9,
  },
  count: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.7)",
    color: theme.colors.textDim,
    fontWeight: 700,
    fontSize: 12,
    minWidth: 34,
    textAlign: "center",
  },
  pillBlocked: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.dangerBorder}`,
    background: theme.colors.dangerBg,
    color: theme.colors.dangerText,
    fontWeight: 700,
    fontSize: 12,
  },
  pillWarn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(242,178,79,.22)",
    background: "rgba(242,178,79,.14)",
    color: "#9a6107",
    fontWeight: 700,
    fontSize: 12,
  },
};

const empty = {
  box: {
    padding: 14,
    borderRadius: theme.radius.md,
    background: "rgba(255,255,255,.78)",
    border: `1px solid ${theme.colors.border}`,
  },
  title: {
    fontWeight: 800,
    marginBottom: 6,
    color: theme.colors.textStrong,
  },
  sub: {
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.4,
  },
};

const savedList = {
  wrap: {
    display: "grid",
    gap: 12,
  },
};

const savedCard = {
  wrap: {
    padding: 14,
    borderRadius: 16,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.76)",
    boxShadow: theme.shadow.soft,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  left: {
    minWidth: 0,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 8,
    color: theme.colors.textStrong,
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  type: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    textTransform: "capitalize",
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textDim,
  },
  severity: (severity) => ({
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background:
      severity === "high"
        ? "rgba(235,87,87,.12)"
        : severity === "medium"
        ? "rgba(242,178,79,.14)"
        : "rgba(111,207,151,.14)",
    textTransform: "capitalize",
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.text,
  }),
  notes: {
    marginTop: 12,
    color: theme.colors.textDim,
    lineHeight: 1.5,
  },
  deleteBtn: {
    padding: "8px 12px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(235,87,87,.10)",
    color: theme.colors.dangerText,
    cursor: "pointer",
    fontWeight: 700,
  },
};

const anim = {
  wrap: {
    animation: "hcFadeIn .22s ease",
    willChange: "transform, opacity",
  },
};

const exerciseList = {
  wrap: {
    display: "grid",
    gap: 14,
  },
};

const exerciseCard = {
  wrap: {
    display: "flex",
    alignItems: "stretch",
    gap: 14,
    padding: 14,
    borderRadius: 20,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.76)",
    transition: "all .22s ease",
    boxShadow: theme.shadow.soft,
  },
  left: {
    width: 132,
    minWidth: 132,
    height: 132,
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(255,255,255,.7)",
    border: `1px solid ${theme.colors.border}`,
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
    color: theme.colors.textDim,
    background:
      "linear-gradient(135deg, rgba(255,255,255,.65), rgba(245,240,248,.95))",
  },
  placeholderIcon: {
    fontSize: 24,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: 700,
  },
  right: {
    flex: 1,
    minWidth: 0,
    display: "grid",
    gap: 12,
  },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleCol: {
    minWidth: 0,
    flex: 1,
  },
  exerciseName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: theme.colors.textStrong,
    lineHeight: 1.2,
  },
  reasonBox: {
    display: "grid",
    gap: 6,
    padding: "10px 12px",
    borderRadius: 14,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
  },
  reasonLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.textFaint,
    fontWeight: 700,
  },
  reasonText: {
    color: theme.colors.textDim,
    fontSize: 14,
    lineHeight: 1.45,
    fontWeight: 600,
  },
};

const metaRow = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 8,
  },
  target: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
};

const severityTag = {
  blocked: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.dangerBorder}`,
    background: theme.colors.dangerBg,
    color: theme.colors.dangerText,
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  warning: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(242,178,79,.22)",
    background: "rgba(242,178,79,.14)",
    color: "#9a6107",
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: 0.6,
  },
};

if (typeof document !== "undefined" && !document.getElementById("hc-anim-style")) {
  const style = document.createElement("style");
  style.id = "hc-anim-style";
  style.innerHTML = `
    @keyframes hcFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
