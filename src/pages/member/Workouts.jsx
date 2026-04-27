import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { theme, ui } from "../../theme/uiTheme";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const API_BASE = "http://127.0.0.1:8000";

function PlanTimer({ plan }) {
  const [timeLeft, setTimeLeft] = useState(null);

  const calculateTimeLeft = (endDate) => {
    if (!endDate) return null;

    let end;

    if (String(endDate).includes("T")) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date(`${endDate}T23:59:59`);
    }

    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (Number.isNaN(diff)) return null;

    if (diff <= 0) {
      return {
        expired: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      expired: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(plan.end_date));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(plan.end_date));
    }, 1000);

    return () => clearInterval(interval);
  }, [plan.end_date]);

  if (!timeLeft) return null;

  return (
    <div style={countdown.wrap}>
      <div style={countdown.header}>
        <div>
          <div style={countdown.eyebrow}>
            {plan.source === "trainer" ? "TRAINER PLAN" : "WEBSITE PLAN"}
          </div>
          <h3 style={countdown.title}>{plan.title}</h3>
          <div style={countdown.sub}>
            Start: <b>{String(plan.start_date || "-").slice(0, 10)}</b> | End:{" "}
            <b>{String(plan.end_date || "-").slice(0, 10)}</b>
          </div>
        </div>
      </div>

      {timeLeft.expired ? (
        <div style={countdown.expired}>This plan has expired.</div>
      ) : (
        <div style={countdown.grid}>
          <div style={countdown.box}>
            <span style={countdown.num}>{timeLeft.days}</span>
            <span style={countdown.label}>Days</span>
          </div>
          <div style={countdown.box}>
            <span style={countdown.num}>{timeLeft.hours}</span>
            <span style={countdown.label}>Hours</span>
          </div>
          <div style={countdown.box}>
            <span style={countdown.num}>{timeLeft.minutes}</span>
            <span style={countdown.label}>Minutes</span>
          </div>
          <div style={countdown.box}>
            <span style={countdown.num}>{timeLeft.seconds}</span>
            <span style={countdown.label}>Seconds</span>
          </div>
        </div>
      )}
    </div>
  );
}

const roundLabel = (n) => {
  if (n === 1) return "First Round";
  if (n === 2) return "Second Round";
  if (n === 3) return "Third Round";
  return `Round ${n}`;
};

function ExerciseLogSummary({ exercise }) {
  const rows = Array.isArray(exercise?.member_log?.sets) ? exercise.member_log.sets : [];
  const completed = rows.filter((row) => row?.done).length;
  const lastWeight = [...rows].reverse().find((row) => row?.weight !== "" && row?.weight != null)?.weight;
  const lastReps = [...rows].reverse().find((row) => row?.reps !== "" && row?.reps != null)?.reps;

  if (!rows.length && !exercise?.member_log?.note) {
    return (
      <div style={logSummary.emptyWrap}>
        <div style={logSummary.emptyTitle}>No log yet</div>
        <div style={logSummary.emptyText}>Tap the button below to add your workout log.</div>
      </div>
    );
  }

  return (
    <div style={logSummary.wrap}>
      <div style={logSummary.grid}>
        <div style={logSummary.box}>
          <span style={logSummary.label}>Logged Sets</span>
          <span style={logSummary.value}>{rows.length || 0}</span>
        </div>

        <div style={logSummary.box}>
          <span style={logSummary.label}>Completed</span>
          <span style={logSummary.value}>{completed}</span>
        </div>

        <div style={logSummary.box}>
          <span style={logSummary.label}>Last Weight</span>
          <span style={logSummary.value}>{lastWeight != null ? `${lastWeight} kg` : "-"}</span>
        </div>

        <div style={logSummary.box}>
          <span style={logSummary.label}>Last Reps</span>
          <span style={logSummary.value}>{lastReps != null ? lastReps : "-"}</span>
        </div>
      </div>

      {exercise?.member_log?.note ? (
        <div style={logSummary.noteBox}>
          <span style={logSummary.noteLabel}>Last Note:</span> {exercise.member_log.note}
        </div>
      ) : null}
    </div>
  );
}

export default function Workouts() {
  const [data, setData] = useState({});
  const [meta, setMeta] = useState({
    selected_date: null,
    plan_timers: [],
  });
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
    sets: [],
    note: "",
  });

  const createEmptyRows = (count = 3) =>
    Array.from({ length: count }).map((_, i) => ({
      key: `row-${i + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      round: i + 1,
      weight: "",
      reps: "",
      done: false,
    }));

  const fetchWorkouts = async (dateValue = selectedDate) => {
    setLoading(true);
    try {
      const res = await api.get(`/member/workouts?date=${dateValue}`);
      setData(res.data?.days || {});
      setMeta(
        res.data?.meta || {
          selected_date: null,
          plan_timers: [],
        }
      );
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
    const plannedSets = Number(exercise?.sets || 3);
    const savedSets = Array.isArray(exercise?.member_log?.sets)
      ? exercise.member_log.sets
      : [];

    const rows =
      savedSets.length > 0
        ? savedSets.map((s, i) => ({
            key: `saved-${i}-${Date.now()}`,
            round: Number(s.round || i + 1),
            weight: s.weight ?? "",
            reps: s.reps ?? "",
            done: !!s.done,
          }))
        : createEmptyRows(plannedSets > 0 ? plannedSets : 3);

    setLogModal({
      open: true,
      routine,
      exercise,
    });

    setForm({
      sets: rows,
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
      sets: [],
      note: "",
    });
  };

  const updateSetRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      sets: prev.sets.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));
  };

  const toggleSetDone = (index) => {
    setForm((prev) => ({
      ...prev,
      sets: prev.sets.map((row, i) => (i === index ? { ...row, done: !row.done } : row)),
    }));
  };

  const addSetRow = () => {
    setForm((prev) => ({
      ...prev,
      sets: [
        ...prev.sets,
        {
          key: `row-${prev.sets.length + 1}-${Date.now()}`,
          round: prev.sets.length + 1,
          weight: "",
          reps: "",
          done: false,
        },
      ],
    }));
  };

  const saveLog = async () => {
    if (!logModal.routine || !logModal.exercise) return;

    try {
      setSaving(true);

      const cleanedSets = form.sets
        .map((row, i) => ({
          round: Number(row.round || i + 1),
          weight: row.weight === "" || row.weight == null ? null : Number(row.weight),
          reps: row.reps === "" || row.reps == null ? null : Number(row.reps),
          done: !!row.done,
        }))
        .filter((row) => row.weight !== null || row.reps !== null || row.done);

      await api.post("/member/workouts/log", {
        routine_id: logModal.routine.routine_id,
        routine_exercise_id: logModal.exercise.routine_exercise_id,
        exercise_id: logModal.exercise.exercise_id,
        workout_date: selectedDate,
        day_of_week: logModal.exercise.day_of_week,
        sets: cleanedSets,
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
          {meta?.plan_timers?.length > 0 && (
            <div style={countdownList.wrap}>
              {meta.plan_timers.map((plan) => (
                <PlanTimer key={plan.id} plan={plan} />
              ))}
            </div>
          )}

          <div style={page.headerRow}>
            <div>
              <h2 style={page.title}>Workouts</h2>
              <div style={page.subtitle}>Your daily workout plan and exercise log.</div>
            </div>

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
                  <button key={d} style={tabs.btn(d === day)} onClick={() => handleDayChange(d)}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div key={animKey} style={anim.wrap}>
                {!routines.length ? (
                  <div style={{ ...page.dim, marginTop: 14 }}>
                    No workouts for <b style={{ color: theme.colors.textStrong }}>{day}</b>.
                  </div>
                ) : (
                  <div style={{ marginTop: 16, display: "grid", gap: 18 }}>
                    {routines.map((routine) => (
                      <div
                        key={`${routine.member_routine_id}-${routine.routine_id}`}
                        style={routineCard.wrap}
                      >
                        <div style={routineCard.head}>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={routineCard.name}>{routine.routine_name}</h3>

                            <div style={routineCard.dateMeta}>
                              <span style={routineCard.dateTag}>
                                Source: {routine.source === "trainer" ? "Trainer" : "Website"}
                              </span>
                              <span style={routineCard.dateTag}>Start: {routine.start_date || "-"}</span>
                              <span style={routineCard.dateTag}>End: {routine.end_date || "-"}</span>
                            </div>

                            {routine.description ? (
                              <div style={routineCard.desc}>{routine.description}</div>
                            ) : null}
                          </div>
                        </div>

                        <div style={exerciseList.wrap}>
                          {routine.exercises.map((x, idx) => {
                            const imageSrc = getImageUrl(x.image_url);
                            const hasLog = Array.isArray(x?.member_log?.sets) && x.member_log.sets.length > 0;

                            return (
                              <div
                                key={`${x.routine_exercise_id}-${x.exercise_id}-${idx}`}
                                style={exerciseCard.wrap}
                              >
                                <div style={exerciseCard.topSection}>
                                  <div style={exerciseCard.mediaCol}>
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

                                  <div style={exerciseCard.contentCol}>
                                    <div style={exerciseCard.topRow}>
                                      <div style={exerciseCard.titleCol}>
                                        <h4 style={exerciseCard.exerciseName}>{x.exercise_name ?? "-"}</h4>

                                        <div style={metaRow.wrap}>
                                          <span style={metaRow.target}>{x.target_muscle ?? "No target"}</span>

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
                                        <span style={exerciseCard.coachNoteLabel}>Coach Note:</span> {x.notes}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>

                                <ExerciseLogSummary exercise={x} />

                                <div style={exerciseCard.actionsRow}>
                                  <button
                                    type="button"
                                    style={exerciseCard.logBtn}
                                    onClick={() => openLogModal(routine, x)}
                                  >
                                    {hasLog ? "Update Log" : "Log Workout"}
                                  </button>
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
            <div style={modal.topPillRow}>
              <div style={modal.topPill}>Log</div>
              <div style={modal.timerGhost}>Workout Log</div>
            </div>

            <div style={modal.header}>
              <div>
                <h3 style={modal.title}>{logModal.exercise?.exercise_name || "Exercise"}</h3>
                <div style={modal.subtitle}>
                  {logModal.routine?.routine_name || "Routine"} • {selectedDate}
                </div>
              </div>
            </div>

            <div style={modal.metaCards}>
              <div style={modal.metaCard}>
                <span style={modal.metaLabel}>Target</span>
                <span style={modal.metaValue}>{logModal.exercise?.target_muscle || "-"}</span>
              </div>
              <div style={modal.metaCard}>
                <span style={modal.metaLabel}>Planned Sets</span>
                <span style={modal.metaValue}>{logModal.exercise?.sets || "-"}</span>
              </div>
              <div style={modal.metaCard}>
                <span style={modal.metaLabel}>Planned Reps</span>
                <span style={modal.metaValue}>{logModal.exercise?.reps || "-"}</span>
              </div>
              <div style={modal.metaCard}>
                <span style={modal.metaLabel}>Rest</span>
                <span style={modal.metaValue}>
                  {logModal.exercise?.rest_seconds ? `${logModal.exercise.rest_seconds}s` : "-"}
                </span>
              </div>
            </div>

            <div style={modal.sectionTitle}>Sets Log</div>

            <div style={modal.rowsWrap}>
              {form.sets.map((row, index) => (
                <div key={row.key} style={modal.setCard}>
                  <div style={modal.setCardHeader}>
                    <div>
                      <div style={modal.setCardTitle}>Set {row.round}</div>
                      <div style={modal.setCardSub}>{roundLabel(row.round)}</div>
                    </div>

                    <button
                      type="button"
                      style={row.done ? modal.checkBtnDone : modal.checkBtn}
                      onClick={() => toggleSetDone(index)}
                    >
                      {row.done ? "Done" : "Mark Done"}
                    </button>
                  </div>

                  <div style={modal.inputGrid}>
                    <div style={modal.field}>
                      <label style={modal.fieldLabel}>Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.weight}
                        onChange={(e) => updateSetRow(index, "weight", e.target.value)}
                        placeholder="Enter weight"
                        style={modal.metricInput}
                      />
                    </div>

                    <div style={modal.field}>
                      <label style={modal.fieldLabel}>Reps</label>
                      <input
                        type="number"
                        min="0"
                        value={row.reps}
                        onChange={(e) => updateSetRow(index, "reps", e.target.value)}
                        placeholder="Enter reps"
                        style={modal.metricInput}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={modal.addSetInline}>
              <button type="button" style={modal.addSetBtn} onClick={addSetRow}>
                Add Set
              </button>
            </div>

            <div style={modal.noteField}>
              <label style={modal.label}>Note</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
                placeholder="Write how the workout felt, what weight you used, any progress, pain, or fatigue..."
                style={modal.noteInput}
              />
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
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: theme.colors.textStrong,
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textDim,
    fontSize: 14,
  },
  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(122,92,207,.18)",
    background: "rgba(122,92,207,.10)",
    color: theme.colors.accent,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  dim: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
  emptyBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: theme.radius.md,
    background: "rgba(255,255,255,.78)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.soft,
  },
  emptyTitle: {
    fontWeight: 800,
    marginBottom: 6,
    color: theme.colors.textStrong,
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
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.textDim,
  },
  dateInput: {
    ...ui.input,
    padding: "10px 12px",
    background: "rgba(255,255,255,.9)",
  },
};

const countdownList = {
  wrap: {
    display: "grid",
    gap: 16,
    marginBottom: 18,
  },
};

const countdown = {
  wrap: {
    padding: 18,
    borderRadius: 22,
    border: `1px solid rgba(122,92,207,.18)`,
    background: "linear-gradient(135deg, rgba(122,92,207,.10), rgba(242,178,79,.12))",
    boxShadow: theme.shadow.soft,
    display: "grid",
    gap: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
    color: theme.colors.accent,
    marginBottom: 6,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.textDim,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
    gap: 12,
  },
  box: {
    padding: "16px 12px",
    borderRadius: 18,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    display: "grid",
    placeItems: "center",
    gap: 8,
    boxShadow: theme.shadow.soft,
  },
  num: {
    fontSize: 28,
    fontWeight: 800,
    color: theme.colors.textStrong,
    lineHeight: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  expired: {
    padding: "12px 14px",
    borderRadius: 14,
    background: theme.colors.dangerBg,
    border: `1px solid ${theme.colors.dangerBorder}`,
    color: theme.colors.dangerText,
    fontWeight: 700,
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
    border: `1px solid ${active ? "rgba(122,92,207,.22)" : theme.colors.border}`,
    background: active ? "rgba(122,92,207,.10)" : "rgba(255,255,255,.72)",
    color: active ? theme.colors.accent : theme.colors.textDim,
    fontWeight: 700,
    cursor: "pointer",
    transition: theme.motion.base,
    boxShadow: active ? theme.shadow.soft : "none",
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
    padding: 18,
    borderRadius: theme.radius.lg,
    background: "rgba(255,255,255,.48)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.soft,
  },
  head: {
    display: "grid",
    gap: 10,
    marginBottom: 14,
  },
  name: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  dateMeta: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 2,
  },
  dateTag: {
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
  desc: {
    marginTop: 6,
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.5,
  },
};

const exerciseList = {
  wrap: {
    display: "grid",
    gap: 18,
  },
};

const exerciseCard = {
  wrap: {
    width: "100%",
    display: "grid",
    gap: 16,
    padding: 22,
    borderRadius: 28,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.78)",
    transition: "all .22s ease",
    boxShadow: theme.shadow.soft,
    boxSizing: "border-box",
  },
  topSection: {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    gap: 18,
    alignItems: "stretch",
  },
  mediaCol: {
    minWidth: 0,
  },
  contentCol: {
    display: "grid",
    gap: 14,
    minWidth: 0,
    alignContent: "start",
  },
  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block",
    borderRadius: 20,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.68)",
  },
  placeholder: {
    width: "100%",
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
    color: theme.colors.textDim,
    background: "linear-gradient(135deg, rgba(255,255,255,.65), rgba(245,240,248,.95))",
    borderRadius: 20,
    border: `1px solid ${theme.colors.border}`,
  },
  placeholderIcon: {
    fontSize: 24,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: 700,
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
    fontSize: 30,
    fontWeight: 800,
    color: theme.colors.textStrong,
    lineHeight: 1.15,
    textTransform: "lowercase",
  },
  coachNote: {
    padding: "12px 14px",
    borderRadius: 16,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.5,
  },
  coachNoteLabel: {
    color: theme.colors.textStrong,
    fontWeight: 700,
  },
  actionsRow: {
    display: "flex",
    justifyContent: "stretch",
  },
  logBtn: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 18,
    border: "none",
    background: theme.gradients.primary,
    color: "#4a2d00",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: theme.shadow.button,
    fontSize: 15,
  },
};

const metaRow = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 10,
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

const difficulty = {
  tag: (value) => {
    const d = (value || "").toLowerCase();
    const isHard = d.includes("hard") || d.includes("advanced");
    const isMid = d.includes("medium") || d.includes("intermediate");

    const bg = isHard
      ? "rgba(235,87,87,.12)"
      : isMid
      ? "rgba(122,92,207,.10)"
      : "rgba(242,178,79,.14)";

    const border = isHard
      ? theme.colors.dangerBorder
      : isMid
      ? "rgba(122,92,207,.18)"
      : "rgba(242,178,79,.20)";

    const color = isHard
      ? theme.colors.dangerText
      : isMid
      ? theme.colors.accent
      : "#9a6107";

    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      border: `1px solid ${border}`,
      background: bg,
      color,
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 0.2,
      textTransform: "capitalize",
    };
  },
};

const stats = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
    gap: 12,
  },
  item: {
    padding: "14px 14px",
    borderRadius: 16,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    display: "grid",
    gap: 6,
    boxShadow: theme.shadow.soft,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.textFaint,
    fontWeight: 700,
  },
  value: {
    color: theme.colors.textStrong,
    fontWeight: 800,
    fontSize: 18,
  },
};

const logSummary = {
  wrap: {
    display: "grid",
    gap: 12,
    padding: 16,
    borderRadius: 22,
    border: `1px solid ${theme.colors.border}`,
    background: "linear-gradient(180deg, rgba(255,255,255,.64), rgba(247,242,250,.84))",
    boxShadow: "0 18px 42px rgba(98,78,133,.08)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
    gap: 12,
  },
  box: {
    padding: "14px 12px",
    borderRadius: 16,
    background: "rgba(255,255,255,.76)",
    border: `1px solid ${theme.colors.border}`,
    display: "grid",
    gap: 8,
    minHeight: 82,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: theme.colors.textFaint,
    fontWeight: 700,
  },
  value: {
    fontSize: 18,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  noteBox: {
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(255,255,255,.72)",
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.6,
  },
  noteLabel: {
    color: theme.colors.textStrong,
    fontWeight: 700,
  },
  emptyWrap: {
    padding: "16px 18px",
    borderRadius: 20,
    border: `1px dashed rgba(122,92,207,.20)`,
    background: "rgba(255,255,255,.42)",
    display: "grid",
    gap: 6,
  },
  emptyTitle: {
    fontWeight: 800,
    color: theme.colors.textStrong,
    fontSize: 15,
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
};

const modal = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(47,35,71,.28)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    zIndex: 9999,
    backdropFilter: "blur(8px)",
  },
  box: {
    width: "100%",
    maxWidth: 920,
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    borderRadius: theme.radius.lg,
    background: "rgba(255,255,255,.86)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    padding: 20,
    backdropFilter: "blur(20px)",
    color: theme.colors.text,
    boxSizing: "border-box",
  },
  topPillRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  topPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(122,92,207,.10)",
    border: "1px solid rgba(122,92,207,.18)",
    color: theme.colors.accent,
    fontWeight: 700,
    fontSize: 13,
  },
  timerGhost: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontWeight: 700,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textDim,
    fontSize: 13,
  },
  metaCards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  metaCard: {
    padding: "14px 14px",
    borderRadius: 18,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    boxShadow: theme.shadow.soft,
    display: "grid",
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: theme.colors.textFaint,
    fontWeight: 700,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: theme.colors.textStrong,
    marginBottom: 12,
  },
  rowsWrap: {
    display: "grid",
    gap: 12,
  },
  setCard: {
    padding: 16,
    borderRadius: 22,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.62)",
    boxShadow: theme.shadow.soft,
    display: "grid",
    gap: 14,
  },
  setCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  setCardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  setCardSub: {
    marginTop: 4,
    color: theme.colors.textDim,
    fontSize: 13,
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textDim,
    letterSpacing: 0.4,
  },
  metricInput: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 16,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(122,92,207,.08)",
    color: theme.colors.textStrong,
    outline: "none",
    fontSize: 16,
    fontWeight: 700,
    boxSizing: "border-box",
  },
  checkBtn: {
    minWidth: 104,
    height: 42,
    padding: "0 14px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.7)",
    color: theme.colors.textDim,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
  checkBtnDone: {
    minWidth: 104,
    height: 42,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(111,207,151,.24)",
    background: "rgba(111,207,151,.14)",
    color: "#3d8b5d",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
  },
  addSetInline: {
    display: "flex",
    justifyContent: "center",
    marginTop: 16,
  },
  addSetBtn: {
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: theme.gradients.primary,
    color: "#4a2d00",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: theme.shadow.button,
    whiteSpace: "nowrap",
  },
  noteField: {
    marginTop: 18,
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textDim,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  noteInput: {
    width: "100%",
    minHeight: 120,
    padding: "14px 16px",
    borderRadius: 18,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.9)",
    color: theme.colors.text,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontSize: 14,
    lineHeight: 1.6,
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
    borderRadius: theme.radius.pill,
    border: "none",
    fontWeight: 800,
    letterSpacing: 0.2,
    cursor: "pointer",
    background: theme.gradients.primary,
    color: "#4a2d00",
    boxShadow: theme.shadow.button,
  },
  cancelBtn: {
    flex: 1,
    minWidth: 140,
    padding: "14px 16px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: 700,
    cursor: "pointer",
    background: "rgba(255,255,255,.72)",
    color: theme.colors.text,
    boxShadow: theme.shadow.soft,
  },
};
