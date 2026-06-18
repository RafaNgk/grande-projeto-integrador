# Diff da Matriz Risco → Teste

## Atualização Release 2

| Risco | Teste Anterior | Teste Atual |
|---------|---------|---------|
| Falha ao carregar sensores | Cobertura parcial | Teste de integração validando tratamento de erro |
| Alertas incorretos | Não coberto | Teste unitário do painel de alertas |
| Navegação quebrada | Não coberto | Teste E2E completo |
| Histórico inconsistente | Cobertura parcial | Teste de integração do fluxo de histórico |
| Médias agregadas incoerentes com dado parcial de sensor | Não coberto | Teste unitário de `getAggregates` com DB sintético contendo 1 canteiro parcial (`temp` ok, `umidade` null), validação das três médias com população coerente e captura do log estruturado `partial_sensor_data` |
| Regressão no caminho saudável de agregação | Não coberto | Teste unitário de `getAggregates` com todos os canteiros saudáveis, médias esperadas e ausência de `console.error` |

## Observação

Substituir pelos riscos reais definidos na atividade A1.6.
Manter este documento versionado para evidenciar a evolução da rastreabilidade.

## Evidência de Execução

```text
npm test -- lib/api.test.ts

✓ lib/api.test.ts (2 tests)
  ✓ getAggregates > exclui canteiro parcial das tres medias e emite log estruturado
  ✓ getAggregates > mantem medias sem regressao quando todos os canteiros estao saudaveis
```
