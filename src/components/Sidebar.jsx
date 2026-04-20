import { NavLink } from "react-router-dom";
import { theme } from "../theme/uiTheme";

const links = [
  { to: "/member", label: "Home" },
  { to: "/member/workouts", label: "Workouts" },
  { to: "/member/meals", label: "Meals" },
  { to: "/member/health", label: "Health Condition" },
  { to: "/member/progress-photos", label: "Progress Photos" },
  { to: "/member/trainers", label: "Trainers" },
  { to: "/member/booking", label: "Booking" },
  { to: "/member/chat", label: "Chat" },
  { to: "/member/payments", label: "Payments" },
  { to: "/member/exercise-types", label: "Exercise Type" },
  { to: "/member/equipment", label: "Equipment" },
];

export default function Sidebar() {
  return (
    <aside style={s.side}>
      <div style={s.brandWrap}>
        <div style={s.brandDot}></div>
        <div style={s.brand}>GymPro</div>
      </div>

      <div style={s.menu}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/member"}
            style={({ isActive }) => ({
              ...s.link,
              ...(isActive ? s.linkActive : null),
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

const s = {
  side: {
    width: 280,
    padding: 20,
    borderRight: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    color: theme.colors.text,
    position: "relative",
    zIndex: 2,
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
    padding: "10px 12px",
    borderRadius: theme.radius.md,
    background: "rgba(255,255,255,0.55)",
    border: `1px solid ${theme.colors.borderSoft}`,
    boxShadow: theme.shadow.soft,
  },

  brandDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: theme.gradients.mixed,
    boxShadow: theme.shadow.glow,
  },

  brand: {
    fontWeight: 900,
    fontSize: 20,
    letterSpacing: 0.6,
    background: theme.gradients.accent,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  menu: {
    display: "grid",
    gap: 10,
  },

  link: {
    display: "block",
    padding: "12px 14px",
    borderRadius: theme.radius.md,
    textDecoration: "none",
    color: theme.colors.textDim,
    border: `1px solid ${theme.colors.borderSoft}`,
    background: "rgba(255,255,255,0.72)",
    fontWeight: 700,
    transition: theme.motion.base,
    boxShadow: theme.shadow.soft,
  },

  linkActive: {
    background: "linear-gradient(90deg, rgba(242,178,79,0.16), rgba(155,135,232,0.14))",
    borderColor: "rgba(122,92,207,0.18)",
    color: theme.colors.textStrong,
    boxShadow: theme.shadow.glow,
  },
};