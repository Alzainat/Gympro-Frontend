import { Link } from "react-router-dom";
import { theme, ui } from "../theme/uiTheme";

export default function Unauthorized() {
  return (
    <div style={s.page}>
      <div style={ui.bgGrid} aria-hidden="true" />
      <div style={ui.glowTop} aria-hidden="true" />
      <div style={ui.glowBottom} aria-hidden="true" />

      <div style={s.card}>
        <div style={s.badge}>403</div>
        <h2 style={s.title}>Unauthorized</h2>
        <p style={s.text}>You do not have permission to access this page.</p>

        <Link to="/" style={s.link}>
          Go back home
        </Link>
      </div>
    </div>
  );
}

const s = {
  page: {
    ...ui.page,
    ...ui.center,
    textAlign: "center",
  },

  card: {
    ...ui.card,
    maxWidth: 460,
    textAlign: "center",
  },

  badge: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    margin: "0 auto 18px",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 22,
    color: "#7a4c00",
    background: theme.gradients.primary,
    boxShadow: theme.shadow.button,
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },

  text: {
    marginTop: 10,
    marginBottom: 20,
    color: theme.colors.textDim,
    fontSize: 15,
    lineHeight: 1.6,
  },

  link: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    borderRadius: theme.radius.pill,
    textDecoration: "none",
    background: theme.gradients.accent,
    color: "white",
    fontWeight: 700,
    boxShadow: theme.shadow.glow,
  },
};