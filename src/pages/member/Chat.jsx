import { useEffect, useMemo, useRef, useState } from "react";
import { getInbox, getThread, markRead, sendMessage } from "../../services/chatService";
import { unwrap } from "../../api/unwrap";
import { useAuth } from "../../context/AuthContext";
import { theme, ui } from "../../theme/uiTheme";

export default function Chat() {
  const { profile } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [activeTrainer, setActiveTrainer] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const [err, setErr] = useState("");

  const threadRef = useRef(null);

  const loadInbox = async () => {
    const res = await getInbox();
    setInbox(unwrap(res.data) ?? []);
  };

  const openTrainer = async (trainer) => {
    setActiveTrainer(trainer);
    setErr("");
    setLoadingThread(true);
    try {
      const res = await getThread(trainer.trainer_id);
      setThread(unwrap(res.data) ?? []);
      await markRead(trainer.trainer_id);
      await loadInbox(); // تحديث unread
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load chat.");
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    loadInbox().catch(() => {});
  }, []);

  // ✅ scroll داخل thread فقط (بدون قص الصفحة)
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [thread, activeTrainer, loadingThread]);

  const sortedInbox = useMemo(() => {
    return [...inbox].sort((a, b) => {
      const da = new Date(a?.last_message?.sent_at || 0).getTime();
      const db = new Date(b?.last_message?.sent_at || 0).getTime();
      return db - da;
    });
  }, [inbox]);

  const onSend = async () => {
    const content = text.trim();
    if (!content || !activeTrainer) return;

    setText("");
    setErr("");

    // optimistic
    const temp = {
      id: `tmp-${Date.now()}`,
      sender_id: profile?.id,
      receiver_id: activeTrainer.trainer_id,
      content,
      sent_at: new Date().toISOString(),
      is_read: true,
    };
    setThread((p) => [...p, temp]);

    try {
      const res = await sendMessage(activeTrainer.trainer_id, content);
      const newMsg = res.data;
      setThread((p) => {
        const withoutTemp = p.filter((x) => x.id !== temp.id);
        return [...withoutTemp, newMsg];
      });
      await loadInbox();
    } catch (e) {
      setErr(e?.response?.data?.message || "Send failed.");
    }
  };

  return (
    <div style={p.pageWrap}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={p.container}>
        <div style={p.wrap}>
          {/* LEFT: inbox */}
          <div style={p.left}>
            <div style={p.leftHeader}>
              <div>
                <div style={p.leftTitle}>Chat</div>
                <div style={p.leftSub}>Your trainers inbox</div>
              </div>
              <button
                type="button"
                style={p.refreshBtn}
                onClick={() => loadInbox().catch(() => {})}
              >
                Refresh
              </button>
            </div>

            {sortedInbox.length === 0 ? (
              <div style={p.mutedBox}>No chats yet.</div>
            ) : (
              <div style={p.list}>
                {sortedInbox.map((x) => {
                  const t = x.trainer;
                  const active = activeTrainer?.trainer_id === t?.trainer_id;

                  return (
                    <button
                      type="button"
                      key={t?.trainer_id}
                      onClick={() => openTrainer(t)}
                      style={{
                        ...p.item,
                        background: active ? "rgba(122,92,207,.08)" : "transparent",
                        borderColor: active ? "rgba(122,92,207,.18)" : theme.colors.border,
                      }}
                    >
                      <div style={p.itemLeft}>
                        <div style={p.avatar}>
                          {t?.full_name?.slice(0, 1)?.toUpperCase() || "T"}
                        </div>

                        <div style={{ textAlign: "left", minWidth: 0 }}>
                          <div style={p.itemName}>{t?.full_name || "Trainer"}</div>
                          <div style={p.preview}>{x?.last_message?.content || ""}</div>
                        </div>
                      </div>

                      {x.unread_count > 0 ? <div style={p.badge}>{x.unread_count}</div> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: thread */}
          <div style={p.right}>
            {!activeTrainer ? (
              <div style={p.empty}>
                <div style={p.emptyTitle}>Select a trainer from the left</div>
                <div style={p.emptySub}>To open the chat and start sending messages.</div>
              </div>
            ) : (
              <>
                <div style={p.topBar}>
                  <div style={p.topLeft}>
                    <div style={p.avatarLg}>
                      {activeTrainer.full_name?.slice(0, 1)?.toUpperCase() || "T"}
                    </div>
                    <div>
                      <div style={p.topName}>{activeTrainer.full_name}</div>
                      <div style={p.topRole}>Trainer</div>
                    </div>
                  </div>

                  <div style={p.topActions}>
                    <button
                      type="button"
                      style={p.ghostBtn}
                      onClick={() => openTrainer(activeTrainer)}
                      title="Reload thread"
                    >
                      Reload
                    </button>
                  </div>
                </div>

                <div style={p.thread} ref={threadRef}>
                  {loadingThread ? (
                    <div style={p.mutedBox}>Loading...</div>
                  ) : (
                    <>
                      {thread.map((m) => {
                        const mine = String(m.sender_id) === String(profile?.id);

                        const senderName = mine
                          ? profile?.full_name || profile?.name || "Me"
                          : activeTrainer?.full_name || "Trainer";

                        const senderInitial = senderName?.slice(0, 1)?.toUpperCase() || "?";

                        return (
                          <div
                            key={m.id}
                            style={{
                              display: "flex",
                              justifyContent: mine ? "flex-end" : "flex-start",
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 8,
                                flexDirection: mine ? "row-reverse" : "row",
                                maxWidth: "78%",
                              }}
                            >
                              <div style={mine ? p.msgAvatarMine : p.msgAvatarTheirs}>
                                {senderInitial}
                              </div>

                              <div style={{ ...p.bubble, ...(mine ? p.mine : p.theirs) }}>
                                <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                                <div style={p.time}>{new Date(m.sent_at).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {err ? <div style={ui.error}>{err}</div> : null}

                <div style={p.composer}>
                  <input
                    style={p.input}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // ✅ يمنع أي submit/قفزة بالصفحة
                        onSend();
                      }
                    }}
                  />
                  <button type="button" style={p.sendBtn} onClick={onSend}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
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

  wrap: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
    height: "calc(100vh - 48px)",
    minHeight: 0,
  },

  left: {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backdropFilter: "blur(18px)",
    boxShadow: theme.shadow.card,
    minHeight: 0,
  },

  leftHeader: {
    padding: 16,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  leftTitle: {
    fontWeight: 800,
    color: theme.colors.textStrong,
    fontSize: 20,
  },

  leftSub: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textDim,
  },

  refreshBtn: {
    padding: "9px 12px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textDim,
    fontWeight: 700,
    cursor: "pointer",
    transition: theme.motion.base,
    boxShadow: theme.shadow.soft,
  },

  mutedBox: {
    padding: 14,
    color: theme.colors.textDim,
  },

  list: { display: "grid" },

  item: {
    width: "100%",
    padding: 12,
    borderTop: `1px solid ${theme.colors.border}`,
    background: "transparent",
    color: theme.colors.text,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    transition: theme.motion.base,
  },

  itemLeft: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    minWidth: 0,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(122,92,207,.16), rgba(242,178,79,.18))",
    border: `1px solid ${theme.colors.border}`,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: theme.colors.textStrong,
    flexShrink: 0,
  },

  itemName: {
    fontWeight: 700,
    fontSize: 14,
    color: theme.colors.textStrong,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  preview: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginTop: 3,
    maxWidth: 190,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: 12,
    background: "rgba(242,178,79,.16)",
    color: "#9a6107",
    border: "1px solid rgba(242,178,79,.28)",
    flexShrink: 0,
  },

  right: {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    backdropFilter: "blur(18px)",
    boxShadow: theme.shadow.card,
    height: "100%",
    minHeight: 0,
  },

  topBar: {
    padding: 16,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,.35)",
  },

  topLeft: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    minWidth: 0,
  },

  avatarLg: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(122,92,207,.16), rgba(242,178,79,.18))",
    border: `1px solid ${theme.colors.border}`,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: theme.colors.textStrong,
    flexShrink: 0,
  },

  topName: {
    fontWeight: 800,
    color: theme.colors.textStrong,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  topRole: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginTop: 3,
  },

  topActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  ghostBtn: {
    padding: "9px 12px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.72)",
    color: theme.colors.textDim,
    fontWeight: 700,
    cursor: "pointer",
    transition: theme.motion.base,
    boxShadow: theme.shadow.soft,
  },

  thread: {
    padding: 16,
    overflow: "auto",
    minHeight: 0,
    background:
      "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.08))",
  },

  bubble: {
    maxWidth: "70%",
    padding: "11px 13px",
    borderRadius: 18,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.82)",
    boxShadow: theme.shadow.soft,
    color: theme.colors.text,
  },

  mine: {
    background: "linear-gradient(135deg, rgba(242,178,79,.24), rgba(242,178,79,.12))",
    borderColor: "rgba(242,178,79,.22)",
  },

  theirs: {
    background: "rgba(255,255,255,.86)",
  },

  msgAvatarMine: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "rgba(242,178,79,.18)",
    border: "1px solid rgba(242,178,79,.28)",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#9a6107",
    flexShrink: 0,
    boxShadow: theme.shadow.soft,
  },

  msgAvatarTheirs: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "rgba(122,92,207,.12)",
    border: "1px solid rgba(122,92,207,.18)",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: theme.colors.accent,
    flexShrink: 0,
    boxShadow: theme.shadow.soft,
  },

  time: {
    opacity: 0.8,
    fontSize: 11,
    marginTop: 6,
    color: theme.colors.textDim,
  },

  composer: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderTop: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,.4)",
  },

  input: {
    ...ui.input,
    flex: 1,
    height: 46,
  },

  sendBtn: {
    padding: "12px 16px",
    borderRadius: theme.radius.pill,
    border: "none",
    fontWeight: 800,
    background: theme.gradients.primary,
    color: "#4a2d00",
    cursor: "pointer",
    boxShadow: theme.shadow.button,
    transition: theme.motion.base,
  },

  empty: {
    padding: 22,
    color: theme.colors.textDim,
  },

  emptyTitle: {
    fontWeight: 800,
    color: theme.colors.textStrong,
    marginBottom: 6,
  },

  emptySub: {
    fontSize: 14,
    color: theme.colors.textDim,
  },
};