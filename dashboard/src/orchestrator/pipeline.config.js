/**
 * Ordered pipeline stages for a pentest engagement.
 * - manual: true  → user marks it done via UI
 * - manual: false → an AI agent runs it automatically
 * - inputRequired → the stage needs external input before running (e.g. Burp paste)
 */
export const PIPELINE = [
  { id: "scope_def",  label: "Definição de Escopo",  agentKey: "scope",         manual: false, step: 1  },
  { id: "kickoff",    label: "Reunião Kick-off",      agentKey: null,            manual: true,  step: 2  },
  { id: "recon",      label: "Reconhecimento",        agentKey: "recon",         manual: false, step: 3  },
  { id: "validation", label: "Validação de Hosts",    agentKey: null,            manual: true,  step: 4  },
  { id: "test_cases", label: "Casos de Teste",        agentKey: "test_cases",    manual: false, step: 5  },
  { id: "scan",       label: "Burp Suite Scan",       agentKey: null,            manual: true,  step: 6, inputRequired: true },
  { id: "findings",   label: "Validação Findings",    agentKey: "findings",      manual: false, step: 7  },
  { id: "report",     label: "Geração de Relatório",  agentKey: "report",        manual: false, step: 8  },
  { id: "comm",       label: "Comunicação",           agentKey: "communication", manual: false, step: 9  },
  { id: "dojo",       label: "DefectDojo",            agentKey: "defectdojo",    manual: false, step: 10 },
];

/** Seed state for the demo engagement shown on first load */
export const SEED_ENG = {
  stages: Object.fromEntries(
    PIPELINE.map((s, i) => [s.id, i < 2 ? "done" : "idle"])
  ),
  stageOutputs: {
    scope_def: {
      scope_summary:   "CRM Portal v2 — aplicação web multi-tenant com API REST. Superfície inclui portal web, API REST pública e painel administrativo.",
      assets:          ["app.crm.internal", "api.crm.internal", "admin.crm.internal"],
      attack_surface:  ["Autenticação e autorização multi-tenant", "API REST endpoints", "Upload de arquivos", "Módulo de relatórios"],
      kickoff_questions: ["Existe separação de ambientes entre tenants?", "Qual o mecanismo de autenticação da API?"],
      estimated_effort: "5 dias úteis",
    },
  },
  context: {
    scope_input: "CRM Portal v2 — app.crm.internal, api.crm.internal, admin.crm.internal",
    scope: {
      scope_summary:   "CRM Portal v2 — aplicação web multi-tenant com API REST.",
      assets:          ["app.crm.internal", "api.crm.internal", "admin.crm.internal"],
      attack_surface:  ["Autenticação e autorização multi-tenant", "API REST endpoints", "Upload de arquivos"],
      kickoff_questions: ["Existe separação de ambientes entre tenants?"],
      estimated_effort: "5 dias úteis",
    },
    burp_raw:      null,
    recon:         null,
    test_cases:    null,
    findings:      null,
    report:        null,
    communication: null,
    defectdojo:    null,
  },
};
