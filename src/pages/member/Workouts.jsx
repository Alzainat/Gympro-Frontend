import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { theme, ui } from "../../theme/uiTheme";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const API_BASE = "http://127.0.0.1:8000";

export default function Workouts() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("Monday");
  const [animKey, setAnimKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const [logModal, setLogModal] = useState({
    open: false,
    routine: null,
    exercise: null,
  });

  const [form, setForm] = useState({
    weight: "",
    sets_done: "",
    reps_done: "",
    note: "",
  });

  const fetchWorkouts = async (dateValue = selectedDate) => {
    setLoading(true);
    try {
      const res = await api.get(`/member/workouts?date=${dateValue}`);
      setData(res.data || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const routines = useMemo(() => data?.[day] || [], [data, day]);

  const handleDayChange = (d) => {
    setDay(d);
    setAnimKey((k) => k + 1);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE}/storage/${path}`;
  };

  const openLogModal = (routine, exercise) => {
    setLogModal({
      open: true,
      routine,
      exercise,
    });

    setForm({
      weight: exercise?.member_log?.weight ?? "",
      sets_done: exercise?.member_log?.sets_done ?? "",
      reps_done: exercise?.member_log?.reps_done ?? "",
      note: exercise?.member_log?.note ?? "",
    });
  };

  const closeLogModal = () => {
    setLogModal({
      open: false,
      routine: null,
      exercise: null,
    });

    setForm({
      weight: "",
      sets_done: "",
      reps_done: "",
      note: "",
    });
  };

  const saveLog = async () => {
    if (!logModal.routine || !logModal.exercise) return;

    try {
      setSaving(true);

      await api.post("/member/workouts/log", {
        routine_id: logModal.routine.routine_id,
        routine_exercise_id: logModal.exercise.routine_exercise_id,
        exercise_id: logModal.exercise.exercise_id,
        workout_date: selectedDate,
        day_of_week: logModal.exercise.day_of_week,
        weight: form.weight === "" ? null : Number(form.weight),
        sets_done: form.sets_done === "" ? null : Number(form.sets_done),
        reps_done: form.reps_done === "" ? null : Number(form.reps_done),
        note: form.note?.trim() ? form.note.trim() : null,
      });

      await fetchWorkouts(selectedDate);
      closeLogModal();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save workout log");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={page.page}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={page.container}>
        <div style={page.card}>
          <div style={page.headerRow}>
            <h2 style={page.title}>Workouts</h2>
            <div style={page.badge}>{day.slice(0, 3).toUpperCase()}</div>
          </div>

          {!loading && Object.keys(data || {}).length > 0 && (
            <div style={page.dateWrap}>
              <label style={page.dateLabel}>Workout Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={page.dateInput}
              />
            </div>
          )}

          {loading ? (
            <div style={page.dim}>Loading workouts...</div>
          ) : !Object.keys(data || {}).length ? (
            <div style={page.emptyBox}>
              <div style={page.emptyTitle}>No workouts assigned yet</div>
              <div style={page.dim}>Go to Payments and subscribe first.</div>
            </div>
          ) : (
            <>
              <div style={tabs.wrap}>
                {DAYS.map((d) => (
                  <button
                    key={d}
                    style={tabs.btn(d === day)}
                    onClick={() => handleDayChange(d)}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div key={animKey} style={anim.wrap}>
                {!routines.length ? (
                  <div style={{ ...page.dim, marginTop: 14 }}>
                    No workouts for <b style={{ color: theme.colors.text }}>{day}</b>.
                  </div>
                ) : (
                  <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
                    {routines.map((routine) => (
                      <div key={routine.routine_id} style={routineCard.wrap}>
                        <div style={routineCard.head}>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={routineCard.name}>{routine.routine_name}</h3>
                            {routine.description ? (
                              <div style={routineCard.desc}>{routine.description}</div>
                            ) : null}
                          </div>
                          <div style={routineCard.line} />
                        </div>

                        <div style={exerciseList.wrap}>
                          {routine.exercises.map((x, idx) => {
                            const imageSrc = getImageUrl(x.image_url);

                            return (
                              <div
                                key={`${x.routine_exercise_id}-${x.exercise_id}-${idx}`}
                                style={exerciseCard.wrap}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-3px)";
                                  e.currentTarget.style.border = `1px solid ${theme.colors.borderSoft}`;
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
                                      alt={x.exercise_name || "Exercise"}
                                      style={exerciseCard.image}
                                    />
                                  ) : (
                                    <div style={exerciseCard.placeholder}>
                                      <span style={exerciseCard.placeholderIcon}>🏋️</span>
                                      <span style={exerciseCard.placeholderText}>No image</span>
                                    </div>
                                  )}
                                </div>

                                <div style={exerciseCard.right}>
                                  <div style={exerciseCard.topRow}>
                                    <div style={exerciseCard.titleCol}>
                                      <h4 style={exerciseCard.exerciseName}>
                                        {x.exercise_name ?? "-"}
                                      </h4>

                                      <div style={metaRow.wrap}>
                                        <span style={metaRow.target}>
                                          {x.target_muscle ?? "No target"}
                                        </span>

                                        <span style={difficulty.tag(x.difficulty)}>
                                          {x.difficulty ?? "-"}
                                        </span>

                                        {x.equipment ? (
                                          <span style={metaRow.target}>{x.equipment}</span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={stats.wrap}>
                                    <div style={stats.item}>
                                      <span style={stats.label}>Sets</span>
                                      <span style={stats.value}>{x.sets ?? "-"}</span>
                                    </div>

                                    <div style={stats.item}>
                                      <span style={stats.label}>Reps</span>
                                      <span style={stats.value}>{x.reps ?? "-"}</span>
                                    </div>

                                    <div style={stats.item}>
                                      <span style={stats.label}>Rest</span>
                                      <span style={stats.value}>
                                        {x.rest_seconds ? `${x.rest_seconds}s` : "-"}
                                      </span>
                                    </div>
                                  </div>

                                  {x.notes ? (
                                    <div style={exerciseCard.coachNote}>
                                      <span style={exerciseCard.coachNoteLabel}>Coach Note:</span>{" "}
                                      {x.notes}
                                    </div>
                                  ) : null}

                                  {x.member_log ? (
                                    <div style={memberLog.wrap}>
                                      <div style={memberLog.title}>Your Log</div>
                                      <div style={memberLog.grid}>
                                        <div style={memberLog.item}>
                                          <span style={memberLog.label}>Weight</span>
                                          <span style={memberLog.value}>
                                            {x.member_log.weight ?? "-"} {x.member_log.weight != null ? "kg" : ""}
                                          </span>
                                        </div>

                                        <div style={memberLog.item}>
                                          <span style={memberLog.label}>Sets Done</span>
                                          <span style={memberLog.value}>
                                            {x.member_log.sets_done ?? "-"}
                                          </span>
                                        </div>

                                        <div style={memberLog.item}>
                                          <span style={memberLog.label}>Reps Done</span>
                                          <span style={memberLog.value}>
                                            {x.member_log.reps_done ?? "-"}
                                          </span>
                                        </div>
                                      </div>

                                      {x.member_log.note ? (
                                        <div style={memberLog.note}>
                                          <span style={memberLog.noteLabel}>Note:</span>{" "}
                                          {x.member_log.note}
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}

                                  <div style={actionRow.wrap}>
                                    <button
                                      style={actionRow.primaryBtn}
                                      onClick={() => openLogModal(routine, x)}
                                    >
                                      {x.member_log ? "Edit Log" : "Add Log"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {logModal.open && (
        <div style={modal.backdrop} onClick={closeLogModal}>
          <div style={modal.box} onClick={(e) => e.stopPropagation()}>
            <div style={modal.header}>
              <div>
                <h3 style={modal.title}>
                  {logModal.exercise?.exercise_name || "Exercise"} Log
                </h3>
                <div style={modal.subtitle}>
                  {selectedDate} • {logModal.exercise?.day_of_week || ""}
                </div>
              </div>
            </div>

            <div style={modal.grid}>
              <div style={modal.field}>
                <label style={modal.label}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.weight}
                  onChange={(e) => setForm((s) => ({ ...s, weight: e.target.value }))}
                  placeholder="e.g. 35"
                  style={ui.input}
                />
              </div>

              <div style={modal.fieldRow}>
                <div style={modal.field}>
                  <label style={modal.label}>Sets Done</label>
                  <input
                    type="number"
                    min="0"
                    value={form.sets_done}
                    onChange={(e) => setForm((s) => ({ ...s, sets_done: e.target.value }))}
                    placeholder="e.g. 4"
                    style={ui.input}
                  />
                </div>

                <div style={modal.field}>
                  <label style={modal.label}>Reps Done</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reps_done}
                    onChange={(e) => setForm((s) => ({ ...s, reps_done: e.target.value }))}
                    placeholder="e.g. 12"
                    style={ui.input}
                  />
                </div>
              </div>

              <div style={modal.field}>
                <label style={modal.label}>Note</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
                  placeholder="Write how the set felt, what weight you used, any difficulty, pain, or progress..."
                  style={{ ...ui.input, minHeight: 120, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={modal.actions}>
              <button style={modal.saveBtn} onClick={saveLog} disabled={saving}>
                {saving ? "Saving..." : "Save Log"}
              </button>

              <button style={modal.cancelBtn} onClick={closeLogModal} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
    position: "relative",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 0.6,
  },
  badge: {
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(0,245,212,.10)",
    color: theme.colors.primary,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 1,
  },
  dim: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
  emptyBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: theme.radius.md,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
  },
  emptyTitle: {
    fontWeight: 900,
    marginBottom: 6,
  },
  dateWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
    maxWidth: 220,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.textDim,
  },
  dateInput: {
    ...ui.input,
    padding: "10px 12px",
  },
};

const tabs = {
  wrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 12,
  },
  btn: (active) => ({
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: active ? "rgba(0,245,212,.14)" : "rgba(255,255,255,.03)",
    color: active ? theme.colors.primary : theme.colors.textDim,
    fontWeight: 900,
    cursor: "pointer",
    transition: theme.motion.base,
    boxShadow: active ? theme.shadow.glow : "none",
    userSelect: "none",
  }),
};

const anim = {
  wrap: {
    animation: "workoutsFadeIn .22s ease",
    willChange: "transform, opacity",
  },
};

if (typeof document !== "undefined" && !document.getElementById("workouts-anim-style")) {
  const style = document.createElement("style");
  style.id = "workouts-anim-style";
  style.innerHTML = `
    @keyframes workoutsFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

const routineCard = {
  wrap: {
    padding: 16,
    borderRadius: theme.radius.lg,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: 0.3,
  },
  desc: {
    marginTop: 6,
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.5,
  },
  line: {
    height: 1,
    flex: 1,
    background: `linear-gradient(90deg, ${theme.colors.border}, transparent)`,
    opacity: 0.9,
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
    background: "rgba(255,255,255,.03)",
    transition: "all .22s ease",
    boxShadow: "0 10px 30px rgba(0,0,0,.18)",
  },
  left: {
    width: 132,
    minWidth: 132,
    height: 132,
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(255,255,255,.04)",
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
    background: "linear-gradient(135deg, rgba(255,255,255,.03), rgba(255,255,255,.06))",
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
    fontWeight: 900,
    color: theme.colors.text,
    lineHeight: 1.2,
  },
  coachNote: {
    padding: "10px 12px",
    borderRadius: 14,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.03)",
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.5,
  },
  coachNoteLabel: {
    color: theme.colors.text,
    fontWeight: 800,
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
    background: "rgba(255,255,255,.04)",
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.4,
  },
};

const difficulty = {
  tag: (value) => {
    const d = (value || "").toLowerCase();
    const isHard = d.includes("hard") || d.includes("advanced");
    const isMid = d.includes("medium") || d.includes("intermediate");

    const bg = isHard
      ? "rgba(255,59,59,.12)"
      : isMid
      ? "rgba(124,58,237,.14)"
      : "rgba(0,245,212,.12)";

    const border = isHard
      ? theme.colors.dangerBorder
      : isMid
      ? "rgba(124,58,237,.35)"
      : "rgba(0,245,212,.30)";

    const color = isHard
      ? theme.colors.dangerText
      : isMid
      ? "#c4b5fd"
      : theme.colors.primary;

    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      border: `1px solid ${border}`,
      background: bg,
      color,
      fontWeight: 900,
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: "capitalize",
    };
  },
};

const stats = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(90px, 1fr))",
    gap: 10,
  },
  item: {
    padding: "10px 12px",
    borderRadius: 14,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.03)",
    display: "grid",
    gap: 6,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.textFaint,
    fontWeight: 800,
  },
  value: {
    color: theme.colors.text,
    fontWeight: 900,
    fontSize: 15,
  },
};

const memberLog = {
  wrap: {
    padding: 12,
    borderRadius: 16,
    border: `1px solid rgba(0,245,212,.18)`,
    background: "rgba(0,245,212,.06)",
    display: "grid",
    gap: 10,
  },
  title: {
    fontWeight: 900,
    color: theme.colors.primary,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(100px, 1fr))",
    gap: 10,
  },
  item: {
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,.04)",
    border: `1px solid ${theme.colors.border}`,
    display: "grid",
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textFaint,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: 800,
  },
  value: {
    fontSize: 14,
    fontWeight: 900,
    color: theme.colors.text,
  },
  note: {
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.5,
  },
  noteLabel: {
    color: theme.colors.text,
    fontWeight: 800,
  },
};

const actionRow = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(0,245,212,.10)",
    color: theme.colors.primary,
    fontWeight: 800,
    cursor: "pointer",
    transition: theme.motion.base,
  },
};

const modal = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.55)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    zIndex: 9999,
  },
  box: {
    width: "100%",
    maxWidth: 560,
    borderRadius: theme.radius.lg,
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    padding: 20,
    backdropFilter: "blur(20px)",
    color: theme.colors.text,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textDim,
    fontSize: 13,
  },
  grid: {
    display: "grid",
    gap: 12,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 800,
    color: theme.colors.textDim,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },
  saveBtn: {
    flex: 1,
    minWidth: 140,
    padding: "14px 16px",
    borderRadius: theme.radius.md,
    border: "none",
    fontWeight: 900,
    letterSpacing: 0.8,
    cursor: "pointer",
    background: theme.gradients.primary,
    color: "#061018",
    boxShadow: theme.shadow.glow,
  },
  cancelBtn: {
    flex: 1,
    minWidth: 140,
    padding: "14px 16px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: 800,
    cursor: "pointer",
    background: "rgba(255,255,255,.05)",
    color: theme.colors.text,
  },
};