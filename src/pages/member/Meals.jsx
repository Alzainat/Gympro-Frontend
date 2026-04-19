import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { theme, ui } from "../../theme/uiTheme";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = ["breakfast", "lunch", "dinner", "snack", "other"];
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

    if (Number.isNaN(diff)) {
      return null;
    }

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
          <div style={countdown.eyebrow}>WEBSITE MEAL PLAN</div>
          <h3 style={countdown.title}>{plan.title}</h3>
          <div style={countdown.sub}>
            Start: <b>{String(plan.start_date || "-").slice(0, 10)}</b> | End:{" "}
            <b>{String(plan.end_date || "-").slice(0, 10)}</b>
          </div>
        </div>
      </div>

      {timeLeft.expired ? (
        <div style={countdown.expired}>This meal plan has expired.</div>
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

export default function Meals() {
  const [data, setData] = useState({});
  const [meta, setMeta] = useState({
    selected_date: null,
    plan_timer: null,
  });
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("Monday");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    api.get("/member/meals")
      .then((res) => {
        setData(res.data?.days || {});
        setMeta(
          res.data?.meta || {
            selected_date: null,
            plan_timer: null,
          }
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const dayGroups = useMemo(() => data?.[day] || {}, [data, day]);

  const hasAny = useMemo(
    () => TIMES.some((t) => (dayGroups?.[t] || []).length > 0),
    [dayGroups]
  );

  const dayTotals = useMemo(() => {
    const allItems = TIMES.flatMap((time) => dayGroups?.[time] || []);

    return allItems.reduce(
      (acc, item) => {
        acc.grams += Number(item?.grams || 0);
        acc.calories += Number(item?.calories || 0);
        acc.protein += Number(item?.protein || 0);
        acc.carbs += Number(item?.carbs || 0);
        acc.fats += Number(item?.fats || 0);
        return acc;
      },
      { grams: 0, calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [dayGroups]);

  const handleDayChange = (d) => {
    setDay(d);
    setAnimKey((k) => k + 1);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE}/storage/${path}`;
  };

  return (
    <div style={page.page}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={page.container}>
        <div style={page.card}>
          {meta?.plan_timer && <PlanTimer plan={meta.plan_timer} />}

          <div style={page.headerRow}>
            <h2 style={page.title}>Meals</h2>
            <div style={page.badge}>{day.slice(0, 3).toUpperCase()}</div>
          </div>

          {loading ? (
            <div style={page.dim}>Loading meals...</div>
          ) : !Object.keys(data || {}).length ? (
            <div style={page.emptyBox}>
              <div style={page.emptyTitle}>No meals assigned yet</div>
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
                {!hasAny ? (
                  <div style={{ ...page.dim, marginTop: 14 }}>
                    No meals for <b style={{ color: theme.colors.text }}>{day}</b>.
                  </div>
                ) : (
                  <div style={{ marginTop: 16, display: "grid", gap: 18 }}>
                    <div style={totals.wrap}>
                      <div style={totals.card}>
                        <span style={totals.label}>Total Grams</span>
                        <span style={totals.value}>{dayTotals.grams} g</span>
                      </div>
                      <div style={totals.card}>
                        <span style={totals.label}>Total Kcal</span>
                        <span style={totals.value}>{dayTotals.calories} kcal</span>
                      </div>
                      <div style={totals.card}>
                        <span style={totals.label}>Total Protein</span>
                        <span style={totals.value}>{dayTotals.protein} g</span>
                      </div>
                      <div style={totals.card}>
                        <span style={totals.label}>Total Carbs</span>
                        <span style={totals.value}>{dayTotals.carbs} g</span>
                      </div>
                      <div style={totals.card}>
                        <span style={totals.label}>Total Fats</span>
                        <span style={totals.value}>{dayTotals.fats} g</span>
                      </div>
                    </div>

                    {TIMES.map((time) => {
                      const items = dayGroups?.[time] || [];
                      if (!items.length) return null;

                      return (
                        <div key={time} style={section.wrap}>
                          <div style={section.head}>
                            <div style={section.pill}>{time}</div>
                            <div style={section.line} />
                            <div style={section.count}>{items.length}</div>
                          </div>

                          <div style={mealList.wrap}>
                            {items.map((m, idx) => {
                              const imageSrc = getImageUrl(m.image_url);

                              return (
                                <div
                                  key={m.assignment_id ?? `${m.meal_id}-${idx}`}
                                  style={mealCard.wrap}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-3px)";
                                    e.currentTarget.style.border = `1px solid ${theme.colors.borderSoft}`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.border = `1px solid ${theme.colors.border}`;
                                  }}
                                >
                                  <div style={mealCard.left}>
                                    {imageSrc ? (
                                      <img
                                        src={imageSrc}
                                        alt={m.name || "Meal"}
                                        style={mealCard.image}
                                      />
                                    ) : (
                                      <div style={mealCard.placeholder}>
                                        <span style={mealCard.placeholderIcon}>🍽️</span>
                                        <span style={mealCard.placeholderText}>No image</span>
                                      </div>
                                    )}
                                  </div>

                                  <div style={mealCard.right}>
                                    <div style={mealCard.topRow}>
                                      <div style={mealCard.titleCol}>
                                        <h3 style={mealCard.name}>{m.name ?? "-"}</h3>
                                        <div style={mealCard.metaRow}>
                                          <span style={mealCard.metaTag}>Source: Website</span>
                                          <span style={mealCard.metaTag}>
                                            Start: {m.start_date || "-"}
                                          </span>
                                          <span style={mealCard.metaTag}>
                                            End: {m.end_date || "-"}
                                          </span>
                                        </div>

                                        {m.description ? (
                                          <p style={mealCard.desc}>{m.description}</p>
                                        ) : (
                                          <p style={mealCard.descMuted}>No description available.</p>
                                        )}
                                      </div>

                                      <span style={calorie.pill}>
                                        {m.calories ?? "-"} {m.calories ? "kcal" : ""}
                                      </span>
                                    </div>

                                    <div style={gramsRow.wrap}>
                                      <span style={gramsRow.label}>Portion</span>
                                      <span style={gramsRow.value}>
                                        {m.grams ?? "-"} {m.grams ? "g" : ""}
                                      </span>
                                    </div>

                                    <div style={macroBox.wrap}>
                                      <div style={macroBox.item}>
                                        <span style={macroBox.label}>Protein</span>
                                        <span style={macroBox.valuePrimary}>
                                          {m.protein ?? "-"} {m.protein ? "g" : ""}
                                        </span>
                                      </div>
                                      <div style={macroBox.item}>
                                        <span style={macroBox.label}>Carbs</span>
                                        <span style={macroBox.valuePurple}>
                                          {m.carbs ?? "-"} {m.carbs ? "g" : ""}
                                        </span>
                                      </div>
                                      <div style={macroBox.item}>
                                        <span style={macroBox.label}>Fats</span>
                                        <span style={macroBox.valueLight}>
                                          {m.fats ?? "-"} {m.fats ? "g" : ""}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
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
};

const countdown = {
  wrap: {
    marginBottom: 18,
    padding: 18,
    borderRadius: 22,
    border: `1px solid rgba(0,245,212,.20)`,
    background: "linear-gradient(135deg, rgba(0,245,212,.10), rgba(124,58,237,.10))",
    boxShadow: "0 12px 30px rgba(0,0,0,.18)",
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
    fontWeight: 900,
    color: theme.colors.primary,
    marginBottom: 6,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: theme.colors.text,
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
    background: "rgba(255,255,255,.05)",
    display: "grid",
    placeItems: "center",
    gap: 8,
  },
  num: {
    fontSize: 28,
    fontWeight: 900,
    color: theme.colors.text,
    lineHeight: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 800,
    color: theme.colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  expired: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,59,59,.10)",
    border: `1px solid ${theme.colors.dangerBorder}`,
    color: theme.colors.dangerText,
    fontWeight: 800,
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
    animation: "mealsFadeIn .22s ease",
    willChange: "transform, opacity",
  },
};

if (typeof document !== "undefined" && !document.getElementById("meals-anim-style")) {
  const style = document.createElement("style");
  style.id = "meals-anim-style";
  style.innerHTML = `
    @keyframes mealsFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

const totals = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },
  card: {
    padding: "12px 14px",
    borderRadius: 16,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.04)",
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
    fontSize: 16,
  },
};

const section = {
  wrap: {
    padding: 16,
    borderRadius: theme.radius.lg,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  pill: {
    textTransform: "capitalize",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(124,58,237,.12)",
    color: "#c4b5fd",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  count: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.04)",
    color: theme.colors.textDim,
    fontWeight: 900,
    fontSize: 12,
    minWidth: 34,
    textAlign: "center",
  },
  line: {
    height: 1,
    flex: 1,
    background: `linear-gradient(90deg, ${theme.colors.border}, transparent)`,
    opacity: 0.9,
  },
};

const mealList = {
  wrap: {
    display: "grid",
    gap: 14,
  },
};

const mealCard = {
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
  name: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    color: theme.colors.text,
    lineHeight: 1.2,
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  metaTag: {
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
  desc: {
    margin: "6px 0 0",
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 1.6,
  },
  descMuted: {
    margin: "6px 0 0",
    color: theme.colors.textFaint,
    fontSize: 13,
    lineHeight: 1.6,
    fontStyle: "italic",
  },
};

const calorie = {
  pill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,245,212,.12)",
    border: `1px solid rgba(0,245,212,.35)`,
    color: theme.colors.primary,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.5,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};

const gramsRow = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.textFaint,
    fontWeight: 800,
  },
  value: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,.05)",
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    fontWeight: 900,
    fontSize: 12,
  },
};

const macroBox = {
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
  valuePrimary: {
    color: theme.colors.primary,
    fontWeight: 900,
    fontSize: 15,
  },
  valuePurple: {
    color: "#c4b5fd",
    fontWeight: 900,
    fontSize: 15,
  },
  valueLight: {
    color: "rgba(255,255,255,.88)",
    fontWeight: 900,
    fontSize: 15,
  },
};