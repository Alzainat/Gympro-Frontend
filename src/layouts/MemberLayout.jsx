import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { theme } from "../theme/uiTheme";
import HealthProfileModal from "../components/HealthProfileModal";

export default function MemberLayout() {
  return (
    <div style={s.wrap}>
      <Sidebar />

      <main style={s.main}>
        <Outlet />
      </main>

      {/* يظهر أول ما العضو يفوت إذا ما عنده بيانات */}
      <HealthProfileModal />
    </div>
  );
}

const s = {
  wrap: {
    display: "flex",
    minHeight: "100vh",
    background: theme.gradients.page,
  },

  main: {
    flex: 1,
    padding: 24,
    color: theme.colors.text,
  },
};