import { C, SEV_COLOR } from "../lib/tokens";

export default function FindingsTable({ findings, findingsStats, onSelectFinding }) {
  return (
    <div style={{ animation: "fadeIn 0.2s" }}>
      {/* Severity distribution */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["Critical", "High", "Medium", "Low", "Info"].map((sev) => (
          <div
            key={sev}
            style={{
              flex: 1,
              background: C.card,
              border: `1px solid ${SEV_COLOR[sev]}33`,
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 9, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              {sev}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: SEV_COLOR[sev] }}>
              {findingsStats[sev] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
        <div style={{
          padding: "8px 14px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "2px", textTransform: "uppercase" }}>
            Validated Findings
          </span>
          <span style={{ fontSize: 10, color: C.textMuted }}>{findings.length} total</span>
        </div>

        {findings.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 11 }}>
            Execute o Findings Agent para visualizar os resultados validados
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Sev", "Título", "CWE", "CVSS", "Confirmado"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: 9,
                        color: C.textSecondary,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${C.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {findings.map((f, i) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => onSelectFinding(f)}>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                      <span style={{ color: SEV_COLOR[f.severity] || C.textSecondary, fontWeight: 600 }}>
                        {f.severity}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>{f.title}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, color: C.textSecondary, fontSize: 10 }}>{f.cwe}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, color: C.textSecondary, fontSize: 10 }}>{f.cvss}</td>
                    <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}`, color: f.is_confirmed ? C.green : C.yellow }}>
                      {f.is_confirmed ? "✓" : "?"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
