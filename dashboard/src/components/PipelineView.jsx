import { C, SEV_COLOR } from "../lib/tokens";

export default function PipelineView({
  pipeline, agents, eng,
  progress, findings, findingsStats, criticals, highs,
  agentRunning, logs, logRef,
  onRunAgent, onCompleteManual, onShowOutput, onBurpInput,
}) {
  return (
    <div style={{ animation: "fadeIn 0.2s" }}>

      {/* ── Metrics row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Progresso", value: `${progress}%`, color: "var(--accent)",       border: "var(--accent)" },
          { label: "Findings",  value: findings.length, color: "var(--yellow)",       border: "var(--yellow)" },
          { label: "Críticos",  value: criticals,       color: "var(--sev-critical)", border: "var(--sev-critical)" },
          { label: "Altos",     value: highs,           color: "var(--sev-high)",     border: "var(--sev-high)" },
        ].map((m) => (
          <div key={m.label} style={{
            background: C.card,
            border: `1px solid var(--border)`,
            borderLeft: `3px solid ${m.border}`,
            borderRadius: "var(--radius-lg)",
            padding: "14px 16px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ fontSize: 9, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pipeline grid ── */}
      <div style={{ marginBottom: 6, fontSize: 9, color: C.textMuted, letterSpacing: "2px", textTransform: "uppercase" }}>
        Pipeline de Execução
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 24 }}>
        {pipeline.map((stage) => {
          const status    = eng.stages[stage.id];
          const agent     = stage.agentKey ? agents[stage.agentKey] : null;
          const isRunning = status === "running";
          const isDone    = status === "done";
          const isError   = status === "error";
          const isIdle    = status === "idle";
          const isManual  = stage.manual;

          const borderColor = isRunning ? "var(--accent)" : isDone ? "var(--green)" : isError ? "var(--red)" : "var(--border)";
          const bgColor     = isRunning ? "var(--card-running)" : isDone ? "var(--card-done)" : isError ? "var(--card-error)" : C.card;

          return (
            <div
              key={stage.id}
              className="stage-card"
              style={{
                padding: "12px 12px 10px",
                borderRadius: "var(--radius-lg)",
                border: `1px solid ${borderColor}`,
                background: bgColor,
                cursor: isIdle || isError || (isDone && eng.stageOutputs[stage.id]) ? "pointer" : "default",
                position: "relative",
                opacity: isIdle ? 0.6 : 1,
                boxShadow: "var(--shadow-sm)",
              }}
              onClick={() => {
                if (isDone && eng.stageOutputs[stage.id]) {
                  onShowOutput(eng.stageOutputs[stage.id], stage.id, stage.agentKey);
                  return;
                }
                if (isIdle || isError) {
                  if (stage.inputRequired) { onBurpInput(stage.id); return; }
                  if (isManual) onCompleteManual(stage.id);
                  else onRunAgent(stage.id);
                }
              }}
            >
              {/* Step badge */}
              <div style={{
                position: "absolute", top: 9, right: 9,
                fontSize: 8, fontWeight: 700,
                color: isRunning ? "var(--accent)" : isDone ? "var(--green)" : isError ? "var(--red)" : C.textMuted,
                letterSpacing: "0.5px",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {isRunning && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--accent)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    display: "inline-block",
                  }} />
                )}
                {!isRunning && `${stage.step < 10 ? "0" : ""}${stage.step}`}
              </div>

              <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 4, letterSpacing: "0.5px" }}>
                STEP {stage.step}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, lineHeight: 1.4, paddingRight: 16 }}>
                {stage.label}
              </div>

              {/* Type pill */}
              <div style={{
                fontSize: 8, padding: "2px 6px", borderRadius: "var(--radius-sm)",
                display: "inline-flex", alignItems: "center", gap: 3,
                marginBottom: 7,
                background: isManual ? "var(--blue-subtle)" : "var(--accent-subtle)",
                color: isManual ? "var(--blue)" : "var(--accent)",
                fontWeight: 600, letterSpacing: "0.5px",
              }}>
                {isManual ? "MANUAL" : "AGENT"}
              </div>

              {/* Agent name */}
              {agent && (
                <div style={{ fontSize: 9, color: agent.color, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {agent.icon} {agent.label}
                </div>
              )}

              {/* Status text */}
              <div style={{
                fontSize: 9,
                color: isRunning ? "var(--accent)" : isDone ? "var(--green)" : isError ? "var(--red)" : C.textMuted,
                letterSpacing: "0.3px",
              }}>
                {isRunning && "executando..."}
                {isDone    && `✓ concluído${eng.stageOutputs[stage.id] ? " · ver output" : ""}`}
                {isError   && "✗ erro — retry?"}
                {isIdle    && (stage.inputRequired ? "colar findings" : isManual ? "marcar concluído" : "executar agent")}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Activity log ── */}
      <div style={{
        background: C.card,
        border: `1px solid var(--border)`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{
          padding: "8px 14px",
          borderBottom: `1px solid var(--border)`,
          background: C.surface,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "2px", textTransform: "uppercase" }}>Activity Log</span>
          <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.5px" }}>{logs.length} events</span>
        </div>
        <div ref={logRef} style={{ padding: "10px 14px", maxHeight: 160, overflowY: "auto" }}>
          {logs.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "2px 0", fontSize: 10, lineHeight: 1.6 }}>
              <span style={{ color: C.textMuted, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{l.ts}</span>
              <span style={{
                color: l.level === "error" ? "var(--red)" : l.level === "success" ? "var(--green)" : C.textSecondary,
                flexShrink: 0, fontWeight: 600,
              }}>
                [{l.level}]
              </span>
              <span style={{ color: C.textSecondary }}>{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
