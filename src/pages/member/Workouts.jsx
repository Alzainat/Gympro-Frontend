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

function WorkoutLogTable({ exercise, onEdit }) {
  const rows = Array.isArray(exercise?.member_log?.sets) ? exercise.member_log.sets : [];

  const displayRows =
    rows.length > 0
      ? rows
      : Array.from({ length: Number(exercise?.sets || 3) || 3 }).map((_, i) => ({
          round: i + 1,
          weight: "",
          reps: "",
          done: false,
        }));

  const nextSetNumber = displayRows.length + 1;

  return (
    <div style={logTable.wrap}>
      <div style={logTable.topBar}>
        <div style={logTable.logPill}>Log</div>
        <button type="button" style={logTable.editBtn} onClick={onEdit}>
          {rows.length ? "Edit" : "Add"}
        </button>
      </div>

      <div style={logTable.exerciseTitle}>{exercise?.exercise_name || "Exercise"}</div>
      <div style={logTable.exerciseSub}>
        {exercise?.target_muscle || "Target muscle"}{" "}
        {exercise?.equipment ? `- ${exercise.equipment}` : ""}
      </div>

      <div style={logTable.tableShell}>
        <div style={logTable.headerRow}>
          <div style={{ ...logTable.headerCell, ...logTable.setCol }}>Set</div>
          <div style={{ ...logTable.headerCell, ...logTable.weightCol }}>Weight</div>
          <div style={{ ...logTable.headerCell, ...logTable.repsCol }}>Reps</div>
          <div style={{ ...logTable.headerCell, ...logTable.checkCol }} />
        </div>

        {displayRows.map((row, index) => (
          <div key={`${row.round}-${index}`} style={logTable.row}>
            <div style={{ ...logTable.cell, ...logTable.setCol }}>
              <span style={logTable.setIndex}>{row.round}</span>
              <span style={logTable.setLabel}>{roundLabel(row.round)}</span>
            </div>

            <div style={{ ...logTable.cell, ...logTable.weightCol }}>
              <div style={logTable.metricPill}>
                {row.weight !== "" && row.weight != null ? `${row.weight} kg` : "-- kg"}
              </div>
            </div>

            <div style={{ ...logTable.cell, ...logTable.repsCol }}>
              <div style={logTable.metricPill}>
                {row.reps !== "" && row.reps != null ? row.reps : "--"}
              </div>
            </div>

            <div style={{ ...logTable.cell, ...logTable.checkCol }}>
              <div style={row.done ? logTable.checkDone : logTable.checkIdle}>
                {row.done ? "✓" : ""}
              </div>
            </div>
          </div>
        ))}

        <div style={logTable.addRow}>
          <div style={{ ...logTable.cell, ...logTable.setCol }}>
            <span style={logTable.nextSetIcon}>＋</span>
            <span style={logTable.nextSetLabel}>Next Set ({nextSetNumber})</span>
          </div>

          <div style={{ ...logTable.cell, ...logTable.weightCol }}>
            <div style={logTable.metricGhost}>-- kg</div>
          </div>

          <div style={{ ...logTable.cell, ...logTable.repsCol }}>
            <div style={logTable.metricGhost}>--</div>
          </div>

          <div style={{ ...logTable.cell, ...logTable.checkCol }}>
            <button type="button" style={logTable.addBtn} onClick={onEdit}>
              {rows.length ? "Update Log" : "Add Set"}
            </button>
          </div>
        </div>
      </div>

      {exercise?.member_log?.note ? (
        <div style={logTable.noteBox}>
          <span style={logTable.noteLabel}>Note:</span> {exercise.member_log.note}
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
      sets: prev.sets.map((row, i) =>
        i === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const toggleSetDone = (index) => {
    setForm((prev) => ({
      ...prev,
      sets: prev.sets.map((row, i) =>
        i === index ? { ...row, done: !row.done } : row
      ),
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
          weight:
            row.weight === "" || row.weight == null ? null : Number(row.weight),
          reps:
            row.reps === "" || row.reps == null ? null : Number(row.reps),
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

                            return (
                              <div
                                key={`${x.routine_exercise_id}-${x.exercise_id}-${idx}`}
                                style={exerciseCard.wrap}
                              >
                                <div style={exerciseCard.visualCol}>
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
                                </div>

                                <div style={exerciseCard.logCol}>
                                  <WorkoutLogTable
                                    exercise={x}
                                    onEdit={() => openLogModal(routine, x)}
                                  />
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

            <div style={modal.tableWrap}>
              <div style={modal.tableHead}>
                <div style={modal.headCellSet}>Set</div>
                <div style={modal.headCell}>Weight</div>
                <div style={modal.headCell}>Reps</div>
                <div style={modal.headCellIcon} />
              </div>

              <div style={modal.tableBody}>
                {form.sets.map((row, index) => (
                  <div key={row.key} style={modal.tableRow}>
                    <div style={modal.setCell}>
                      <span style={modal.setIndex}>{row.round}</span>
                      <span style={modal.setText}>{roundLabel(row.round)}</span>
                    </div>

                    <div style={modal.inputCell}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.weight}
                        onChange={(e) => updateSetRow(index, "weight", e.target.value)}
                        placeholder="-- kg"
                        style={modal.metricInput}
                      />
                    </div>

                    <div style={modal.inputCell}>
                      <input
                        type="number"
                        min="0"
                        value={row.reps}
                        onChange={(e) => updateSetRow(index, "reps", e.target.value)}
                        placeholder="--"
                        style={modal.metricInput}
                      />
                    </div>

                    <div style={modal.checkCell}>
                      <button
                        type="button"
                        style={row.done ? modal.checkBtnDone : modal.checkBtn}
                        onClick={() => toggleSetDone(index)}
                      >
                        {row.done ? "✓" : ""}
                      </button>
                    </div>
                  </div>
                ))}

                <div style={modal.addSetRow}>
                  <div style={modal.nextSetCell}>
                    <span style={modal.nextSetIcon}>＋</span>
                    <span style={modal.nextSetText}>Next Set</span>
                  </div>

                  <div style={modal.ghostMetric}>-- kg</div>
                  <div style={modal.ghostMetric}>--</div>

                  <div style={modal.addSetAction}>
                    <button type="button" style={modal.addSetBtn} onClick={addSetRow}>
                      Add Set
                    </button>
                  </div>
                </div>
              </div>
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
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
    padding: 16,
    borderRadius: 24,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.78)",
    transition: "all .22s ease",
    boxShadow: theme.shadow.soft,
  },
  visualCol: {
    display: "grid",
    gap: 12,
    alignContent: "start",
  },
  logCol: {
    minWidth: 0,
  },
  left: {
    width: "100%",
    height: 210,
    borderRadius: 20,
    overflow: "hidden",
    background: "rgba(255,255,255,.68)",
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
    background: "linear-gradient(135deg, rgba(255,255,255,.65), rgba(245,240,248,.95))",
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
    fontSize: 22,
    fontWeight: 800,
    color: theme.colors.textStrong,
    lineHeight: 1.2,
  },
  coachNote: {
    padding: "10px 12px",
    borderRadius: 14,
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
    gridTemplateColumns: "repeat(3, minmax(90px, 1fr))",
    gap: 10,
  },
  item: {
    padding: "12px 12px",
    borderRadius: 14,
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
    fontSize: 15,
  },
};

const logTable = {
  wrap: {
    padding: 18,
    borderRadius: 28,
    background:
      "linear-gradient(180deg, rgba(255,255,255,.78), rgba(247,242,250,.92))",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: "0 18px 42px rgba(98,78,133,.10)",
    display: "grid",
    gap: 14,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  logPill: {
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
  editBtn: {
    padding: "8px 14px",
    borderRadius: 14,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.75)",
    color: theme.colors.textStrong,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: theme.shadow.soft,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },
  exerciseSub: {
    color: theme.colors.textDim,
    fontSize: 14,
    marginTop: -6,
  },
  tableShell: {
    borderRadius: 26,
    border: `1px solid rgba(99,78,133,.10)`,
    background: "rgba(255,255,255,.54)",
    overflow: "hidden",
  },
  headerRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.1fr 1.1fr .6fr",
    background: "rgba(255,255,255,.38)",
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.1fr 1.1fr .6fr",
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  addRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.1fr 1.1fr .8fr",
    background: "rgba(255,255,255,.34)",
  },
  headerCell: {
    padding: "14px 16px",
    fontWeight: 700,
    color: theme.colors.textDim,
    fontSize: 16,
  },
  cell: {
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    minHeight: 72,
  },
  setCol: {
    gap: 12,
  },
  weightCol: {
    justifyContent: "center",
  },
  repsCol: {
    justifyContent: "center",
  },
  checkCol: {
    justifyContent: "center",
  },
  setIndex: {
    width: 28,
    color: theme.colors.textDim,
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },
  setLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textStrong,
  },
  metricPill: {
    minWidth: 130,
    padding: "12px 18px",
    borderRadius: 999,
    background: "rgba(122,92,207,.10)",
    color: theme.colors.accent,
    fontWeight: 800,
    fontSize: 16,
    textAlign: "center",
  },
  metricGhost: {
    minWidth: 130,
    padding: "12px 18px",
    borderRadius: 999,
    border: "1.5px dashed rgba(122,92,207,.18)",
    color: theme.colors.textFaint,
    fontWeight: 700,
    fontSize: 16,
    textAlign: "center",
    background: "rgba(255,255,255,.28)",
  },
  checkDone: {
    width: 42,
    height: 42,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(111,207,151,.14)",
    border: "1px solid rgba(111,207,151,.24)",
    color: "#3d8b5d",
    fontWeight: 900,
    fontSize: 22,
  },
  checkIdle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.65)",
    border: `1px solid ${theme.colors.border}`,
  },
  nextSetIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(122,92,207,.10)",
    border: "1px solid rgba(122,92,207,.18)",
    color: theme.colors.accent,
    fontWeight: 800,
    fontSize: 18,
  },
  nextSetLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textStrong,
  },
  addBtn: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "none",
    background: theme.gradients.primary,
    color: "#4a2d00",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: theme.shadow.button,
    whiteSpace: "nowrap",
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
    maxWidth: 820,
    borderRadius: theme.radius.lg,
    background: "rgba(255,255,255,.86)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    padding: 20,
    backdropFilter: "blur(20px)",
    color: theme.colors.text,
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
  tableWrap: {
    borderRadius: 28,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.58)",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.1fr 1.1fr .7fr",
    padding: "0",
    borderBottom: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.32)",
  },
  headCellSet: {
    padding: "14px 18px",
    fontWeight: 700,
    color: theme.colors.textDim,
    fontSize: 18,
  },
  headCell: {
    padding: "14px 18px",
    fontWeight: 700,
    color: theme.colors.textDim,
    fontSize: 18,
    textAlign: "center",
  },
  headCellIcon: {
    padding: "14px 18px",
  },
  tableBody: {
    display: "grid",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.1fr 1.1fr .7fr",
    borderBottom: `1px solid ${theme.colors.border}`,
    minHeight: 78,
  },
  setCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 18px",
  },
  setIndex: {
    width: 28,
    color: theme.colors.textDim,
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },
  setText: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textStrong,
  },
  inputCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
  },
  metricInput: {
    width: "100%",
    maxWidth: 140,
    padding: "12px 16px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(122,92,207,.08)",
    color: theme.colors.textStrong,
    outline: "none",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    boxSizing: "border-box",
  },
  checkCell: {
    display: "grid",
    placeItems: "center",
    padding: "10px",
  },
  checkBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.7)",
    color: theme.colors.textDim,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 18,
  },
  checkBtnDone: {
    width: 42,
    height: 42,
    borderRadius: 999,
    border: "1px solid rgba(111,207,151,.24)",
    background: "rgba(111,207,151,.14)",
    color: "#3d8b5d",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 18,
  },
  addSetRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.1fr 1.1fr .9fr",
    minHeight: 84,
    background: "rgba(255,255,255,.26)",
  },
  nextSetCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 18px",
  },
  nextSetIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(122,92,207,.10)",
    border: "1px solid rgba(122,92,207,.18)",
    color: theme.colors.accent,
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
  },
  nextSetText: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textStrong,
  },
  ghostMetric: {
    margin: "auto",
    minWidth: 130,
    padding: "12px 16px",
    borderRadius: 999,
    border: "1.5px dashed rgba(122,92,207,.18)",
    color: theme.colors.textFaint,
    fontWeight: 700,
    fontSize: 16,
    textAlign: "center",
    background: "rgba(255,255,255,.28)",
  },
  addSetAction: {
    display: "grid",
    placeItems: "center",
    padding: "10px 14px",
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
    marginTop: 16,
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