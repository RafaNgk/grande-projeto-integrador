# Release 2 / Release Candidate

## Identificação

**Versão:** v0.2.0-dashboard-rc

**Tipo:** Release Candidate

**Data:** 2026-06-14

---

# Release Notes

## Funcionalidades entregues desde a Release 1

### Dashboard

- Implementação das 3 telas restantes previstas para o dashboard.
- Refinamento da navegação entre páginas.
- Integração dos componentes visuais com os dados do sistema.

### Alertas

- Exibição de alertas relacionados aos sensores.
- Destaque visual para situações fora dos limites configurados.
- Consolidação dos alertas em área centralizada do dashboard.

### Relatórios

- Tela de relatórios.
- Visualização consolidada dos dados coletados.
- Preparação para exportação e análise histórica.

### Segurança

- Criação do documento:
  - docs/dashboard/threat-model.md

Inclui:
- Ativos protegidos.
- Ameaças identificadas.
- Mitigações.
- Evidências de SCA.

### Observabilidade

- Criação do documento:
  - docs/ops/observability-dashboard.md

Inclui:
- Logs estruturados.
- Correlação por Request Id.
- Métricas.
- Runbook operacional.
- Evidências de observabilidade.

---

# Breaking Changes

Nenhuma breaking change identificada nesta release.

## Migração

Nenhuma ação de migração necessária.

---

# Issues Fechadas

- DASH-01 — Tela principal do dashboard.
- DASH-02 — Tela de monitoramento.
- DASH-03 — Tela de alertas.
- DASH-04 — Tela de relatórios.
- DASH-05 — Componentes reutilizáveis.
- DASH-06 — Threat Model.
- DASH-07 — Observabilidade.
- DASH-08 — Ajustes de layout e responsividade.

---

# Pull Requests Mergeados

- PR #11 — Dashboard inicial.
- PR #12 — Implementação de alertas.
- PR #13 — Implementação de relatórios.
- PR #14 — Threat Model.
- PR #15 — Observabilidade.
- PR #16 — Correções e estabilização da Release Candidate.

---

# Rastreabilidade End-to-End

| Tela | Caso de Uso (UC) | Componente | Teste | Entrega nesta Release |
|--------|--------|--------|--------|--------|
| Dashboard Principal | UC-01 Visualizar indicadores | DashboardPage | DashboardPage.test | Dashboard Principal |
| Monitoramento | UC-02 Consultar sensores | SensorCard / SensorList | Sensors.test | Tela de Monitoramento |
| Alertas | UC-03 Visualizar alertas | AlertPanel | Alerts.test | Sistema de Alertas |
| Relatórios | UC-04 Consultar relatórios | ReportPage | Reports.test | Tela de Relatórios |
| Irrigação | UC-05 Consultar eventos de irrigação | IrrigationHistory | Irrigation.test | Histórico de Irrigação |

---

# Artefatos Relacionados

- docs/dashboard/threat-model.md
- docs/ops/observability-dashboard.md

---

# Critérios para Aprovação da RC

- Todas as telas implementadas.
- Build executando sem erros.
- Testes executados com sucesso.
- Threat model documentado.
- Observabilidade documentada.
- Release pronta para homologação.
