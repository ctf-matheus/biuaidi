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

// SEC-03: limit input to 500 KB to prevent excessive token consumption
const MAX_BYTES = 500_000;

export default function BurpInputModal({ visible, onClose, onSubmit }) {
  const [text, setText] = useState("");

  if (!visible) return null;

  function handleSubmit() {
    if (!text.trim()) return;
    if (new Blob([text]).size > MAX_BYTES) {
      alert("O conteúdo colado excede 500 KB. Reduza o output do Burp antes de continuar.");
      return;
    }
    onSubmit(text.trim());
    setText("");
  }

  function handleClose() {
    onClose();
    setText("");
  }

  return (
    <div style={OVERLAY} onClick={handleClose}>
      <div
        style={{
          background: C.card,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
          width: 540,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.15s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Findings do Burp Suite</div>
        <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 18 }}>
          Cole os findings exportados do Burp Suite (XML, JSON, ou texto livre).
          O Findings Agent irá validar e classificar automaticamente.
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o output do Burp Suite Audit / Scanner..."
          autoFocus
          style={{
            width: "100%",
            background: "var(--code-bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "11px 13px",
            color: "var(--code-text)",
            fontFamily: "inherit",
            fontSize: 10,
            marginBottom: 18,
            height: 210,
            resize: "vertical",
            lineHeight: 1.7,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.5px" }}>
            {text.length > 0 ? `${(new Blob([text]).size / 1024).toFixed(1)} KB / 500 KB` : "máx. 500 KB"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
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
            <button className="btn-primary" onClick={handleSubmit} style={{
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
              Confirmar e Executar Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
