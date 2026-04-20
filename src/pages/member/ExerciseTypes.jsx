import { useMemo, useState } from "react";
import { theme, ui } from "../../theme/uiTheme";

const library = [
  {
    name: "Chest",
    tagline: "Pressing strength + chest control",
    exercises: [
      {
        title: "Push-Up",
        summary: "A classic chest movement that builds strength and control.",
        level: "Beginner",
        equipment: "Bodyweight",
        duration: "2–4 sets",
        steps: [
          { title: "Set your position", text: "Hands under shoulders, body in a straight line, core braced." },
          { title: "Controlled descent", text: "Lower your chest toward the floor with elbows at a comfortable angle." },
          { title: "Strong press", text: "Push the floor away and return to the top without locking your joints hard." },
          { title: "Breathe & repeat", text: "Inhale down, exhale up. Keep a steady rhythm." },
        ],
        cues: ["Keep hips aligned (no sagging).", "Neck neutral, eyes slightly forward."],
        youtube: "https://youtube.com/shorts/yQEx9OC2C3E?si=OKHcmA_UctkPv-6Z",
      },
      {
        title: "Dumbbell Bench Press",
        summary: "Targets chest with great range of motion using dumbbells.",
        level: "Intermediate",
        equipment: "Dumbbells + Bench",
        duration: "3–5 sets",
        steps: [
          { title: "Setup", text: "Feet planted, shoulders down and back, dumbbells near your chest." },
          { title: "Press path", text: "Press up and slightly inward to stack dumbbells over your chest." },
          { title: "Slow return", text: "Lower under control until dumbbells are near chest level again." },
          { title: "Stay tight", text: "Maintain core tension and stable shoulder position." },
        ],
        cues: ["Avoid flaring elbows too wide.", "Control the lowering phase."],
        youtube: "",
      },
    ],
  },
  {
    name: "Back",
    tagline: "Pulling strength + posture",
    exercises: [
      {
        title: "Lat Pulldown",
        summary: "Builds width and strength in your lats.",
        level: "Beginner",
        equipment: "Machine",
        duration: "3–4 sets",
        steps: [
          { title: "Grip", text: "Hands slightly wider than shoulders, chest tall." },
          { title: "Pull to chest", text: "Pull the bar toward upper chest while squeezing shoulder blades down." },
          { title: "Pause", text: "Hold for 1 second at the bottom to feel your lats." },
          { title: "Controlled release", text: "Return the bar slowly without losing posture." },
        ],
        cues: ["Don’t swing your body.", "Keep ribs down and chest proud."],
        youtube: "",
      },
    ],
  },
];

function Badge({ children }) {
  return <span style={p.badge}>{children}</span>;
}

function Chevron({ open }) {
  return (
    <span
      style={{
        ...p.chev,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
      aria-hidden="true"
    >
      ▾
    </span>
  );
}

function StepCard({ index, step }) {
  return (
    <div style={p.stepCard}>
      <div style={p.stepIndex}>{index}</div>
      <div>
        <div style={p.stepTitle}>{step.title}</div>
        <div style={p.stepText}>{step.text}</div>
      </div>
    </div>
  );
}

function ExerciseAccordion({ ex, open, onToggle }) {
  return (
    <div style={p.exerciseCard}>
      <button type="button" onClick={onToggle} style={p.exerciseHeaderBtn} aria-expanded={open}>
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          <div style={p.exerciseTitleRow}>
            <div style={p.exerciseTitle}>{ex.title}</div>
            <div style={p.badgesRow}>
              <Badge>{ex.level}</Badge>
              <Badge>{ex.equipment}</Badge>
              <Badge>{ex.duration}</Badge>
            </div>
          </div>

          <div style={p.exerciseSummary}>{ex.summary}</div>
        </div>

        <Chevron open={open} />
      </button>

      {open && (
        <div style={p.exerciseBody}>
          <div style={p.sectionLabel}>How to do it</div>
          <div style={p.stepsGrid}>
            {ex.steps.map((step, i) => (
              <StepCard key={i} index={i + 1} step={step} />
            ))}
          </div>

          {ex.cues?.length ? (
            <>
              <div style={{ ...p.sectionLabel, marginTop: 14 }}>Coach cues</div>
              <div style={p.cuesWrap}>
                {ex.cues.map((c, i) => (
                  <div key={i} style={p.cuePill}>
                    {c}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <div style={p.footerRow}>
            {ex.youtube ? (
              <a href={ex.youtube} target="_blank" rel="noreferrer" style={p.cta}>
                Click here to see how →
              </a>
            ) : (
              <div style={p.ctaDisabled} title="Admin will add the video soon">
                Video coming soon
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExerciseLibrary() {
  const [q, setQ] = useState("");
  const [openKey, setOpenKey] = useState(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return library;

    return library
      .map((cat) => ({
        ...cat,
        exercises: cat.exercises.filter((ex) => {
          const hay = `${ex.title} ${ex.summary} ${ex.level} ${ex.equipment}`.toLowerCase();
          return hay.includes(query);
        }),
      }))
      .filter((cat) => cat.exercises.length > 0);
  }, [q]);

  return (
    <div style={p.pageWrap}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={p.container}>
        {/* Header */}
        <div style={p.header}>
          <div>
            <div style={p.kicker}>Workout Library</div>
            <h2 style={p.h2}>Learn each exercise with clear steps</h2>
            <p style={p.sub}>Everything is curated for members</p>
          </div>

          <div style={p.searchWrap}>
            <div style={p.searchLabel}>Search</div>
            <input
              style={p.search}
              placeholder="Try: push-up, dumbbell, beginner..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={p.categories}>
          {filtered.map((cat) => (
            <div key={cat.name} style={p.categoryCard}>
              <div style={p.categoryHeader}>
                <div style={p.categoryName}>{cat.name}</div>
                <div style={p.categoryTagline}>{cat.tagline}</div>
              </div>

              <div style={p.exerciseList}>
                {cat.exercises.map((ex) => {
                  const key = `${cat.name}:${ex.title}`;
                  const isOpen = openKey === key;

                  return (
                    <ExerciseAccordion
                      key={key}
                      ex={ex}
                      open={isOpen}
                      onToggle={() => setOpenKey(isOpen ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const p = {
  pageWrap: {
    ...ui.page,
    padding: theme.layout.pagePadding,
  },

  container: {
    width: "100%",
    maxWidth: theme.layout.contentMax,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  kicker: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: 999,
    border: "1px solid rgba(122,92,207,.18)",
    background: "rgba(122,92,207,.10)",
    fontWeight: 800,
    letterSpacing: 0.2,
    color: theme.colors.accent,
  },

  h2: {
    margin: "12px 0 0",
    fontSize: 30,
    fontWeight: 800,
    color: theme.colors.textStrong,
    letterSpacing: "-0.02em",
  },

  sub: {
    margin: "8px 0 0",
    color: theme.colors.textDim,
    lineHeight: 1.5,
  },

  searchWrap: {
    width: 340,
    maxWidth: "100%",
    display: "grid",
    gap: 8,
  },

  searchLabel: {
    fontSize: 12,
    color: theme.colors.textFaint,
    fontWeight: 700,
  },

  search: {
    ...ui.input,
    borderRadius: theme.radius.lg,
    background: "rgba(255,255,255,.9)",
  },

  categories: {
    display: "grid",
    gap: 16,
  },

  categoryCard: {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: 16,
    boxShadow: theme.shadow.card,
    backdropFilter: "blur(18px)",
  },

  categoryHeader: {
    display: "grid",
    gap: 6,
    marginBottom: 14,
  },

  categoryName: {
    fontSize: 20,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },

  categoryTagline: {
    color: theme.colors.textDim,
    fontSize: 14,
  },

  exerciseList: {
    display: "grid",
    gap: 12,
  },

  exerciseCard: {
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.62)",
    overflow: "hidden",
    boxShadow: theme.shadow.soft,
  },

  exerciseHeaderBtn: {
    width: "100%",
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: 16,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    color: theme.colors.text,
  },

  exerciseTitleRow: {
    display: "grid",
    gap: 8,
  },

  exerciseTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },

  exerciseSummary: {
    color: theme.colors.textDim,
    lineHeight: 1.5,
    fontSize: 13,
  },

  badgesRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textDim,
    fontWeight: 700,
  },

  chev: {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.7)",
    transition: theme.motion.base,
    flexShrink: 0,
    color: theme.colors.textStrong,
    boxShadow: theme.shadow.soft,
  },

  exerciseBody: {
    padding: 16,
    borderTop: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.45)",
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textDim,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  stepsGrid: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },

  stepCard: {
    display: "flex",
    gap: 12,
    padding: 12,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.78)",
    boxShadow: theme.shadow.soft,
  },

  stepIndex: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    border: "1px solid rgba(242,178,79,.24)",
    background: "rgba(242,178,79,.16)",
    color: "#9a6107",
    flexShrink: 0,
    boxShadow: theme.shadow.soft,
  },

  stepTitle: {
    fontWeight: 800,
    marginBottom: 4,
    color: theme.colors.textStrong,
  },

  stepText: {
    color: theme.colors.textDim,
    lineHeight: 1.45,
    fontSize: 13,
  },

  cuesWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  cuePill: {
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(122,92,207,.08)",
    color: theme.colors.accent,
    fontSize: 13,
    lineHeight: 1.3,
    fontWeight: 600,
  },

  footerRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 14,
  },

  cta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: theme.radius.pill,
    background: theme.gradients.primary,
    border: "none",
    color: "#4a2d00",
    fontWeight: 800,
    transition: theme.motion.base,
    boxShadow: theme.shadow.button,
  },

  ctaDisabled: {
    padding: "10px 12px",
    borderRadius: theme.radius.pill,
    background: "rgba(255,255,255,.68)",
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textFaint,
    fontWeight: 700,
  },
};