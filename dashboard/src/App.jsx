import { useState } from "react";
import { C } from "./lib/tokens";
import { useTheme } from "./lib/useTheme";
import { PIPELINE } from "./orchestrator/pipeline.config";
import { AGENTS } from "./agents";
import { useOrchestrator } from "./hooks/useOrchestrator";

import Sidebar              from "./components/Sidebar";
import PipelineView         from "./components/PipelineView";
import FindingsTable        from "./components/FindingsTable";
import OutputPanel          from "./components/OutputPanel";
import ThemeToggle          from "./components/ThemeToggle";
import NewEngagementModal   from "./components/modals/NewEngagementModal";
import BurpInputModal       from "./components/modals/BurpInputModal";

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();

  const {
    engagements,
    selected, setSelected,
    pipelineState,
    agentRunning,
    logs, logRef,
    eng, currentEng,
    progress, findings, findingsStats, criticals, highs,
    runAgentForStage,
    completeManual,
    setBurpFindings,
    createEngagement,
    renameEngagement,
  } = useOrchestrator();

  const [activeTab,          setActiveTab]          = useState("pipeline");
  const [activeOutput,       setActiveOutput]       = useState(null);
  const [showNewModal,       setShowNewModal]       = useState(false);
  const [showBurpModal,      setShowBurpModal]      = useState(false);
  const [pendingBurpStageId, setPendingBurpStageId] = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleRunAgent(stageId) {
    if (stageId === "findings" && !eng?.context?.burp_raw) {
      setPendingBurpStageId(stageId);
      setShowBurpModal(true);
      return;
    }
    runAgentForStage(stageId).then((output) => {
      if (output) {
        setActiveOutput({ stageId, output, agentKey: PIPELINE.find((s) => s.id === stageId)?.agentKey });
        setActiveTab("output");
      }
    });
  }

  function handleBurpInput(stageId) {
    setPendingBurpStageId(stageId);
    setShowBurpModal(true);
  }

  function handleBurpSubmit(text) {
    setShowBurpModal(false);
    setBurpFindings(text, pendingBurpStageId === "findings" ? "findings" : null);
    setPendingBurpStageId(null);
  }

  function handleShowOutput(output, stageId, agentKey) {
    setActiveOutput({ output, stageId, agentKey });
    setActiveTab("output");
  }

  function handleSelectFinding(finding) {
    setActiveOutput({ stageId: "findings", output: finding, agentKey: "findings" });
    setActiveTab("output");
  }

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!eng || !currentEng) {
    return (
      <div style={{
        background: C.bg, color: C.textSecondary,
        height: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        Selecione um engagement
      </div>
    );
  }

  const completedCount = Object.values(eng.stages).filter((s) => s === "done").length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: C.bg,
      color: C.textPrimary,
      overflow: "hidden",
    }}>
      <Sidebar
        engagements={engagements}
        selected={selected}
        setSelected={setSelected}
        pipelineState={pipelineState}
        findings={findings}
        agentRunning={agentRunning}
        onNewEngagement={() => setShowNewModal(true)}
        onRenameEngagement={renameEngagement}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* ── Topbar ── */}
        <div style={{
          padding: "0 20px",
          height: 52,
          borderBottom: `1px solid var(--border)`,
          background: C.surface,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
          boxShadow: "var(--shadow-xs)",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentEng.name}
            </div>
            <div style={{ color: C.textSecondary, fontSize: 10, marginTop: 1 }}>
              {currentEng.id} · {completedCount}/{PIPELINE.length} etapas
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 80, height: 2, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.5s ease", borderRadius: 2 }} />
            </div>
            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 11, width: 32, textAlign: "right" }}>{progress}%</span>
          </div>

          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "3px 10px",
            borderRadius: "var(--radius-lg)",
            fontSize: 9,
            letterSpacing: "1px",
            fontWeight: 600,
            background: agentRunning ? "var(--badge-processing-bg)" : "var(--badge-idle-bg)",
            color: agentRunning ? "var(--accent)" : "var(--green)",
            flexShrink: 0,
          }}>
            {agentRunning ? (
              <>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  border: "1.5px solid var(--accent)",
                  borderTopColor: "transparent",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }} />
                PROCESSING
              </>
            ) : (
              <>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                IDLE
              </>
            )}
          </div>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex",
          borderBottom: `1px solid var(--border)`,
          padding: "0 20px",
          background: C.surface,
          flexShrink: 0,
        }}>
          {[["pipeline", "PIPELINE"], ["findings", "FINDINGS"], ["output", "OUTPUT"]].map(([id, label]) => (
            <div
              key={id}
              className="tab-item"
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: 9,
                letterSpacing: "1.8px",
                color: activeTab === id ? "var(--accent)" : C.textSecondary,
                borderBottom: `2px solid ${activeTab === id ? "var(--accent)" : "transparent"}`,
                marginBottom: -1,
                userSelect: "none",
              }}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </div>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {activeTab === "pipeline" && (
            <PipelineView
              pipeline={PIPELINE}
              agents={AGENTS}
              eng={eng}
              progress={progress}
              findings={findings}
              findingsStats={findingsStats}
              criticals={criticals}
              highs={highs}
              agentRunning={agentRunning}
              logs={logs}
              logRef={logRef}
              onRunAgent={handleRunAgent}
              onCompleteManual={completeManual}
              onShowOutput={handleShowOutput}
              onBurpInput={handleBurpInput}
            />
          )}
          {activeTab === "findings" && (
            <FindingsTable
              findings={findings}
              findingsStats={findingsStats}
              onSelectFinding={handleSelectFinding}
            />
          )}
          {activeTab === "output" && (
            <OutputPanel activeOutput={activeOutput} />
          )}
        </div>
      </div>

      <NewEngagementModal
        visible={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={(name, scopeInput) => {
          createEngagement(name, scopeInput);
          setShowNewModal(false);
        }}
      />
      <BurpInputModal
        visible={showBurpModal}
        onClose={() => { setShowBurpModal(false); setPendingBurpStageId(null); }}
        onSubmit={handleBurpSubmit}
      />
    </div>
  );
}
