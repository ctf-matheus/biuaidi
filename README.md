# PENTEST/OS — Red Team Orchestrator

Dashboard React para automatizar o pipeline completo de um pentest de aplicação web, do escopo ao relatório, usando agentes de IA via API Anthropic (Claude).

---

## Sumário

- [Visão geral](#visão-geral)
- [Agentes de IA](#agentes-de-ia)
- [Pipeline](#pipeline)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Como usar](#como-usar)
- [Prompts](#prompts)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Roadmap — integrações fase 2](#roadmap--integrações-fase-2)

---

## Visão geral

O PENTEST/OS orquestra um Red Team guiando cada etapa do pentest por um agente de IA especializado. O analista inicia um *engagement*, passa o escopo, e o dashboard conduz a execução — gerando planos de recon, casos de teste OWASP, validando findings do Burp Suite, redigindo o relatório e preparando os payloads para o DefectDojo.

```
Escopo → Recon → Test Cases → Burp Scan → Findings → Relatório → Comunicação → DefectDojo
```

---

## Agentes de IA

| Agente | Ícone | Entrada | Saída |
|---|---|---|---|
| **Scope Agent** | ⬡ | Texto livre com hosts/IPs/apps | Assets, attack surface, kickoff questions, esforço estimado |
| **Recon Agent** | ⬢ | Output do Scope | Comandos OSINT/active recon, surface map, tecnologias esperadas |
| **Test Case Agent** | ⬣ | Scope + Recon | Casos de teste OWASP (WSTG), business logic tests, config do Burp scan |
| **Findings Agent** | ⬤ | Output bruto do Burp Suite | Findings validados com CWE, CVSS, PoC, remediação |
| **Report Agent** | ◈ | Scope + Findings | Executive summary, metodologia, roadmap de remediação |
| **Communication Agent** | ◎ | Findings + Report | Mensagem Slack, subject e body de e-mail para os responsáveis |
| **DefectDojo Agent** | ◉ | Findings validados | Payloads prontos para importação via API REST do DefectDojo |

Cada agente vive em `dashboard/src/agents/` e exporta `{ label, icon, color, buildPrompt(input) }`. Os prompts ficam em `prompts/*.md` e são a fonte de verdade — os agents importam os arquivos via `?raw` e preenchem os placeholders `{{varname}}` em tempo de execução.

---

## Pipeline

O pipeline tem 10 etapas. Etapas marcadas como **manual** são concluídas pelo analista via UI; as demais são executadas por um agente de IA automaticamente.

| Step | Etapa | Tipo |
|---|---|---|
| 1 | Definição de Escopo | Agent |
| 2 | Reunião Kick-off | Manual |
| 3 | Reconhecimento | Agent |
| 4 | Validação de Hosts | Manual |
| 5 | Casos de Teste | Agent |
| 6 | Burp Suite Scan | Manual (cola output) |
| 7 | Validação de Findings | Agent |
| 8 | Geração de Relatório | Agent |
| 9 | Comunicação | Agent |
| 10 | DefectDojo | Agent |

---

## Estrutura de pastas

```
pentest-orchestrator/
│
├── dashboard/                      # Frontend React (Vite + React 18)
│   ├── src/
│   │   ├── agents/                 # Um arquivo por agente + index.js
│   │   │   ├── scopeAgent.js
│   │   │   ├── reconAgent.js
│   │   │   ├── testCaseAgent.js
│   │   │   ├── findingsAgent.js
│   │   │   ├── reportAgent.js
│   │   │   ├── communicationAgent.js
│   │   │   ├── defectDojoAgent.js
│   │   │   └── index.js            # Exporta AGENTS map
│   │   ├── orchestrator/
│   │   │   ├── orchestrator.js     # dispatch(agentKey, ctx) puro
│   │   │   └── pipeline.config.js  # PIPELINE array + SEED_ENG
│   │   ├── components/
│   │   │   ├── PipelineView.jsx
│   │   │   ├── FindingsTable.jsx
│   │   │   ├── OutputPanel.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── modals/
│   │   │       ├── NewEngagementModal.jsx
│   │   │       └── BurpInputModal.jsx
│   │   ├── hooks/
│   │   │   └── useOrchestrator.js  # Todo o estado de negócio do pipeline
│   │   ├── lib/
│   │   │   ├── claudeApi.js        # Wrapper da chamada à API Anthropic
│   │   │   ├── fillTemplate.js     # Substitui {{placeholders}} nos prompts
│   │   │   └── tokens.js           # Design tokens (cores, tipografia)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example                # Modelo — copie para .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── integrations/                   # Conectores externos (fase 2)
│   ├── defectdojo/
│   │   ├── client.js               # Wrapper da API REST do DefectDojo
│   │   └── mapper.js               # Mapeia output do agent → payload da API
│   ├── slack/
│   │   └── client.js               # Webhook ou Slack API
│   └── google-drive/
│       └── reportExporter.js       # Preenche template do Drive
│
├── prompts/                        # Prompts versionados — fonte de verdade
│   ├── scope.md
│   ├── recon.md
│   ├── test-cases.md
│   ├── findings.md
│   ├── report.md
│   ├── communication.md
│   └── defectdojo.md
│
├── docs/
│   ├── architecture.md
│   └── agent-contracts.md
│
├── .gitignore
└── README.md
```

---

## Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9+ (ou pnpm/yarn)
- Chave de API da **Anthropic** — obtenha em [console.anthropic.com](https://console.anthropic.com)

---

## Instalação e execução

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd pentest-orchestrator

# 2. Instale as dependências do dashboard
cd dashboard
npm install

# 3. Configure a chave de API
cp .env.example .env
# Edite .env e preencha:
# VITE_ANTHROPIC_API_KEY=sk-ant-...

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O dashboard abre em `http://localhost:5173`.

### Build para produção

```bash
npm run build
npm run preview   # previsualiza o build local
```

> **Segurança:** nunca suba o arquivo `.env` para o repositório. O `.gitignore` já o bloqueia, mas confirme antes de qualquer `git push`.

---

## Como usar

### 1. Criar um novo engagement

Clique em **`+ novo engagement`** na barra lateral. Informe:
- **Nome** — ex.: `Portal de Clientes v3`
- **Escopo** — hosts, IPs, aplicações, contexto de negócio em texto livre

O Scope Agent será a primeira etapa disponível para execução.

### 2. Executar uma etapa de agente

Clique no card da etapa no **PIPELINE**. Se o status for `idle` ou `error`, o agente é disparado imediatamente. O card muda para `running` durante a chamada à API e para `done` ao concluir.

### 3. Etapas manuais

Etapas como **Reunião Kick-off** e **Validação de Hosts** não têm agente. Clique no card para marcá-las como concluídas após realizar a atividade externamente.

### 4. Inserir findings do Burp Suite

Na etapa **Burp Suite Scan** (step 6) ou ao tentar executar o **Findings Agent** sem dados:
1. Um modal abre solicitando o output do Burp
2. Cole o resultado do scan (XML, JSON ou texto livre)
3. Clique em **Confirmar e Executar Agent** — o Findings Agent valida e classifica automaticamente

### 5. Visualizar outputs

- Clique em qualquer etapa concluída para abrir o JSON de saída na aba **OUTPUT**
- Na aba **FINDINGS**, veja a distribuição por severidade e clique em qualquer linha para ver os detalhes do finding
- O **Activity Log** na aba PIPELINE registra todos os eventos com timestamp

### 6. Acompanhar o progresso

A barra de progresso no topo e os cards de métrica (Progresso %, Findings, Críticos, Altos) são atualizados em tempo real conforme as etapas avançam.

---

## Prompts

Os prompts ficam em `prompts/*.md` e usam placeholders no formato `{{varname}}`:

```
# prompts/scope.md
Você é um Scope Agent de Red Team...

Input de escopo recebido:
"""
{{input}}
"""
...
```

Para modificar o comportamento de um agente, edite o arquivo `.md` correspondente. O código dos agents em `dashboard/src/agents/` não precisa ser alterado — eles apenas importam o template e preenchem os placeholders em tempo de execução.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Sim | Chave de API da Anthropic. Nunca commite este valor. |

Copie `dashboard/.env.example` para `dashboard/.env` e preencha antes de iniciar.

---

## Roadmap — integrações fase 2

| Integração | Descrição |
|---|---|
| **DefectDojo** | `integrations/defectdojo/` — importa findings automaticamente via API REST |
| **Slack** | `integrations/slack/` — envia a mensagem gerada pelo Communication Agent diretamente ao canal |
| **Google Drive** | `integrations/google-drive/` — exporta o relatório preenchendo um template de Drive |
