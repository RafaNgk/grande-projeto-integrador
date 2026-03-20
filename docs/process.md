# Processo de Desenvolvimento

## Ciclo de Trabalho

O time adotará um ciclo semanal. Cada semana inicia com definição de tarefas e termina com entrega incremental validada.

## Definition of Ready (DoR)

Uma tarefa só pode ser iniciada se atender aos seguintes critérios:

- Possui descrição clara e objetiva
- Possui critério de aceitação definido
- Está estimada (complexidade ou esforço)
- Não possui dependências bloqueantes

## Definition of Done (DoD)

Uma tarefa é considerada concluída quando:

- Código implementado conforme requisito
- Teste básico realizado (manual ou automatizado)
- Código revisado por pelo menos 1 integrante
- Sem erros conhecidos que impeçam funcionamento
- Integrado à branch principal

## Pull Requests e Code Review

- Todo código deve ser submetido via Pull Request
- Cada PR deve conter descrição do que foi implementado
- Mínimo de 1 revisor obrigatório antes do merge
- O autor do PR não pode aprovar seu próprio código
- Reviews devem ser realizados em até 24 horas

## Baseline do Processo

O time seguirá ciclos semanais com controle via PRs. A qualidade mínima será garantida pelo DoD e validação entre pares. O fluxo padrão será: desenvolvimento → PR → review → merge.
