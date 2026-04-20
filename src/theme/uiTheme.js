export const theme = {
  colors: {
    bg0: "#f6f2f8",
    bg1: "#efe8f4",
    bg2: "#e8deee",

    card: "rgba(255,255,255,0.72)",
    surface: "rgba(255,255,255,0.88)",
    surfaceSoft: "rgba(248,244,250,0.92)",

    border: "rgba(99,78,133,0.10)",
    borderSoft: "rgba(99,78,133,0.06)",

    text: "#2f2347",
    textStrong: "#24173a",
    textDim: "rgba(47,35,71,0.68)",
    textFaint: "rgba(47,35,71,0.42)",

    primary: "#f2b24f",
    primary2: "#e89a3d",
    accent: "#7a5ccf",
    accent2: "#9b87e8",

    success: "#6fcf97",
    info: "#7b8cff",

    dangerBg: "rgba(235,87,87,0.10)",
    dangerBorder: "rgba(235,87,87,0.18)",
    dangerText: "#c94b4b",
  },

  radius: {
    xs: 10,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 30,
    pill: 999,
  },

  shadow: {
    card: "0 20px 50px rgba(98, 78, 133, 0.10)",
    soft: "0 10px 30px rgba(98, 78, 133, 0.08)",
    button: "0 10px 22px rgba(242,178,79,0.28)",
    glow: "0 8px 20px rgba(122,92,207,0.16)",
  },

  gradients: {
    page:
      "linear-gradient(135deg, #f7f3f8 0%, #f1ebf4 45%, #ece4f1 100%)",

    pageSoft:
      "radial-gradient(900px 500px at 15% 10%, rgba(255,255,255,0.75), transparent 60%), " +
      "radial-gradient(700px 420px at 85% 20%, rgba(155,135,232,0.10), transparent 60%), " +
      "radial-gradient(700px 420px at 20% 80%, rgba(242,178,79,0.08), transparent 60%), " +
      "linear-gradient(135deg, #f7f3f8 0%, #f1ebf4 45%, #ece4f1 100%)",

    primary: "linear-gradient(90deg, #f2b24f 0%, #e89a3d 100%)",
    accent: "linear-gradient(90deg, #7a5ccf 0%, #9b87e8 100%)",
    mixed: "linear-gradient(90deg, #f2b24f 0%, #9b87e8 100%)",

    progress: "linear-gradient(90deg, #f2a65a 0%, #e98b73 45%, #8d6be8 100%)",

    glowWarm: "radial-gradient(circle, rgba(242,178,79,0.20), transparent 65%)",
    glowPurple: "radial-gradient(circle, rgba(122,92,207,0.16), transparent 65%)",
  },

  motion: {
    fast: "all .15s ease",
    base: "all .22s ease",
    smooth: "all .32s ease",
  },

  layout: {
    pagePadding: 24,
    cardMaxWidth: 440,
    contentMax: 1240,
    navHeight: 72,
  },
};

export const ui = {
  page: {
    minHeight: "100vh",
    background: theme.gradients.pageSoft,
    position: "relative",
    overflow: "hidden",
    color: theme.colors.text,
  },

  center: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: theme.layout.pagePadding,
  },

  card: {
    width: "100%",
    maxWidth: theme.layout.cardMaxWidth,
    padding: 28,
    borderRadius: theme.radius.lg,
    background: theme.colors.card,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    color: theme.colors.text,
    position: "relative",
    boxSizing: "border-box",
  },

  panel: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.borderSoft}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadow.soft,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },

  header: {
    marginBottom: 18,
    textAlign: "left",
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
    fontSize: 15,
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    outline: "none",
    fontSize: 14,
    background: "rgba(255,255,255,0.82)",
    color: theme.colors.text,
    transition: theme.motion.base,
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
  },

  button: (disabled) => ({
    width: "100%",
    padding: "14px 18px",
    borderRadius: theme.radius.pill,
    border: "none",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    background: theme.gradients.primary,
    color: "#4a2d00",
    boxShadow: disabled ? "none" : theme.shadow.button,
    transition: theme.motion.base,
    boxSizing: "border-box",
  }),

  ghostButton: {
    padding: "12px 16px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.65)",
    color: theme.colors.text,
    fontWeight: 600,
    boxShadow: theme.shadow.soft,
  },

  link: {
    color: theme.colors.accent,
    textDecoration: "none",
    fontWeight: 700,
  },

  linkRow: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 14,
    color: theme.colors.textDim,
  },

  error: {
    background: theme.colors.dangerBg,
    color: theme.colors.dangerText,
    padding: "10px 14px",
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 14,
    border: `1px solid ${theme.colors.dangerBorder}`,
    boxSizing: "border-box",
  },

  bgGrid: {
  position: "absolute",
  inset: 0,
  background: `
    radial-gradient(800px 400px at 10% 10%, rgba(255,255,255,0.6), transparent 60%),
    radial-gradient(700px 400px at 90% 20%, rgba(155,135,232,0.18), transparent 60%),
    linear-gradient(135deg, #f3eee9 0%, #ebe5f1 50%, #e6def0 100%)
  `,
  pointerEvents: "none",
},

  glowTop: {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: "50%",
    background: theme.gradients.glowPurple,
    filter: "blur(80px)",
    top: -140,
    right: -120,
    pointerEvents: "none",
  },

  glowBottom: {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: "50%",
    background: theme.gradients.glowWarm,
    filter: "blur(90px)",
    bottom: -180,
    left: -120,
    pointerEvents: "none",
  },
};