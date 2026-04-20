import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { theme, ui } from "../theme/uiTheme";
import HealthProfileModal from "../components/HealthProfileModal";

export default function MemberLayout() {
  return (
    <div style={s.wrap}>
      <div style={ui.bgGrid} aria-hidden="true" />
      <div style={s.glowTop} aria-hidden="true" />
      <div style={s.glowBottom} aria-hidden="true" />

      <Sidebar />

      <main style={s.main}>
        <div style={s.content}>
          <Outlet />
        </div>
      </main>

      <HealthProfileModal />
    </div>
  );
}

const s = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    background: theme.gradients.pageSoft,
    position: "relative",
    overflow: "hidden",
  },

  main: {
    flex: 1,
    padding: theme.layout.pagePadding,
    color: theme.colors.text,
    position: "relative",
    zIndex: 1,
  },

  content: {
    width: "100%",
    maxWidth: theme.layout.contentMax,
    margin: "0 auto",
  },

  glowTop: {
    ...ui.glowTop,
  },

  glowBottom: {
    ...ui.glowBottom,
  },
};