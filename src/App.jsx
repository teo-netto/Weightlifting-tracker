import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────
// Pure black background, single white/off-white palette
// One accent: electric white. Typography does all the heavy lifting.
// Signature element: massive day number as background watermark text
const T = {
  bg: "#000000",
  surface: "#111111",
  border: "#1f1f1f",
  borderHi: "#2f2f2f",
  text: "#ffffff",
  textMid: "#888888",
  textDim: "#444444",
  accent: "#ffffff",
  accentDim: "#333333",
  positive: "#ffffff",
  negative: "#666666",
  radius: "0px",
  radiusSm: "0px",
};

const PROGRAM = {
  1: {
    name: "PUSH",
    sub: "Chest · Shoulders · Triceps",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6–8", type: "compound" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", type: "compound" },
      { name: "Overhead Press", sets: 3, reps: "8–10", type: "compound" },
      { name: "Lateral Raises", sets: 4, reps: "12–15", type: "isolation" },
      { name: "Tricep Rope Pushdown", sets: 3, reps: "12", type: "isolation" },
      { name: "Overhead Tricep Extension", sets: 3, reps: "12", type: "isolation" },
    ],
  },
  2: {
    name: "PULL",
    sub: "Back · Biceps",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "5", type: "compound" },
      { name: "Pull-Ups / Lat Pulldown", sets: 4, reps: "8–10", type: "compound" },
      { name: "Seated Cable Row", sets: 3, reps: "10–12", type: "compound" },
      { name: "Face Pulls", sets: 3, reps: "15", type: "isolation" },
      { name: "Barbell / Dumbbell Curl", sets: 3, reps: "10–12", type: "isolation" },
      { name: "Hammer Curls", sets: 3, reps: "12", type: "isolation" },
    ],
  },
  3: {
    name: "LEGS",
    sub: "Quad Focus",
    exercises: [
      { name: "Barbell Back Squat", sets: 4, reps: "6–8", type: "compound" },
      { name: "Leg Press", sets: 3, reps: "10–12", type: "compound" },
      { name: "Leg Extension", sets: 4, reps: "12–15", type: "isolation" },
      { name: "Walking Lunges", sets: 3, reps: "12 each", type: "compound" },
      { name: "Calf Raises", sets: 4, reps: "15–20", type: "isolation" },
    ],
  },
  4: {
    name: "PUSH",
    sub: "Chest · Shoulders · Triceps — Variation",
    exercises: [
      { name: "Dumbbell Bench Press", sets: 4, reps: "8–10", type: "compound" },
      { name: "Cable Chest Fly", sets: 3, reps: "12–15", type: "isolation" },
      { name: "Machine Shoulder Press", sets: 3, reps: "10–12", type: "compound" },
      { name: "Cable Lateral Raises", sets: 4, reps: "12–15", type: "isolation" },
      { name: "Dips", sets: 3, reps: "10", type: "compound" },
      { name: "Skull Crushers", sets: 3, reps: "10–12", type: "isolation" },
    ],
  },
  5: {
    name: "PULL",
    sub: "Back · Biceps — Variation",
    exercises: [
      { name: "Barbell Bent-Over Row", sets: 4, reps: "6–8", type: "compound" },
      { name: "Single-Arm Dumbbell Row", sets: 3, reps: "10 each", type: "compound" },
      { name: "Cable Pullover", sets: 3, reps: "12", type: "isolation" },
      { name: "Reverse Fly", sets: 3, reps: "15", type: "isolation" },
      { name: "Incline Dumbbell Curl", sets: 3, reps: "12", type: "isolation" },
      { name: "Preacher Curl", sets: 3, reps: "10–12", type: "isolation" },
    ],
  },
  6: {
    name: "LEGS",
    sub: "Glutes · Hamstrings",
    exercises: [
      { name: "Romanian Deadlift", sets: 4, reps: "8–10", type: "compound" },
      { name: "Barbell Hip Thrust", sets: 4, reps: "10–12", type: "compound" },
      { name: "Bulgarian Split Squat", sets: 3, reps: "10 each", type: "compound" },
      { name: "Seated Leg Curl", sets: 3, reps: "12–15", type: "isolation" },
      { name: "Cable Kickback", sets: 3, reps: "15 each", type: "isolation" },
      { name: "Seated Calf Raises", sets: 4, reps: "15–20", type: "isolation" },
    ],
  },
  7: { name: "REST", sub: "Recovery", exercises: [] },
};

const STORAGE_KEY = "ppl_logs_v2";
const WEIGHT_KEY = "ppl_weight_v2";

async function getAISuggestion(exercise, logs) {
  const recent = logs.slice(-3);
  const prompt = `You are a terse, no-nonsense personal trainer. Exercise: "${exercise}". Recent history: ${JSON.stringify(recent)}. Give ONE specific, actionable tip in under 30 words. No fluff. Start with the action.`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d = await r.json();
    return d.content?.[0]?.text || "Add 2.5kg this week.";
  } catch {
    return "Add 2.5kg this week.";
  }
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────

const BottomNav = ({ view, setView }) => (
  <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.bg, borderTop: `1px solid ${T.border}`, display: "flex" }}>
    {[
      { icon: "↑", label: "TRAIN", v: "home" },
      { icon: "○", label: "WEIGHT", v: "weight" },
      { icon: "≡", label: "LOG", v: "history" },
    ].map(tab => (
      <div key={tab.v} onClick={() => setView(tab.v)}
        style={{ flex: 1, padding: "14px 0 12px", textAlign: "center", cursor: "pointer", borderTop: view === tab.v ? `2px solid ${T.accent}` : "2px solid transparent" }}>
        <div style={{ fontSize: 18, color: view === tab.v ? T.accent : T.textDim, lineHeight: 1 }}>{tab.icon}</div>
        <div style={{ fontSize: 9, color: view === tab.v ? T.accent : T.textDim, marginTop: 4, letterSpacing: 2 }}>{tab.label}</div>
      </div>
    ))}
  </div>
);

const BackBtn = ({ onClick }) => (
  <div onClick={onClick} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, color: T.textMid, fontSize: 12, letterSpacing: 1 }}>
    ← BACK
  </div>
);

// ─── MAIN APP ────────────────────────────────────────────────────

export default function WorkoutTracker() {
  const [view, setView] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [logs, setLogs] = useState({});
  const [weightLogs, setWeightLogs] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [completedSets, setCompletedSets] = useState({});
  const [aiTip, setAiTip] = useState({ text: "", loading: false, exercise: "" });
  const [weightInput, setWeightInput] = useState("");
  const [weightNote, setWeightNote] = useState("");
  const [timerCount, setTimerCount] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY); if (s) setLogs(JSON.parse(s));
      const w = localStorage.getItem(WEIGHT_KEY); if (w) setWeightLogs(JSON.parse(w));
    } catch {}
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    if (timerCount <= 0) { setTimerRunning(false); return; }
    const t = setTimeout(() => setTimerCount(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timerCount]);

  const saveLogs = (n) => { setLogs(n); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); } catch {} };
  const saveWeightLogs = (n) => { setWeightLogs(n); try { localStorage.setItem(WEIGHT_KEY, JSON.stringify(n)); } catch {} };

  const getLastSession = (day) => {
    const keys = Object.keys(logs).filter(k => k.startsWith(`d${day}_`)).sort().reverse();
    return keys.length ? logs[keys[0]] : null;
  };

  const updateSet = (ex, si, field, val) => setSessionData(p => ({
    ...p, [ex]: { ...p[ex], [si]: { ...(p[ex]?.[si] || {}), [field]: val } }
  }));

  const toggleSet = (ex, si) => {
    const k = `${ex}_${si}`;
    setCompletedSets(p => ({ ...p, [k]: !p[k] }));
    if (!completedSets[`${ex}_${si}`]) {
      const type = PROGRAM[activeSession]?.exercises.find(e => e.name === ex)?.type;
      setTimerCount(type === "compound" ? 150 : 75);
      setTimerRunning(true);
    }
  };

  const startSession = (day) => { setActiveSession(day); setSessionData({}); setCompletedSets({}); setView("session"); };

  const finishSession = () => {
    const date = new Date().toISOString().split("T")[0];
    saveLogs({ ...logs, [`d${activeSession}_${date}_${Date.now()}`]: { day: activeSession, date, exercises: sessionData } });
    setActiveSession(null); setView("home");
  };

  const fetchAI = async (name) => {
    setAiTip({ text: "", loading: true, exercise: name });
    const dayLogs = Object.values(logs).filter(l => l.exercises?.[name]).map(l => ({ date: l.date, sets: l.exercises[name] }));
    const text = await getAISuggestion(name, dayLogs);
    setAiTip({ text, loading: false, exercise: name });
  };

  const addWeight = () => {
    if (!weightInput) return;
    saveWeightLogs([...weightLogs, { date: new Date().toISOString().split("T")[0], weight: parseFloat(weightInput), note: weightNote }]);
    setWeightInput(""); setWeightNote("");
  };

  const totalSessions = Object.keys(logs).length;
  const lastWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null;
  const weightChange = weightLogs.length > 1 ? (weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight).toFixed(1) : null;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const base = { background: T.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: T.text, paddingBottom: 72 };

  // ── HOME ─────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={base}>
      {/* Hero header */}
      <div style={{ padding: "32px 20px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 3, marginBottom: 6 }}>PPL PROGRAM</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>LIFT.</div>
          <div style={{ textAlign: "right" }}>
            {lastWeight && <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{lastWeight}<span style={{ fontSize: 14, color: T.textMid, fontWeight: 400 }}>kg</span></div>}
            {weightChange && <div style={{ fontSize: 12, color: weightChange < 0 ? T.accent : T.textMid, letterSpacing: 1 }}>{weightChange < 0 ? "" : "+"}{weightChange}kg</div>}
          </div>
        </div>
        {/* Stats strip */}
        <div style={{ display: "flex", gap: 0, marginTop: 20, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          {[
            { v: totalSessions, l: "SESSIONS" },
            { v: lastWeight ? `${lastWeight}kg` : "—", l: "CURRENT" },
            { v: weightChange ? `${weightChange}kg` : "—", l: "CHANGE" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "14px 0", textAlign: "center", borderRight: i < 2 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Day list */}
      <div style={{ padding: "0" }}>
        {Object.entries(PROGRAM).map(([day, p]) => {
          const isRest = p.name === "REST";
          const last = getLastSession(parseInt(day));
          const totalSets = p.exercises.reduce((a, e) => a + e.sets, 0);
          return (
            <div key={day}
              onClick={() => !isRest && (setSelectedDay(parseInt(day)), setView("day"))}
              style={{
                padding: "20px",
                borderBottom: `1px solid ${T.border}`,
                cursor: isRest ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 16,
                position: "relative", overflow: "hidden",
              }}>
              {/* Watermark day number */}
              <div style={{
                position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                fontSize: 80, fontWeight: 900, color: T.surface, lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: -4
              }}>{day}</div>

              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: isRest ? T.textDim : T.text }}>{p.name}</div>
                  {!isRest && <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2 }}>DAY {day}</div>}
                </div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{p.sub}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {!isRest && <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 1 }}>{p.exercises.length} EXERCISES · {totalSets} SETS</div>}
                  {last && <div style={{ fontSize: 10, color: T.textMid, letterSpacing: 1 }}>✓ {last.date}</div>}
                </div>
              </div>
              {!isRest && <div style={{ fontSize: 24, color: T.textDim }}>→</div>}
            </div>
          );
        })}
      </div>
      <BottomNav view={view} setView={setView} />
    </div>
  );

  // ── DAY DETAIL ───────────────────────────────────────────────
  if (view === "day" && selectedDay) {
    const p = PROGRAM[selectedDay];
    const last = getLastSession(selectedDay);
    return (
      <div style={base}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${T.border}` }}>
          <BackBtn onClick={() => setView("home")} />
          <div style={{ marginTop: 16, position: "relative" }}>
            <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 3 }}>DAY {selectedDay}</div>
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -2, lineHeight: 1.1 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: T.textMid, marginTop: 4 }}>{p.sub}</div>
          </div>
          {last && (
            <div style={{ marginTop: 14, padding: "10px 14px", border: `1px solid ${T.border}`, fontSize: 11, color: T.textMid, letterSpacing: 1 }}>
              LAST SESSION — {last.date}
            </div>
          )}
        </div>

        {/* AI panel */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 10 }}>COACH TIPS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.exercises.filter(e => e.type === "compound").map(e => (
              <button key={e.name} onClick={() => fetchAI(e.name)}
                style={{ background: "none", border: `1px solid ${T.borderHi}`, padding: "7px 12px", color: T.textMid, fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>
                {e.name.split(" ").slice(-1)[0].toUpperCase()} →
              </button>
            ))}
          </div>
          {(aiTip.loading || aiTip.text) && (
            <div style={{ marginTop: 14, padding: "14px", background: T.surface, borderLeft: `3px solid ${T.accent}` }}>
              {aiTip.loading
                ? <div style={{ fontSize: 12, color: T.textDim, letterSpacing: 1 }}>ANALYSING...</div>
                : <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{aiTip.text}</div>}
            </div>
          )}
        </div>

        {/* Exercise list */}
        <div>
          {p.exercises.map((ex, i) => {
            const lastData = last?.exercises?.[ex.name];
            return (
              <div key={ex.name} style={{ padding: "18px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: T.textMid, marginTop: 4 }}>{ex.sets} × {ex.reps}</div>
                  {lastData && (
                    <div style={{ fontSize: 10, color: T.textDim, marginTop: 6, letterSpacing: 0.5 }}>
                      PREV: {Object.values(lastData).map(s => s.weight ? `${s.weight}kg` : null).filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 9, color: ex.type === "compound" ? T.textMid : T.textDim, letterSpacing: 2, paddingTop: 2 }}>
                  {ex.type === "compound" ? "COMPOUND" : "ISOLATION"}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "20px" }}>
          <button onClick={() => startSession(selectedDay)}
            style={{ width: "100%", padding: "18px", background: T.accent, border: "none", color: T.bg, fontSize: 14, fontWeight: 900, cursor: "pointer", letterSpacing: 3 }}>
            START SESSION →
          </button>
        </div>
        <BottomNav view={view} setView={setView} />
      </div>
    );
  }

  // ── ACTIVE SESSION ───────────────────────────────────────────
  if (view === "session" && activeSession) {
    const p = PROGRAM[activeSession];
    const last = getLastSession(activeSession);
    const totalSets = p.exercises.reduce((a, e) => a + e.sets, 0);
    const doneCount = Object.values(completedSets).filter(Boolean).length;
    const pct = totalSets > 0 ? Math.round((doneCount / totalSets) * 100) : 0;

    return (
      <div style={{ ...base, paddingBottom: 100 }}>
        {/* Session header */}
        <div style={{ padding: "20px 20px 0", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 3 }}>DAY {activeSession} — IN SESSION</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{p.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 900 }}>{pct}<span style={{ fontSize: 16, color: T.textMid, fontWeight: 400 }}>%</span></div>
              <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 1 }}>{doneCount}/{totalSets} SETS</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: T.border, marginBottom: -1 }}>
            <div style={{ height: 3, background: T.accent, width: `${pct}%`, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* Rest timer */}
        {timerCount > 0 && (
          <div style={{ padding: "12px 20px", background: timerRunning ? T.surface : T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
              {timerRunning ? `REST  ${fmt(timerCount)}` : "REST DONE"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setTimerRunning(p => !p)}
                style={{ background: "none", border: `1px solid ${T.borderHi}`, padding: "5px 12px", color: T.textMid, fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>
                {timerRunning ? "PAUSE" : "GO"}
              </button>
              <button onClick={() => { setTimerCount(0); setTimerRunning(false); }}
                style={{ background: "none", border: `1px solid ${T.borderHi}`, padding: "5px 12px", color: T.textDim, fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>
                SKIP
              </button>
            </div>
          </div>
        )}

        {/* Exercises */}
        {p.exercises.map((ex) => {
          const lastData = last?.exercises?.[ex.name];
          return (
            <div key={ex.name} style={{ borderBottom: `1px solid ${T.border}` }}>
              {/* Exercise header */}
              <div style={{ padding: "16px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3 }}>{ex.name}</div>
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 2, letterSpacing: 1 }}>
                    {ex.sets} SETS · {ex.reps} REPS · {ex.type === "compound" ? "2–3 MIN REST" : "60–90S REST"}
                  </div>
                </div>
                <button onClick={() => fetchAI(ex.name)}
                  style={{ background: "none", border: `1px solid ${T.borderHi}`, padding: "5px 10px", color: T.textDim, fontSize: 9, cursor: "pointer", letterSpacing: 2 }}>
                  AI
                </button>
              </div>

              {/* Sets */}
              <div style={{ padding: "0 20px 14px" }}>
                {Array.from({ length: ex.sets }, (_, i) => {
                  const done = completedSets[`${ex.name}_${i}`];
                  const prev = lastData?.[i];
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
                      <div style={{ fontSize: 10, color: T.textDim, width: 20, letterSpacing: 1, flexShrink: 0 }}>{i + 1}</div>
                      <input type="number"
                        placeholder={prev?.weight || "kg"}
                        value={sessionData[ex.name]?.[i]?.weight || ""}
                        onChange={e => updateSet(ex.name, i, "weight", e.target.value)}
                        style={{ flex: 1, background: done ? "#0a0a0a" : T.surface, border: `1px solid ${done ? T.border : T.borderHi}`, padding: "10px 12px", color: done ? T.textDim : T.text, fontSize: 14, fontWeight: 700, outline: "none" }}
                      />
                      <input type="number"
                        placeholder={prev?.reps || "reps"}
                        value={sessionData[ex.name]?.[i]?.reps || ""}
                        onChange={e => updateSet(ex.name, i, "reps", e.target.value)}
                        style={{ flex: 1, background: done ? "#0a0a0a" : T.surface, border: `1px solid ${done ? T.border : T.borderHi}`, padding: "10px 12px", color: done ? T.textDim : T.text, fontSize: 14, fontWeight: 700, outline: "none" }}
                      />
                      <div onClick={() => toggleSet(ex.name, i)}
                        style={{ width: 38, height: 38, background: done ? T.accent : "none", border: `2px solid ${done ? T.accent : T.borderHi}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: done ? T.bg : T.textDim, flexShrink: 0, fontWeight: 900 }}>
                        {done ? "✓" : ""}
                      </div>
                    </div>
                  );
                })}
                {lastData && (
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 6, letterSpacing: 0.5 }}>
                    PREV: {Object.values(lastData).map((s, i) => s.weight ? `${s.weight}×${s.reps}` : null).filter(Boolean).join("  ")}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI overlay */}
        {(aiTip.loading || aiTip.text) && (
          <div style={{ position: "fixed", bottom: 86, left: 16, right: 16, background: T.surface, padding: 16, border: `1px solid ${T.borderHi}`, borderLeft: `3px solid ${T.accent}`, zIndex: 50 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2 }}>COACH · {aiTip.exercise.toUpperCase().split(" ").slice(-1)[0]}</div>
              <div onClick={() => setAiTip({ text: "", loading: false, exercise: "" })} style={{ cursor: "pointer", color: T.textDim, fontSize: 16 }}>×</div>
            </div>
            {aiTip.loading
              ? <div style={{ fontSize: 12, color: T.textDim, letterSpacing: 2 }}>THINKING...</div>
              : <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{aiTip.text}</div>}
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.bg, borderTop: `1px solid ${T.border}`, padding: "12px 16px", display: "flex", gap: 10 }}>
          <button onClick={() => { setView("day"); setSelectedDay(activeSession); }}
            style={{ flex: 1, padding: "14px", background: "none", border: `1px solid ${T.borderHi}`, color: T.textMid, fontSize: 11, cursor: "pointer", letterSpacing: 2 }}>
            QUIT
          </button>
          <button onClick={finishSession}
            style={{ flex: 3, padding: "14px", background: T.accent, border: "none", color: T.bg, fontSize: 13, fontWeight: 900, cursor: "pointer", letterSpacing: 3 }}>
            DONE — {pct}%
          </button>
        </div>
      </div>
    );
  }

  // ── WEIGHT ───────────────────────────────────────────────────
  if (view === "weight") return (
    <div style={base}>
      <div style={{ padding: "32px 20px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 3, marginBottom: 8 }}>TRACK</div>
        <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>WEIGHT.</div>
        {weightChange && (
          <div style={{ fontSize: 14, color: weightChange < 0 ? T.accent : T.textMid, marginTop: 8, fontWeight: 700, letterSpacing: 1 }}>
            {weightChange < 0 ? "▼ " : "▲ "}{Math.abs(weightChange)}KG FROM START
          </div>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        <input type="number" step="0.1" placeholder="Weight in kg"
          value={weightInput} onChange={e => setWeightInput(e.target.value)}
          style={{ width: "100%", background: T.surface, border: `1px solid ${T.borderHi}`, padding: "14px 16px", color: T.text, fontSize: 20, fontWeight: 700, outline: "none", marginBottom: 10, boxSizing: "border-box" }}
        />
        <input type="text" placeholder="Note (optional)"
          value={weightNote} onChange={e => setWeightNote(e.target.value)}
          style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, padding: "12px 16px", color: T.textMid, fontSize: 13, outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />
        <button onClick={addWeight}
          style={{ width: "100%", padding: "16px", background: T.accent, border: "none", color: T.bg, fontSize: 13, fontWeight: 900, cursor: "pointer", letterSpacing: 3 }}>
          LOG WEIGHT
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}` }}>
        <div style={{ padding: "14px 20px", fontSize: 9, color: T.textDim, letterSpacing: 3 }}>HISTORY</div>
        {[...weightLogs].reverse().map((e, i, arr) => {
          const prev = arr[i + 1];
          const diff = prev ? (e.weight - prev.weight).toFixed(1) : null;
          return (
            <div key={i} style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{e.weight}<span style={{ fontSize: 12, color: T.textMid, fontWeight: 400 }}> kg</span></div>
                <div style={{ fontSize: 10, color: T.textDim, marginTop: 3, letterSpacing: 1 }}>{e.date}{e.note ? `  ·  ${e.note}` : ""}</div>
              </div>
              {diff && <div style={{ fontSize: 16, fontWeight: 700, color: diff < 0 ? T.accent : T.textDim }}>{diff > 0 ? "+" : ""}{diff}</div>}
            </div>
          );
        })}
        {!weightLogs.length && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: T.textDim, fontSize: 11, letterSpacing: 2 }}>NO DATA YET</div>
        )}
      </div>
      <BottomNav view={view} setView={setView} />
    </div>
  );

  // ── HISTORY ──────────────────────────────────────────────────
  if (view === "history") return (
    <div style={base}>
      <div style={{ padding: "32px 20px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 3, marginBottom: 8 }}>PROGRESS</div>
        <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>LOG.</div>
        <div style={{ fontSize: 12, color: T.textMid, marginTop: 8, letterSpacing: 1 }}>{totalSessions} SESSIONS COMPLETED</div>
      </div>

      {Object.entries(logs).sort((a, b) => b[1].date.localeCompare(a[1].date)).map(([key, s]) => {
        const p = PROGRAM[s.day];
        const sets = Object.values(s.exercises || {}).reduce((a, e) => a + Object.keys(e).length, 0);
        return (
          <div key={key} style={{ padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>{p?.name}</div>
                  <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2 }}>DAY {s.day}</div>
                </div>
                <div style={{ fontSize: 10, color: T.textDim, marginTop: 4, letterSpacing: 1 }}>{s.date} · {sets} SETS LOGGED</div>
              </div>
            </div>
            {Object.entries(s.exercises || {}).slice(0, 2).map(([name, setData]) => (
              <div key={name} style={{ marginTop: 10, fontSize: 11, color: T.textDim }}>
                <span style={{ color: T.textMid }}>{name} </span>
                {Object.values(setData).map((d, i) => d.weight ? `${d.weight}×${d.reps}` : null).filter(Boolean).join("  ")}
              </div>
            ))}
          </div>
        );
      })}

      {!totalSessions && (
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 60, fontWeight: 900, color: T.border, letterSpacing: -4 }}>0</div>
          <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 3, marginTop: 8 }}>START YOUR FIRST SESSION</div>
        </div>
      )}
      <BottomNav view={view} setView={setView} />
    </div>
  );

  return null;
}
