import { useState, useCallback, useRef, useEffect } from "react";
import { PIPELINE, SEED_ENG } from "../orchestrator/pipeline.config";
import { dispatch, ctxKeyForAgent } from "../orchestrator/orchestrator";
import { AGENTS } from "../agents";

const INITIAL_ENGAGEMENTS = [
  { id: "eng-001", name: "CRM Portal v2", status: "active",    created: "2026-03-01" },
  { id: "eng-002", name: "API Gateway",   status: "completed", created: "2026-02-15" },
];

const INITIAL_LOGS = [
  { ts: "10:23:41", level: "info",    msg: "Orchestrator iniciado — eng-001" },
  { ts: "10:23:44", level: "success", msg: "Scope Agent concluído — 3 assets, 4 vetores" },
  { ts: "10:25:00", level: "info",    msg: "Kick-off concluído manualmente" },
  { ts: "10:25:05", level: "info",    msg: "Aguardando execução do Recon Agent" },
];

/**
 * Central state hook for the pentest pipeline.
 * Exposes engagements, pipeline state, and all mutating actions.
 */
export function useOrchestrator() {
  const [engagements,   setEngagements]   = useState(INITIAL_ENGAGEMENTS);
  const [selected,      setSelected]      = useState("eng-001");
  const [agentRunning,  setAgentRunning]  = useState(false);
  const [logs,          setLogs]          = useState(INITIAL_LOGS);
  const [pipelineState, setPipelineState] = useState({ "eng-001": SEED_ENG });

  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const eng        = pipelineState[selected];
  const currentEng = engagements.find((e) => e.id === selected);

  const completedStages = eng ? Object.values(eng.stages).filter((s) => s === "done").length : 0;
  const progress        = Math.round((completedStages / PIPELINE.length) * 100);

  const findings      = eng?.context?.findings?.validated_findings || [];
  const findingsStats = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
  const criticals = findingsStats.Critical || 0;
  const highs     = findingsStats.High     || 0;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addLog = useCallback((level, msg) => {
    const ts = new Date().toTimeString().slice(0, 8);
    setLogs((prev) => [...prev, { ts, level, msg }]);
  }, []);

  const setStageStatus = useCallback((stageId, status) => {
    setPipelineState((prev) => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        stages: { ...prev[selected].stages, [stageId]: status },
      },
    }));
  }, [selected]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Runs the AI agent for the given stage.
   * Caller is responsible for ensuring Burp findings are set before calling
   * the findings stage.
   *
   * @param {string} stageId
   * @returns {Promise<object|null>} The agent output, or null on guard failure
   */
  const runAgentForStage = useCallback(async (stageId) => {
    const stage = PIPELINE.find((s) => s.id === stageId);
    if (!stage?.agentKey || agentRunning) return null;

    setAgentRunning(true);
    setStageStatus(stageId, "running");
    addLog("info", `▶ ${AGENTS[stage.agentKey].label} iniciado`);

    try {
      const ctx    = { ...pipelineState[selected].context, engagement_name: currentEng?.name };
      const output = await dispatch(stage.agentKey, ctx);
      const ctxKey = ctxKeyForAgent(stage.agentKey);

      setPipelineState((prev) => ({
        ...prev,
        [selected]: {
          ...prev[selected],
          stages:       { ...prev[selected].stages,       [stageId]: "done" },
          stageOutputs: { ...prev[selected].stageOutputs, [stageId]: output },
          context:      { ...prev[selected].context,      [ctxKey]:  output },
        },
      }));

      addLog("success", `✓ ${AGENTS[stage.agentKey].label} concluído`);
      return output;
    } catch (err) {
      setStageStatus(stageId, "error");
      addLog("error", `✗ ${AGENTS[stage.agentKey].label}: ${err.message}`);
      return null;
    } finally {
      setAgentRunning(false);
    }
  }, [selected, agentRunning, pipelineState, currentEng, addLog, setStageStatus]);

  /** Marks a manual stage as done. */
  const completeManual = useCallback((stageId) => {
    setStageStatus(stageId, "done");
    const stage = PIPELINE.find((s) => s.id === stageId);
    addLog("success", `✓ Etapa manual concluída: ${stage.label}`);
  }, [setStageStatus, addLog]);

  /**
   * Saves Burp Suite findings to the engagement context and marks the scan
   * stage as done. Optionally triggers an agent stage right after.
   *
   * @param {string} text          - Raw Burp output pasted by the user
   * @param {string|null} runAfter - stageId to run immediately after (or null)
   */
  const setBurpFindings = useCallback((text, runAfter = null) => {
    setPipelineState((prev) => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        context: { ...prev[selected].context, burp_raw: text },
        stages:  { ...prev[selected].stages,  scan: "done" },
      },
    }));
    addLog("success", "✓ Findings do Burp Suite registrados");

    if (runAfter) {
      // Defer so state settles before the agent reads it
      setTimeout(() => runAgentForStage(runAfter), 300);
    }
  }, [selected, addLog, runAgentForStage]);

  /**
   * Creates a new engagement and switches to it.
   *
   * @param {string} name       - Engagement name
   * @param {string} scopeInput - Raw scope text
   */
  /** Renames an existing engagement by id. */
  const renameEngagement = useCallback((id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setEngagements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: trimmed } : e))
    );
    addLog("info", `Engagement renomeado para: ${trimmed}`);
  }, [addLog]);

  const createEngagement = useCallback((name, scopeInput) => {
    const id = `eng-${Date.now()}`;
    setEngagements((prev) => [...prev, {
      id, name, status: "active",
      created: new Date().toISOString().split("T")[0],
    }]);
    setPipelineState((prev) => ({
      ...prev,
      [id]: {
        stages:       Object.fromEntries(PIPELINE.map((s) => [s.id, "idle"])),
        stageOutputs: {},
        context:      { scope_input: scopeInput, scope: null, recon: null, test_cases: null, findings: null, burp_raw: null },
      },
    }));
    setSelected(id);
    addLog("info", `Novo engagement criado: ${name}`);
  }, [addLog]);

  return {
    // State
    engagements,
    selected,
    setSelected,
    pipelineState,
    agentRunning,
    logs,
    logRef,
    // Derived
    eng,
    currentEng,
    progress,
    findings,
    findingsStats,
    criticals,
    highs,
    // Actions
    runAgentForStage,
    completeManual,
    setBurpFindings,
    createEngagement,
    renameEngagement,
  };
}
