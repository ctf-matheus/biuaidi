import { useState, useRef } from "react";
import { C } from "../lib/tokens";
import { PIPELINE } from "../orchestrator/pipeline.config";

function ProcessorIcon({ size = 28, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <line x1="9.5"  y1="7" x2="9.5"  y2="4" />
      <line x1="12"   y1="7" x2="12"   y2="4" />
      <line x1="14.5" y1="7" x2="14.5" y2="4" />
      <line x1="9.5"  y1="17" x2="9.5"  y2="20" />
      <line x1="12"   y1="17" x2="12"   y2="20" />
      <line x1="14.5" y1="17" x2="14.5" y2="20" />
      <line x1="7" y1="9.5"  x2="4" y2="9.5"  />
      <line x1="7" y1="12"   x2="4" y2="12"   />
      <line x1="7" y1="14.5" x2="4" y2="14.5" />
      <line x1="17" y1="9.5"  x2="20" y2="9.5"  />
      <line x1="17" y1="12"   x2="20" y2="12"   />
      <line x1="17" y1="14.5" x2="20" y2="14.5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function Sidebar({
  engagements, selected, setSelected,
  pipelineState, findings, agentRunning,
  onNewEngagement, onRenameEngagement,
}) {
  const [editingId,   setEditingId]   = useState(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredId,   setHoveredId]   = useState(null);
  const inputRef = useRef(null);

  function startEdit(ev, eng) {
    ev.stopPropagation();
    setEditingId(eng.id);
    setEditingName(eng.name);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit(id) {
    onRenameEngagement(id, editingName);
    setEditingId(null);
  }

  function cancelEdit() { setEditingId(null); }

  return (
    <div style={{
      width: 228,
      background: C.surface,
      borderRight: `1px solid var(--border)`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      boxShadow: "var(--shadow-xs)",
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: "16px 16px 14px", borderBottom: `1px solid var(--border)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProcessorIcon size={26} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.3px", color: C.textPrimary }}>BiUaiDi</div>
            <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: "2.5px", textTransform: "uppercase", marginTop: 1 }}>
              Red Team Orchestrator
            </div>
          </div>
        </div>
      </div>

      {/* ── Section label ── */}
      <div style={{ padding: "12px 14px 4px", fontSize: 8, color: C.textMuted, letterSpacing: "2.5px", textTransform: "uppercase" }}>
        Engagements
      </div>

      {/* ── Engagement list ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
        {engagements.map((e) => {
          const isSelected = e.id === selected;
          const done = Object.values(pipelineState[e.id]?.stages || {}).filter((s) => s === "done").length;
          const pct  = Math.round((done / PIPELINE.length) * 100);

          return (
            <div
              key={e.id}
              className="eng-item"
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                borderRadius: "var(--radius-md)",
                background: isSelected ? "var(--accent-subtle)" : "transparent",
                borderLeft: `2px solid ${isSelected ? "var(--accent)" : "transparent"}`,
                marginBottom: 2,
              }}
              onClick={() => { if (editingId !== e.id) setSelected(e.id); }}
              onMouseEnter={() => setHoveredId(e.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {editingId === e.id ? (
                <input
                  ref={inputRef}
                  value={editingName}
                  onChange={(ev) => setEditingName(ev.target.value)}
                  onBlur={() => commitEdit(e.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter")  { ev.preventDefault(); commitEdit(e.id); }
                    if (ev.key === "Escape") { ev.preventDefault(); cancelEdit(); }
                  }}
                  onClick={(ev) => ev.stopPropagation()}
                  style={{
                    width: "100%",
                    background: C.card,
                    border: `1px solid var(--accent)`,
                    borderRadius: "var(--radius-sm)",
                    padding: "2px 5px",
                    color: C.textPrimary,
                    fontFamily: "inherit",
                    fontSize: 11,
                    marginBottom: 2,
                  }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                  <span style={{
                    color: isSelected ? C.textPrimary : C.textSecondary,
                    fontSize: 11, fontWeight: isSelected ? 600 : 400,
                    flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {e.name}
                  </span>
                  {hoveredId === e.id && (
                    <button
                      className="rename-btn"
                      onClick={(ev) => startEdit(ev, e)}
                      title="Renomear"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "transparent", border: "none",
                        cursor: "pointer", color: C.textSecondary,
                        padding: 3, flexShrink: 0,
                      }}
                    >
                      <PencilIcon />
                    </button>
                  )}
                </div>
              )}

              {/* Progress row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: isSelected ? "var(--accent)" : "var(--text-muted)", borderRadius: 1, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 9, color: isSelected ? "var(--accent)" : C.textMuted, fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── New engagement ── */}
      <div style={{ padding: "6px 8px" }}>
        <button
          className="new-eng-btn"
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            border: `1px dashed var(--border)`,
            borderRadius: "var(--radius-md)",
            color: C.textSecondary,
            cursor: "pointer",
            fontSize: 10,
            fontFamily: "inherit",
            letterSpacing: "0.5px",
          }}
          onClick={onNewEngagement}
        >
          + novo engagement
        </button>
      </div>

      {/* ── Session stats ── */}
      <div style={{
        padding: "10px 14px",
        borderTop: `1px solid var(--border)`,
        fontSize: 9,
        color: C.textSecondary,
      }}>
        <div style={{ marginBottom: 3, fontSize: 8, color: C.textMuted, letterSpacing: "2px", textTransform: "uppercase" }}>
          Sessão
        </div>
        <div style={{ color: C.textSecondary }}>
          {engagements.length} engagement{engagements.length !== 1 ? "s" : ""} · {findings.length} findings
        </div>
        {agentRunning && (
          <div style={{ color: "var(--accent)", marginTop: 4, display: "flex", alignItems: "center", gap: 5, fontSize: 9 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
            agent em execução
          </div>
        )}
      </div>
    </div>
  );
}
