import { C } from "../lib/tokens";
import { AGENTS } from "../agents";

export default function OutputPanel({ activeOutput }) {
  if (!activeOutput) {
    return (
      <div style={{ animation: "fadeIn 0.2s", display: "flex", alignItems: "center", justifyContent: "center", height: "60%" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <div style={{ color: C.textMuted, fontSize: 11 }}>
            Execute um agent e clique em uma etapa concluída para ver o output
          </div>
        </div>
      </div>
    );
  }

  const agent = activeOutput.agentKey ? AGENTS[activeOutput.agentKey] : null;

  return (
    <div style={{ animation: "fadeIn 0.2s" }}>
      <div style={{
        background: C.card,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}>
        {/* Header */}
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: C.surface,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          {agent && (
            <span style={{
              width: 26, height: 26,
              background: "var(--accent-subtle)",
              borderRadius: "var(--radius-sm)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: agent.color,
            }}>
              {agent.icon}
            </span>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>
              {agent ? agent.label : "Output"}
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.5px" }}>
              stage: {activeOutput.stageId}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          <pre style={{
            background: "var(--code-bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            overflow: "auto",
            color: "var(--code-text)",
            fontSize: 11,
            lineHeight: 1.75,
            maxHeight: 520,
            fontFamily: "inherit",
          }}>
            {JSON.stringify(activeOutput.output, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
