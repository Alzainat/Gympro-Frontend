import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { unwrap } from "../../api/unwrap";
import { theme, ui } from "../../theme/uiTheme";

export default function Trainers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [myTrainerId, setMyTrainerId] = useState(null);
  const [subscribingId, setSubscribingId] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [trainersRes, userRes] = await Promise.all([
          api.get("/trainers"),
          api.get("/user"),
        ]);

        if (!alive) return;

        const trainers = unwrap(trainersRes.data) ?? [];
        const user = userRes.data;

        setItems(trainers);
        setMyTrainerId(
          user?.profile?.trainer_id ??
            user?.profile?.trainerId ??
            user?.trainer_id ??
            user?.trainerId ??
            null
        );
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Failed to load trainers.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((t) => {
      const name = (t.full_name ?? "").toLowerCase();
      const bio = (t.bio ?? "").toLowerCase();
      return name.includes(s) || bio.includes(s);
    });
  }, [items, q]);

  const subscribeToTrainer = async (trainerId) => {
    try {
      setSubscribingId(trainerId);
      setErr("");

      const res = await api.post(`/member/trainers/${trainerId}/subscribe`);
      const data = unwrap(res.data) ?? res.data;

      setMyTrainerId(data?.trainer_id ?? data?.trainerId ?? trainerId);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to subscribe to trainer.");
    } finally {
      setSubscribingId(null);
    }
  };

  const unsubscribe = async () => {
    try {
      setSubscribingId(myTrainerId);
      setErr("");

      await api.delete("/member/trainer-subscription");
      setMyTrainerId(null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to unsubscribe.");
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div style={page.pageWrap}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={page.container}>
        <div style={page.headerRow}>
          <div>
            <h2 style={page.title}>Trainers</h2>
            <div style={page.subtitle}>
              Browse trainers, ratings, hourly rate, and bios.
            </div>
          </div>

          <div style={page.searchWrap}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or bio..."
              style={page.searchInput}
            />
          </div>
        </div>

        {err ? <div style={ui.error}>{err}</div> : null}

        {loading ? (
          <div style={page.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={page.skeletonCard} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={page.empty}>
            <div style={page.emptyTitle}>No trainers found</div>
            <div style={page.emptySub}>Try a different search.</div>
          </div>
        ) : (
          <div style={page.grid}>
            {filtered.map((t) => {
              const trainerId = t.id ?? t.trainer_id;
              const isMyTrainer = Number(myTrainerId) === Number(trainerId);
              const isBusy = Number(subscribingId) === Number(trainerId);
              const isAnyActionRunning = subscribingId !== null;

              return (
                <div key={trainerId} style={page.card}>
                  <div style={page.cardTop}>
                    <div style={page.trainerInfo}>
                      <div style={page.avatar}>
                        {t.avatar_url ? (
                          <img
                            src={t.avatar_url}
                            alt={t.full_name || "Trainer"}
                            style={page.avatarImg}
                          />
                        ) : (
                          <span style={page.avatarFallback}>
                            {t.full_name?.charAt(0)?.toUpperCase() || "T"}
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={page.name}>{t.full_name}</div>
                        <div style={page.smallText}>Trainer</div>
                      </div>
                    </div>

                    <div style={page.badge}>
                      <span style={page.badgeDot} />
                      {t.rating ?? "5.0"} ⭐
                    </div>
                  </div>

                  <div style={page.metaRow}>
                    <div style={page.metaItem}>
                      <div style={page.metaLabel}>Hourly</div>
                      <div style={page.metaValue}>
                        {t.hourly_rate ?? "-"}
                        {t.hourly_rate ? " / hr" : ""}
                      </div>
                    </div>

                    <div style={page.metaItem}>
                      <div style={page.metaLabel}>Status</div>
                      <div style={page.metaValue}>
                        {t.is_available ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>

                  <div style={page.bioLabel}>Bio</div>
                  <div style={page.bio}>{t.bio ?? "-"}</div>

                  {isMyTrainer ? (
                    <div style={page.actionRow}>
                      <button style={page.currentBtn} disabled>
                        Subscribed
                      </button>

                      <button
                        style={page.unsubscribeBtn}
                        onClick={unsubscribe}
                        disabled={isAnyActionRunning}
                      >
                        {isBusy ? "Processing..." : "Unsubscribe"}
                      </button>
                    </div>
                  ) : (
                    <button
                      style={{
                        ...page.btn,
                        opacity: isAnyActionRunning ? 0.8 : 1,
                        cursor: isAnyActionRunning ? "not-allowed" : "pointer",
                      }}
                      onClick={() => subscribeToTrainer(trainerId)}
                      disabled={isAnyActionRunning}
                    >
                      {isBusy ? "Subscribing..." : "Subscribe"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const page = {
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

  headerRow: {
    display: "flex",
    gap: 14,
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: theme.colors.textStrong,
  },

  subtitle: {
    marginTop: 8,
    color: theme.colors.textDim,
    fontSize: 14,
  },

  searchWrap: {
    minWidth: 260,
    flex: "0 1 360px",
  },

  searchInput: {
    ...ui.input,
    height: 46,
    background: "rgba(255,255,255,.9)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },

  card: {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: 16,
    boxShadow: theme.shadow.card,
    backdropFilter: "blur(16px)",
    color: theme.colors.text,
    transition: theme.motion.base,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  trainerInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    overflow: "hidden",
    flex: "0 0 auto",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    display: "grid",
    placeItems: "center",
    boxShadow: theme.shadow.soft,
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  avatarFallback: {
    fontWeight: 900,
    fontSize: 20,
    color: theme.colors.textStrong,
  },

  name: {
    fontWeight: 800,
    fontSize: 17,
    color: theme.colors.textStrong,
    letterSpacing: 0.2,
  },

  smallText: {
    marginTop: 3,
    color: theme.colors.textFaint,
    fontSize: 12,
    fontWeight: 700,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textDim,
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: theme.gradients.mixed,
    boxShadow: theme.shadow.soft,
  },

  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 12,
  },

  metaItem: {
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    borderRadius: theme.radius.md,
    padding: 10,
    boxShadow: theme.shadow.soft,
  },

  metaLabel: {
    color: theme.colors.textFaint,
    fontSize: 12,
    marginBottom: 4,
  },

  metaValue: {
    fontWeight: 800,
    color: theme.colors.textStrong,
    fontSize: 14,
  },

  bioLabel: {
    color: theme.colors.textFaint,
    fontSize: 12,
    marginBottom: 6,
  },

  bio: {
    color: theme.colors.textDim,
    fontSize: 14,
    lineHeight: 1.5,
    minHeight: 42,
  },

  btn: {
    marginTop: 12,
    width: "100%",
    padding: "12px 14px",
    borderRadius: theme.radius.pill,
    border: "none",
    background: theme.gradients.primary,
    color: "#4a2d00",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: theme.shadow.button,
    transition: theme.motion.base,
  },

  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 12,
  },

  currentBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: theme.radius.pill,
    border: "1px solid rgba(111,207,151,.20)",
    background: "rgba(111,207,151,.12)",
    color: "#3d8b5d",
    fontWeight: 700,
    cursor: "default",
  },

  unsubscribeBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.text,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: theme.shadow.soft,
  },

  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },

  skeletonCard: {
    height: 170,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    background:
      "linear-gradient(90deg, rgba(255,255,255,.55), rgba(245,240,248,.95), rgba(255,255,255,.55))",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.2s ease-in-out infinite",
    boxShadow: theme.shadow.soft,
  },

  empty: {
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 18,
    color: theme.colors.text,
    boxShadow: theme.shadow.soft,
  },

  emptyTitle: {
    fontWeight: 800,
    marginBottom: 6,
    color: theme.colors.textStrong,
  },

  emptySub: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
};