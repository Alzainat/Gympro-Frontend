import { useMemo, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { theme, ui } from "../../theme/uiTheme";

// ✅ خطط مختصرة (واجهة فقط)
const TIERS = [
  {
    tier: "bronze",
    price: 20,
    tagline: "Starter plan",
    perks: ["Workouts + Meals", "chat with trainer"],
  },
  {
    tier: "silver",
    price: 35,
    tagline: "Most popular",
    badge: "POPULAR",
    perks: ["Personalized plan", "Weekly adjustments", "Priority support"],
  },
  {
    tier: "gold",
    price: 55,
    tagline: "Premium coaching",
    perks: ["Advanced plan", "Daily tracking", "Coach messaging"],
  },
];

export default function Payments() {
  const navigate = useNavigate();

  const [msg, setMsg] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // goal
  const [goal, setGoal] = useState(""); // "cutting" | "bulking"

  // fetched pricing from backend based on goal
  // backend response: { plans: { bronze:{price,plan_key}, silver:{...}, gold:{...} } }
  const [plansMap, setPlansMap] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);

  // payment
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("cash");

  // demo card
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });

  const selectedPlan = useMemo(
    () => TIERS.find((p) => p.tier === selectedTier),
    [selectedTier]
  );

  // ✅ السعر النهائي من الباك إذا موجود، وإلا fallback من الواجهة
  const finalPrice = useMemo(() => {
    if (!selectedTier) return 0;
    const fromApi = plansMap?.[selectedTier]?.price;
    if (typeof fromApi === "number") return fromApi;
    return selectedPlan?.price ?? 0;
  }, [plansMap, selectedTier, selectedPlan]);

  // ✅ هل الخطة المختارة موجودة فعلاً من الباك؟
  const isSelectedPlanAvailable = useMemo(() => {
    if (!goal) return false;
    if (!plansMap) return false;
    return !!plansMap[selectedTier];
  }, [goal, plansMap, selectedTier]);

  const closeCheckout = () => {
    if (loading) return;
    setOpen(false);
  };

  const startCheckout = (tier) => {
    setMsg("");
    setSelectedTier(tier);

    // reset checkout state
    setGoal("");
    setPlansMap(null);
    setPlansLoading(false);

    setMethod("cash");
    setCard({ name: "", number: "", exp: "", cvc: "" });

    setOpen(true);
  };

  // ✅ fetch plans for a goal (for price + validation)
  const fetchPlansForGoal = async (g) => {
    setPlansLoading(true);
    setPlansMap(null);

    try {
      const res = await api.get("/member/plans", { params: { goal: g } });

      // expected: { plans: { bronze:{price,plan_key}, silver:{...}, gold:{...} } }
      const map = res?.data?.plans;

      if (!map || !map.bronze || !map.silver || !map.gold) {
        throw new Error("Invalid plans response");
      }

      setPlansMap(map);
    } catch (e) {
      setPlansMap(null);
      setMsg(
        e?.response?.data?.message ||
          "❌ Failed to load plans from database. Payment is blocked."
      );
    } finally {
      setPlansLoading(false);
    }
  };

  const onSelectGoal = async (g) => {
    if (loading) return;
    setMsg("");
    setGoal(g);
    await fetchPlansForGoal(g);
  };

  const pay = async () => {
    if (!selectedTier) return;

    if (!goal) {
      setMsg("❌ اختر الهدف: تنحيف أو تضخيم.");
      return;
    }

    if (plansLoading) {
      setMsg("⏳ عم نحمل بيانات الخطة...");
      return;
    }

    // ✅ منع الدفع إذا الخطط ما انحملت من الباك
    if (!plansMap) {
      setMsg("❌ لا يمكن إتمام الدفع لأن بيانات الخطة غير موجودة في قاعدة البيانات.");
      return;
    }

    // ✅ منع الدفع إذا الباقة المختارة غير موجودة بالخطة
    if (!plansMap[selectedTier]) {
      setMsg("❌ الخطة المختارة غير موجودة في قاعدة البيانات.");
      return;
    }

    const needsCard = method !== "cash";
    if (needsCard) {
      if (!card.name || !card.number || !card.exp || !card.cvc) {
        setMsg("❌ Please fill card details.");
        return;
      }
    }

    setLoading(true);
    setMsg("");

    try {
      await api.post("/member/subscribe", {
        goal,
        plan_key: selectedTier,
        payment_method: method,
      });

      setMsg("✅ Payment successful! Your workouts & meals are now available.");
      setOpen(false);
      navigate("/member/workouts");
    } catch (e) {
      const data = e?.response?.data;
      setMsg(data?.message || "❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={ui.bgGrid} />
      <div style={ui.glowTop} />
      <div style={ui.glowBottom} />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Choose Your Plan</h1>
          <div style={styles.sub}>
            Choose your tier, then pick <b>Cutting</b> or <b>Bulking</b> at checkout.
          </div>
        </div>

        {msg && <div style={styles.msg}>{msg}</div>}

        <div style={styles.grid}>
          {TIERS.map((plan) => (
            <div
              key={plan.tier}
              style={{
                ...styles.card,
                ...(plan.badge ? styles.cardPopular : null),
              }}
            >
              {!!plan.badge && <div style={styles.badge}>{plan.badge}</div>}

              <div style={styles.tier}>{plan.tier.toUpperCase()}</div>

              <div style={styles.priceRow}>
                <div style={styles.price}>${plan.price}</div>
                <div style={styles.perMonth}>/month</div>
              </div>

              <div style={styles.tagline}>{plan.tagline}</div>

              <div style={styles.list}>
                {plan.perks.map((x) => (
                  <div key={x} style={styles.item}>
                    <span style={styles.dot} />
                    <span style={styles.text}>{x}</span>
                  </div>
                ))}
              </div>

              <button style={styles.btn(false)} onClick={() => startCheckout(plan.tier)}>
                GET STARTED
              </button>
            </div>
          ))}
        </div>
      </div>

      {open && selectedPlan && (
        <div style={modal.backdrop} onClick={closeCheckout}>
          <div style={modal.modal} onClick={(e) => e.stopPropagation()}>
            <div style={modal.header}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Checkout</div>
              <button style={modal.xBtn} onClick={closeCheckout} disabled={loading}>
                ✕
              </button>
            </div>

            <div style={modal.box}>
              <div style={{ fontWeight: 900 }}>
                Tier: {selectedPlan.tier.toUpperCase()}
              </div>

              <div style={{ color: theme.colors.textDim, marginTop: 6 }}>
                Price: <b>${finalPrice}</b> / month
              </div>

              <div style={modal.sep} />

              <div style={{ fontWeight: 900, marginBottom: 8 }}>Choose Goal</div>

              <div style={modal.goalRow}>
                <button
                  style={modal.goalBtn(goal === "cutting")}
                  onClick={() => onSelectGoal("cutting")}
                  disabled={plansLoading || loading}
                  type="button"
                >
                  (Cutting)
                </button>

                <button
                  style={modal.goalBtn(goal === "bulking")}
                  onClick={() => onSelectGoal("bulking")}
                  disabled={plansLoading || loading}
                  type="button"
                >
                  (Bulking)
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 13, color: theme.colors.textDim }}>
                {plansLoading
                  ? "⏳ Loading plan from database..."
                  : goal && isSelectedPlanAvailable
                  ? "✅ Goal selected. Plan exists in database."
                  : goal && !plansLoading && !isSelectedPlanAvailable
                  ? "❌ Selected plan is unavailable in database."
                  : "       "}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Payment Method</div>

              <div style={modal.methods}>
                <label style={modal.radio}>
                  <input
                    type="radio"
                    checked={method === "cash"}
                    onChange={() => setMethod("cash")}
                  />
                  <span>Cash</span>
                </label>

                <label style={modal.radio}>
                  <input
                    type="radio"
                    checked={method === "credit_card"}
                    onChange={() => setMethod("credit_card")}
                  />
                  <span>Credit Card</span>
                </label>

                <label style={modal.radio}>
                  <input
                    type="radio"
                    checked={method === "debit_card"}
                    onChange={() => setMethod("debit_card")}
                  />
                  <span>Visa / Debit</span>
                </label>
              </div>

              {method !== "cash" && (
                <div style={modal.cardForm}>
                  <input
                    style={modal.input}
                    placeholder="Name on card"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                  />

                  <input
                    style={modal.input}
                    placeholder="Card number"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                  />

                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      style={modal.input}
                      placeholder="MM/YY"
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: e.target.value })}
                    />
                    <input
                      style={modal.input}
                      placeholder="CVC"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    />
                  </div>

                  <div style={{ fontSize: 12, color: theme.colors.textDim, marginTop: 8 }}>
                    * Demo checkout (no real payment gateway)
                  </div>
                </div>
              )}
            </div>

            <button
              style={modal.payBtn(
                loading || plansLoading || !goal || !isSelectedPlanAvailable
              )}
              onClick={pay}
              disabled={loading || plansLoading || !goal || !isSelectedPlanAvailable}
            >
              {loading
                ? "Processing..."
                : plansLoading
                ? "Loading plan..."
                : !goal
                ? "Select goal first"
                : !isSelectedPlanAvailable
                ? "Plan unavailable"
                : `Pay $${finalPrice}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    ...ui.page,
    padding: theme.layout.pagePadding,
  },
  container: {
    maxWidth: theme.layout.contentMax,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  header: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  h1: {
    margin: 0,
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: theme.colors.textStrong,
  },
  sub: {
    marginTop: 10,
    color: theme.colors.textDim,
    fontSize: 14,
  },
  msg: {
    margin: "12px auto 0",
    maxWidth: 920,
    padding: 12,
    borderRadius: theme.radius.md,
    background: "rgba(255,255,255,.76)",
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    boxShadow: theme.shadow.soft,
  },

  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    alignItems: "stretch",
  },

  card: {
    position: "relative",
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: 18,
    boxShadow: theme.shadow.card,
    display: "flex",
    flexDirection: "column",
    minHeight: 360,
    backdropFilter: "blur(18px)",
  },
  cardPopular: {
    border: "1px solid rgba(122,92,207,.22)",
    boxShadow: `${theme.shadow.card}, 0 0 0 6px rgba(122,92,207,.06)`,
  },
  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    fontSize: 11,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(122,92,207,.10)",
    color: theme.colors.accent,
    border: "1px solid rgba(122,92,207,.18)",
  },

  tier: {
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: 0.6,
    color: theme.colors.textStrong,
  },

  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 10,
  },
  price: {
    fontWeight: 800,
    fontSize: 40,
    color: theme.colors.textStrong,
  },
  perMonth: {
    color: theme.colors.textDim,
  },

  tagline: {
    marginTop: 6,
    color: theme.colors.textDim,
  },

  list: {
    marginTop: 14,
    display: "grid",
    gap: 10,
    flex: 1,
  },
  item: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: theme.gradients.mixed,
    boxShadow: theme.shadow.soft,
  },
  text: {
    color: theme.colors.text,
  },

  btn: (disabled) => ({
    width: "100%",
    padding: "12px 12px",
    borderRadius: theme.radius.pill,
    border: "none",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    background: theme.gradients.primary,
    color: "#4a2d00",
    marginTop: 14,
    boxShadow: disabled ? "none" : theme.shadow.button,
    transition: theme.motion.base,
  }),
};


const modal = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(47,35,71,.26)",
    display: "grid",
    placeItems: "center",
    zIndex: 50,
    padding: 14,
    backdropFilter: "blur(8px)",
  },
  modal: {
    width: "min(720px, 100%)",
    background: "rgba(255,255,255,.84)",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: 16,
    boxShadow: theme.shadow.card,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    color: theme.colors.textStrong,
  },
  xBtn: {
    border: "none",
    background: "transparent",
    color: theme.colors.textStrong,
    fontSize: 18,
    cursor: "pointer",
    opacity: 0.9,
  },
  box: {
    background: "rgba(255,255,255,.72)",
    border: `1px solid ${theme.colors.border}`,
    padding: 12,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
  },
  sep: {
    height: 1,
    background: theme.colors.border,
    margin: "12px 0",
    opacity: 0.9,
  },

  goalRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  goalBtn: (active) => ({
    flex: 1,
    minWidth: 180,
    padding: "12px 12px",
    borderRadius: theme.radius.pill,
    border: `1px solid ${active ? "rgba(122,92,207,.22)" : theme.colors.border}`,
    background: active ? "rgba(122,92,207,.10)" : "rgba(255,255,255,.72)",
    color: active ? theme.colors.accent : theme.colors.text,
    cursor: "pointer",
    fontWeight: 700,
    transition: theme.motion.base,
    boxShadow: active ? theme.shadow.soft : "none",
  }),

  methods: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  radio: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    background: "rgba(255,255,255,.72)",
    border: `1px solid ${theme.colors.border}`,
    padding: "8px 10px",
    borderRadius: theme.radius.md,
    cursor: "pointer",
    color: theme.colors.text,
  },

  cardForm: {
    marginTop: 10,
    background: "rgba(255,255,255,.72)",
    border: `1px solid ${theme.colors.border}`,
    padding: 12,
    borderRadius: theme.radius.md,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: theme.radius.md,
    background: "rgba(255,255,255,.9)",
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    marginTop: 8,
    outline: "none",
  },

  payBtn: (disabled) => ({
    marginTop: 12,
    width: "100%",
    padding: "12px 12px",
    borderRadius: theme.radius.pill,
    border: "none",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.65 : 1,
    background: theme.gradients.primary,
    color: "#4a2d00",
    boxShadow: disabled ? "none" : theme.shadow.button,
    transition: theme.motion.base,
  }),
};