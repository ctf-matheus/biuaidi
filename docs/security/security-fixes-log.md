# Security Fixes Log

Registro das correções de segurança aplicadas ao projeto BiUaiDi.
Referência: OWASP Top 10 2021 · OWASP LLM Top 10 · OWASP SPVS.

---

## 2026-03-06

### SEC-03 — Limite de tamanho no input do Burp Suite
**Severidade:** Média
**Arquivo:** `dashboard/src/components/modals/BurpInputModal.jsx`
**Referência:** OWASP A05:2021 – Security Misconfiguration

**Problema:** o textarea de input do Burp Suite não possuía limite de tamanho, permitindo que outputs muito grandes consumissem tokens excessivos da API e sobrecarregassem o estado em memória.

**Correção:** validação de tamanho (máximo 500 KB) antes do submit, com alerta ao usuário.

```js
const MAX_BYTES = 500_000;
if (new Blob([text]).size > MAX_BYTES) { alert(...); return; }
```

---

### SEC-04 — Informação sensível no stack de erro da API
**Severidade:** Média
**Arquivo:** `dashboard/src/lib/claudeApi.js`
**Referência:** OWASP A09:2021 – Security Logging and Monitoring Failures

**Problema:** o body completo da resposta de erro da Anthropic era propagado para a mensagem de erro exibida na UI (Activity Log), podendo expor detalhes internos da conta ou da requisição.

**Correção:** body de erro logado apenas em `console.error`; UI recebe apenas o código de status HTTP.

```js
console.error("Anthropic API error body:", body);
throw new Error(`Erro na API Anthropic (${res.status}). Verifique o console.`);
```

---

### SEC-05 — `fs.allow` do Vite mais permissivo que o necessário
**Severidade:** Média
**Arquivo:** `dashboard/vite.config.js`
**Referência:** OWASP SPVS – Develop (Secure Development Practices)

**Problema:** `fs.allow: ['..']` permitia que o dev server servisse qualquer arquivo do diretório pai, incluindo potenciais arquivos `.env` ou outros arquivos sensíveis.

**Correção:** restrito aos caminhos exatos necessários: `prompts/` e o próprio `dashboard/`.

```js
allow: [path.resolve(__dirname, "../prompts"), __dirname]
```

---

### SEC-06 — Vulnerabilidades de dependências (npm audit)
**Severidade:** Média → movido para backlog
**Arquivo:** `dashboard/package.json` / `dashboard/package-lock.json`
**Referência:** OWASP SPVS – Integrate (Dependency Management)

**Problema:** `esbuild ≤ 0.24.2` (dependência transitiva do Vite 5) permite que qualquer website envie requisições ao dev server e leia as respostas (GHSA-67mh-4wv8-2f99).

**Status:** `npm audit fix` não resolveu automaticamente — o fix exige upgrade do Vite 5 → 7 (breaking change). A vulnerabilidade afeta **exclusivamente o dev server**, não o build de produção. Movido para `security-backlog.md` com contexto completo.

---

### SEC-08 — Ausência de Content Security Policy (CSP)
**Severidade:** Baixa
**Arquivo:** `dashboard/index.html`
**Referência:** OWASP A03:2021 – Injection

**Problema:** sem CSP definida, scripts injetados poderiam fazer requisições arbitrárias, incluindo exfiltração da API key via `fetch`.

**Correção:** adicionada meta tag CSP restritiva, permitindo apenas as origens necessárias.

```
default-src 'self';
connect-src https://api.anthropic.com;
font-src https://fonts.gstatic.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
script-src 'self';
```

---

### SEC-09 — Output bruto do LLM armazenado sem truncamento
**Severidade:** Baixa
**Arquivo:** `dashboard/src/lib/claudeApi.js`
**Referência:** OWASP LLM02 – Insecure Output Handling

**Problema:** quando o modelo retornava uma resposta não-JSON, o texto bruto completo (incluindo potencial conteúdo do prompt refletido) era armazenado no estado React e renderizado na UI.

**Correção:** `_raw` truncado a 500 caracteres antes de ser armazenado.

```js
return { _raw: text.slice(0, 500), _error: "Failed to parse JSON response from model" };
```
