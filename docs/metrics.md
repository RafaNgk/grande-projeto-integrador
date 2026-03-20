# Métricas de Projeto

## 1. Lead Time (Fluxo)

- **Definição:** Tempo entre o início do desenvolvimento de uma tarefa e o merge do PR.
- **Objetivo:** ≤ 3 dias
- **Coleta:** Diferença entre timestamp do primeiro commit e do merge no repositório Git.

---

## 2. Tempo de Review (Fluxo)

- **Definição:** Tempo entre a abertura do PR e sua aprovação.
- **Objetivo:** ≤ 24 horas
- **Coleta:** Diferença entre timestamp de criação do PR e aprovação registrada.

---

## 3. Taxa de Falha Pós-Merge (Qualidade)

- **Definição:** Percentual de PRs que geram correções (hotfix ou bug) após merge.
- **Objetivo:** ≤ 10%
- **Coleta:** Número de PRs corretivos dividido pelo total de PRs no período.

---

## 4. Taxa de Rejeição de PR (Qualidade)

- **Definição:** Percentual de PRs que necessitam alterações após revisão.
- **Objetivo:** ≤ 30%
- **Coleta:** Número de PRs com solicitações de mudança dividido pelo total de PRs.

---

## Baseline de Métricas

As métricas serão coletadas a partir do repositório Git (histórico de commits e PRs). O acompanhamento será semanal, com análise simples para verificar aderência aos objetivos definidos.
