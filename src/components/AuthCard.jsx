import { theme, ui } from "../theme/uiTheme";

function GymIllustration() {
  return (
    <div style={g.wrap} aria-hidden="true">
      <div style={g.glowA} />
      <div style={g.glowB} />

      <svg viewBox="0 0 520 520" style={g.svg}>
        <defs>
          <linearGradient id="gymGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.68)" />
          </linearGradient>

          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f2b24f" />
            <stop offset="100%" stopColor="#9b87e8" />
          </linearGradient>
        </defs>

        {/* floor */}
        <ellipse cx="260" cy="438" rx="132" ry="22" fill="rgba(255,255,255,0.12)" />

        {/* dumbbell */}
        <g transform="translate(110 122) rotate(-12 150 40)">
          <rect x="78" y="34" width="144" height="12" rx="6" fill="url(#accentGrad)" />
          <rect x="58" y="18" width="16" height="44" rx="6" fill="url(#gymGrad)" />
          <rect x="38" y="10" width="16" height="60" rx="6" fill="url(#gymGrad)" />
          <rect x="226" y="18" width="16" height="44" rx="6" fill="url(#gymGrad)" />
          <rect x="246" y="10" width="16" height="60" rx="6" fill="url(#gymGrad)" />
        </g>

        {/* athlete silhouette */}
        <g fill="url(#gymGrad)">
          {/* head */}
          <circle cx="262" cy="150" r="34" />

          {/* torso */}
          <path d="M228 194
                   C238 178, 286 178, 296 194
                   L314 270
                   C318 286, 308 300, 292 300
                   L232 300
                   C216 300, 206 286, 210 270
                   Z" />

          {/* left arm */}
          <path d="M220 206
                   C190 220, 168 248, 158 288
                   C154 304, 162 316, 176 318
                   C189 320, 200 312, 204 298
                   C212 266, 226 242, 248 228
                   Z" />

          {/* right arm */}
          <path d="M304 206
                   C334 220, 356 248, 366 288
                   C370 304, 362 316, 348 318
                   C335 320, 324 312, 320 298
                   C312 266, 298 242, 276 228
                   Z" />

          {/* waist */}
          <path d="M236 298 L288 298 L300 334 L224 334 Z" />

          {/* left leg */}
          <path d="M234 334
                   C222 370, 214 408, 206 458
                   C204 472, 214 482, 228 482
                   C242 482, 250 474, 252 460
                   C258 412, 266 374, 276 334
                   Z" />

          {/* right leg */}
          <path d="M290 334
                   C302 370, 310 408, 318 458
                   C320 472, 310 482, 296 482
                   C282 482, 274 474, 272 460
                   C266 412, 258 374, 248 334
                   Z" />
        </g>

        {/* chest highlight */}
        <path
          d="M232 206 C245 196, 279 196, 292 206"
          stroke="rgba(242,178,79,0.72)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* spark accents */}
        <circle cx="118" cy="246" r="6" fill="rgba(242,178,79,0.92)" />
        <circle cx="396" cy="210" r="5" fill="rgba(255,255,255,0.72)" />
        <circle cx="368" cy="116" r="7" fill="rgba(155,135,232,0.85)" />

        {/* rings */}
        <circle
          cx="390"
          cy="132"
          r="52"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
        />
        <circle
          cx="128"
          cy="310"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default function AuthCard({
  title,
  subtitle,
  children,
  visualTitle = "Own The Grind",
  visualText = "Track your workouts, stay disciplined, and build a stronger body with focus and consistency.",
}) {
  return (
    <div style={s.page}>
      <div style={ui.bgGrid} aria-hidden="true" />
      <div style={ui.glowTop} aria-hidden="true" />
      <div style={ui.glowBottom} aria-hidden="true" />

      <div style={s.shell}>
        <div style={s.formSide}>
          <div style={s.card}>
            <div style={ui.header}>
              <h2 style={ui.title}>{title}</h2>
              {subtitle && <p style={ui.subtitle}>{subtitle}</p>}
            </div>

            {children}

            <div style={s.footerHint}>
              <span style={s.dot}></span>
              Powered by Discipline
            </div>
          </div>
        </div>

        <div style={s.visualSide}>
          <div style={s.visualNoise} />
          <GymIllustration />

          <div style={s.visualOverlay}>
            <div style={s.visualBadge}>GYM • STRENGTH • DISCIPLINE</div>

            <h3 style={s.visualTitle}>{visualTitle}</h3>

            <p style={s.visualText}>{visualText}</p>

            <div style={s.statsRow}>
              <div style={s.statCard}>
                <span style={s.statValue}>24/7</span>
                <span style={s.statLabel}>Focus</span>
              </div>

              <div style={s.statCard}>
                <span style={s.statValue}>+100%</span>
                <span style={s.statLabel}>Commitment</span>
              </div>

              <div style={s.statCard}>
                <span style={s.statValue}>1%</span>
                <span style={s.statLabel}>Better Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AuthUI = {
  input: {
    ...ui.input,
    marginBottom: 14,
  },

  button: (disabled) => ({
    ...ui.button(disabled),
    marginTop: 6,
  }),

  linkRow: ui.linkRow,
  link: ui.link,
  error: ui.error,

  success: {
    background: "rgba(111,207,151,0.14)",
    color: "#2f7d4f",
    padding: "10px 14px",
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 14,
    border: "1px solid rgba(111,207,151,0.28)",
    boxSizing: "border-box",
  },
};

const s = {
  page: {
    ...ui.page,
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },

  shell: {
    width: "100%",
    maxWidth: 1120,
    minHeight: 680,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderRadius: 32,
    overflow: "hidden",
    background: "rgba(255,255,255,0.45)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    position: "relative",
    zIndex: 2,
  },

  formSide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    background: "rgba(255,255,255,0.18)",
  },

  card: {
    ...ui.card,
    maxWidth: 440,
    width: "100%",
    boxShadow: "none",
    background: "rgba(255,255,255,0.78)",
  },

  visualSide: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(122,92,207,0.96) 0%, rgba(101,73,174,0.96) 46%, rgba(242,178,79,0.88) 100%)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: 36,
  },

  visualNoise: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0px, rgba(255,255,255,.05) 2px, transparent 2px, transparent 18px)",
    opacity: 0.34,
    pointerEvents: "none",
  },

  visualOverlay: {
    position: "relative",
    zIndex: 2,
    color: "#fff",
    maxWidth: 430,
  },

  visualBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 18,
    backdropFilter: "blur(12px)",
  },

  visualTitle: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },

  visualText: {
    marginTop: 14,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.88)",
  },

  statsRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  statCard: {
    minWidth: 110,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(12px)",
    display: "grid",
    gap: 4,
  },

  statValue: {
    fontSize: 22,
    fontWeight: 900,
    color: "#fff",
  },

  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.76)",
  },

  footerHint: {
    marginTop: 20,
    fontSize: 12,
    textAlign: "center",
    color: theme.colors.textFaint,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: theme.gradients.mixed,
  },
};

const g = {
  wrap: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  svg: {
    position: "absolute",
    right: -10,
    top: 20,
    width: "92%",
    height: "82%",
    opacity: 0.92,
  },

  glowA: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    top: 30,
    right: 40,
    background: "radial-gradient(circle, rgba(255,255,255,.18), transparent 70%)",
    filter: "blur(10px)",
  },

  glowB: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    bottom: 80,
    left: 40,
    background: "radial-gradient(circle, rgba(242,178,79,.20), transparent 70%)",
    filter: "blur(18px)",
  },
};