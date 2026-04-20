import { useMemo, useState } from "react";

// ✅ Theme
import { theme, ui } from "../../theme/uiTheme";

// ✅ Images (static imports)
import treadmill from "../../assets/equipment/treadmill.jpg";
import legPress from "../../assets/equipment/leg-press.jpg";
import cableMachine from "../../assets/equipment/cable-machine.jpg";
import rowingMachine from "../../assets/equipment/rowing-machine.jpg";
import smithMachine from "../../assets/equipment/smith-machine.jpg";
import kettlebells from "../../assets/equipment/kettlebells.jpg";

// ✅ Static data
const machines = [
  { name: "Treadmill", category: "Cardio", img: treadmill },
  { name: "Rowing Machine", category: "Cardio", img: rowingMachine },
  { name: "Leg Press", category: "Strength", img: legPress },
  { name: "Cable Machine", category: "Strength", img: cableMachine },
  { name: "Smith Machine", category: "Strength", img: smithMachine },
  { name: "Kettlebells", category: "Functional", img: kettlebells },
];

export default function Equipment() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(machines.map((m) => m.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return machines.filter((m) => {
      const matchesCat = activeCat === "All" || m.category === activeCat;
      const matchesQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, activeCat]);

  return (
    <div style={s.pageWrap}>
      {/* Decorative background (مثل صفحات auth) */}
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.kicker}>Gym Equipment</div>
            <h2 style={s.title}>Find the right machine, fast</h2>
            <p style={s.sub}>
              Browse equipment by category or search by name. Click any card to
              view it larger.
            </p>
          </div>

          {/* Search */}
          <div style={s.searchWrap}>
            <div style={s.searchLabel}>Search</div>
            <input
              style={s.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: treadmill, cable, cardio..."
            />
          </div>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          {categories.map((c) => {
            const active = c === activeCat;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c)}
                style={{ ...s.filterBtn, ...(active ? s.filterBtnActive : null) }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Meta */}
        <div style={s.metaRow}>
          <div style={s.metaText}>
            Showing <b>{filtered.length}</b> item{filtered.length === 1 ? "" : "s"}
            {activeCat !== "All" ? (
              <>
                {" "}
                in <b>{activeCat}</b>
              </>
            ) : null}
            {query.trim() ? (
              <>
                {" "}
                for "<b>{query.trim()}</b>"
              </>
            ) : null}
          </div>

          {(activeCat !== "All" || query.trim()) && (
            <button
              type="button"
              onClick={() => {
                setActiveCat("All");
                setQuery("");
              }}
              style={s.clearBtn}
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        <div style={s.grid}>
          {filtered.map((m, idx) => (
            <button
              key={m.name}
              type="button"
              onClick={() => setSelected(m)}
              style={{ ...s.cardBtn, animationDelay: `${Math.min(idx * 35, 260)}ms` }}
              aria-label={`Open ${m.name}`}
            >
              <div style={s.card}>
                <div style={s.imageWrap}>
                  <img alt={m.name} src={m.img} style={s.img} />
                  <div style={s.overlay}>
                    <div style={s.overlayText}>View</div>
                  </div>
                </div>

                <div style={s.cardBody}>
                  <div style={s.machineName}>{m.name}</div>
                  <div style={s.badge}>{m.category}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyTitle}>No results</div>
            <div style={s.emptyText}>
              Try a different keyword or choose another category.
            </div>
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div style={s.backdrop} onClick={() => setSelected(null)}>
            <div style={s.modal} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalTop}>
                <div>
                  <div style={s.modalTitle}>{selected.name}</div>
                  <div style={s.modalSub}>{selected.category}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={s.closeBtn}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <img src={selected.img} alt={selected.name} style={s.modalImg} />
            </div>
          </div>
        )}

        <style>{css}</style>
      </div>
    </div>
  );
}

const s = {
  pageWrap: {
    ...ui.page,
  },

  page: {
    maxWidth: theme.layout.contentMax,
    margin: "0 auto",
    padding: theme.layout.pagePadding,
    position: "relative",
    zIndex: 1,
    color: theme.colors.text,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  kicker: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: 999,
    background: "rgba(122,92,207,.10)",
    border: "1px solid rgba(122,92,207,.18)",
    color: theme.colors.accent,
    fontWeight: 800,
    letterSpacing: 0.2,
  },

  title: {
    margin: "12px 0 6px",
    fontSize: 30,
    fontWeight: 800,
    color: theme.colors.textStrong,
  },

  sub: {
    margin: 0,
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
    color: theme.colors.textDim,
    fontWeight: 700,
  },

  search: {
    ...ui.input,
    background: "rgba(255,255,255,0.9)",
  },

  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },

  filterBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.72)",
    color: theme.colors.text,
    fontWeight: 700,
    cursor: "pointer",
    transition: theme.motion.fast,
    boxShadow: theme.shadow.soft,
  },

  filterBtnActive: {
    borderColor: "rgba(122,92,207,.20)",
    background: "rgba(122,92,207,.10)",
    color: theme.colors.accent,
    boxShadow: theme.shadow.glow,
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  metaText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },

  clearBtn: {
    padding: "10px 12px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.72)",
    color: theme.colors.text,
    fontWeight: 700,
    cursor: "pointer",
    transition: theme.motion.fast,
    boxShadow: theme.shadow.soft,
  },

  grid: {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 340px))",
    justifyContent: "center",
  },

  cardBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    textAlign: "left",
    cursor: "pointer",
  },

  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.card,
    backdropFilter: "blur(16px)",
    animation: "fadeUp .35s ease both",
    transition: theme.motion.base,
    boxShadow: theme.shadow.card,
  },

  imageWrap: {
    position: "relative",
    overflow: "hidden",
  },

  img: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block",
    transform: "scale(1)",
    transition: "transform .25s ease",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(47,35,71,.08), rgba(47,35,71,.36))",
    opacity: 0,
    display: "grid",
    placeItems: "center",
    transition: "opacity .25s ease",
  },

  overlayText: {
    color: "#fff",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: 0.4,
  },

  cardBody: {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  machineName: {
    fontWeight: 800,
    fontSize: 16,
    color: theme.colors.textStrong,
  },

  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "rgba(242,178,79,.14)",
    border: "1px solid rgba(242,178,79,.20)",
    color: "#9a6107",
  },

  empty: {
    marginTop: 18,
    padding: 18,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.borderSoft}`,
    background: theme.colors.surface,
    boxShadow: theme.shadow.soft,
  },

  emptyTitle: {
    fontWeight: 800,
    fontSize: 16,
    marginBottom: 6,
    color: theme.colors.textStrong,
  },

  emptyText: {
    color: theme.colors.textDim,
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(47,35,71,.28)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    padding: 16,
    backdropFilter: "blur(8px)",
  },

  modal: {
    width: "min(720px, 92vw)",
    background: "rgba(255,255,255,.82)",
    backdropFilter: "blur(18px)",
    borderRadius: theme.radius.lg,
    padding: 16,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.card,
    color: theme.colors.text,
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },

  modalTitle: {
    fontWeight: 800,
    fontSize: 18,
    color: theme.colors.textStrong,
  },

  modalSub: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginTop: 3,
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.text,
    fontWeight: 800,
    cursor: "pointer",
    transition: theme.motion.fast,
    boxShadow: theme.shadow.soft,
  },

  modalImg: {
    width: "100%",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
  },
};

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  button:hover > div {
    transform: translateY(-2px);
    border-color: rgba(122,92,207,.16);
    box-shadow: 0 22px 50px rgba(98,78,133,.12);
  }

  button:hover img { transform: scale(1.04); }
  button:hover div[style*="opacity: 0"] { opacity: 1; }

  button:focus-visible {
    outline: 2px solid rgba(122,92,207,.28);
    outline-offset: 6px;
    border-radius: 18px;
  }
`;