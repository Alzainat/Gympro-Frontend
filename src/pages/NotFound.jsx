import { Link } from "react-router-dom";
import { theme, ui } from "../theme/uiTheme";

export default function NotFound() {
  return (
    <div style={s.page}>
      <div style={ui.bgGrid} aria-hidden="true" />
      <div style={ui.glowTop} aria-hidden="true" />
      <div style={ui.glowBottom} aria-hidden="true" />

      <div style={s.card}>
        <div style={s.badge}>404</div>

        <h1 style={s.title}>Page Not Found</h1>

        <p style={s.text}>
          The page you are trying to access does not exist,
          may have been moved, or the URL is incorrect.
        </p>

        <div style={s.actions}>
          <Link to="/" style={s.primaryBtn}>
            Back Home
          </Link>

          <button
            onClick={() => window.history.back()}
            style={s.secondaryBtn}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    ...ui.page,
    ...ui.center,
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    padding: 24,
  },

  card: {
    ...ui.card,
    width: "100%",
    maxWidth: 520,
    padding: "42px 34px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(18px)",
  },

  badge: {
    width: 84,
    height: 84,
    borderRadius: "50%",
    margin: "0 auto 24px",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 26,
    letterSpacing: "-0.03em",
    color: "#5b3a00",
    background: theme.gradients.primary,
    boxShadow: theme.shadow.button,
  },

  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: theme.colors.textStrong,
  },

  text: {
    marginTop: 16,
    marginBottom: 28,
    color: theme.colors.textDim,
    fontSize: 15,
    lineHeight: 1.8,
    maxWidth: 420,
    marginInline: "auto",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 22px",
    borderRadius: theme.radius.pill,
    textDecoration: "none",
    background: theme.gradients.primary,
    color: "#4a2d00",
    fontWeight: 800,
    boxShadow: theme.shadow.button,
    transition: theme.motion.base,
  },

  secondaryBtn: {
    padding: "13px 22px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textStrong,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: theme.shadow.soft,
    transition: theme.motion.base,
  },
};