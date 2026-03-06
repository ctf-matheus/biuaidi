import { useState } from "react";
import { C } from "../../lib/tokens";

const OVERLAY = {
  position: "fixed", inset: 0,
  background: "var(--surface-overlay)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 100,
  animation: "fadeIn 0.15s",
};

const FIELD_LABEL = {
  fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase",
  marginBottom: 6, color: "var(--text-secondary)",
};

const INPUT_STYLE = {
  width: "100%",
  background: C.surface,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "9px 11px",
  color: C.textPrimary,
  fontFamily: "inherit",
  fontSize: 11,
  transition: "border-color 0.15s",
};

export default function NewEngagementModal({ visible, onClose, onCreate }) {
  const [name,       setName]       = useState("");
  const [scopeInput, setScopeInput] = useState("");

  if (!visible) return null;

  function handleCreate() {
    if (!name.trim() || !scopeInput.trim()) return;
    onCreate(name.trim(), scopeInput.trim());
    setName("");
    setScopeInput("");
  }

  function handleClose() {
    onClose();
    setName("");
    setScopeInput("");
  }

  return (
    <div style={OVERLAY} onClick={handleClose}>
      <div
        style={{
          background: C.card,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
          width: 440,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.15s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Novo Engagement</div>
        <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 20 }}>
          Defina o nome e o escopo inicial para o pipeline.
        </div>

        <div style={FIELD_LABEL}>Nome do Engagement</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Ex: Portal de Clientes v3"
          autoFocus
          style={{ ...INPUT_STYLE, marginBottom: 14 }}
        />

        <div style={FIELD_LABEL}>Escopo (hosts, apps, IPs)</div>
        <textarea
          value={scopeInput}
          onChange={(e) => setScopeInput(e.target.value)}
          placeholder="Ex: app.cliente.com, api.cliente.com, 10.0.1.0/24 — aplicação CRM SaaS multi-tenant..."
          style={{ ...INPUT_STYLE, marginBottom: 22, height: 90, resize: "vertical" }}
        />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={handleClose} style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "8px 16px",
            color: C.textSecondary,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
          }}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleCreate} style={{
            background: "var(--accent)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "8px 18px",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
            fontWeight: 700,
          }}>
            Criar Engagement
          </button>
        </div>
      </div>
    </div>
  );
}
