# Evidências de Execução de Testes

## Testes Unitários / Integração

Requisito:
- ≥1 teste por tela validando comportamento real.

Evidências a anexar:
- Resultado do Vitest/Jest.
- Captura do terminal.
- Relatório HTML de cobertura.

Exemplo:

```text
PASS DashboardPage.test.tsx
PASS AlertsPage.test.tsx
PASS ReportsPage.test.tsx
PASS MonitoringPage.test.tsx
```

## Teste E2E

Fluxo crítico:

Dashboard Principal
→ Visualizar alerta
→ Selecionar alerta
→ Navegar para histórico
→ Validar detalhes

Exemplo:

```text
PASS dashboard-alert-history.e2e.spec.ts
```

## Evidência desta Release

Inserir:
- Print da execução.
- Log completo.
- Relatório gerado pela ferramenta de testes.
