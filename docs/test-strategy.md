# Estratégia de Testes — Sistema de Monitoramento de Horta v0.1

## 1. Cabeçalho

| Campo             | Valor                                                                     |
|-------------------|---------------------------------------------------------------------------|
| Equipe            | Grande Projeto Integrador                                                 |
| Versão            | v0.1                                                                      |
| Data              | 2026-05-10                                                                |
| RFC de referência | [`docs/rfc/rfc-001-arquitetura-mvp.md`](./rfc/rfc-001-arquitetura-mvp.md) |
| Marco             | Marco 3 — Release 1                                                       |
| Stack planejada   | ESP32 · FastAPI · PostgreSQL · React · pytest                             |



## 2. Escopo desta estratégia

**Cobre nesta v0.1:**

- UCs críticos já definidos na A1.3: **UC-01**, **UC-02** e **UC-03**.
- Contrato inicial entre o ESP32 e a API para envio de leituras ambientais.
- Riscos técnicos relacionados à coleta, envio, persistência e visualização das medições.
- Evidência executável mínima usando a API de referência da aula, pois a equipe ainda não possui API própria implementada.

**Fica para a v0.2:**

- Testes contra a API própria da equipe, quando o backend FastAPI estiver implementado.
- Testes de frontend React com fluxo navegável real.
- Testes de integração com PostgreSQL real e migrations.
- Testes envolvendo firmware físico no ESP32 com sensores reais.
- Testes de carga para histórico com grande volume de medições.

**Pressupostos da v0.1:**

- O projeto ainda está em fase de documentação e planejamento arquitetural.
- A evidência executável mínima usa a API de referência da horta fornecida em aula.
- O objetivo desta versão é validar a estratégia e o contrato esperado, não testar uma implementação final da equipe.

---

## 3. Matriz risco → teste

| UC | Risco técnico concreto | Nível de teste | Justificativa |
|----|------------------------|----------------|---------------|
| UC-01 | Sensor retornar leitura nula ou fora da faixa física esperada, contaminando o histórico. | Unit | A validação de faixa é regra local e pode ser testada sem rede, banco ou frontend. |
| UC-02 | ESP32 enviar payload sem campo obrigatório, como `device_id`, `timestamp` ou valor da leitura. | Contract | O risco está na fronteira ESP32 → API; contract test valida formato, status code e campos obrigatórios. |
| UC-02 | Falha temporária de internet causar perda de leituras antes do envio para a nuvem. | Integration | O risco envolve fila local e reenvio; unit isolado não prova o comportamento entre armazenamento e transmissão. |
| UC-03 | Dashboard exibir dados incompletos por mudança no formato JSON retornado pela API. | Contract | O risco está no contrato API → frontend; contract test detecta quebra de schema antes da interface consumir dados inválidos. |
| UC-03 | Consulta histórica ficar lenta com alto volume de medições por ausência de índice em `timestamp` e `device_id`. | Integration | O risco depende do banco e da consulta real; teste unitário não mede comportamento de persistência. |
| UC-03 | Alerta ser gerado com base em limite incorreto de temperatura ou umidade. | Unit | A regra de comparação com limites pode ser testada como lógica pura, sem depender da interface. |

---

## 4. Níveis de teste aplicados ao projeto

**Unit.**  
Os testes unitários serão usados para regras locais e puras do sistema, sem dependência de rede, banco de dados ou hardware físico. No projeto da horta, exemplos são validação de faixas de temperatura, umidade do solo, umidade do ar e cálculo de alertas com limites fixos. Esse nível é barato, rápido e adequado para regras de domínio simples.

**Integration.**  
Os testes de integração serão usados quando o risco depender da comunicação entre componentes, como API e PostgreSQL, fila local e envio posterior, ou persistência de medições. Esse nível é necessário porque parte dos riscos da arquitetura está nas fronteiras entre componentes, não apenas em funções isoladas.

**System.**  
Os testes de sistema ficam planejados para a v0.2, quando houver backend, frontend e banco integrados. Na v0.1, o projeto ainda não possui implementação própria suficiente para executar um fluxo completo de ponta a ponta. Futuramente, esse nível deve validar o fluxo: ESP32 envia leitura, API persiste, dashboard consulta e alerta é exibido.

**Acceptance.**  
Os testes de aceitação não serão aplicados nesta v0.1 porque a interface final ainda não está implementada. Eles entram na v0.2, quando o dashboard React estiver navegável. O foco será validar se o usuário consegue visualizar estado atual, histórico e alertas conforme os UCs definidos.

**Contract.**  
Os testes de contrato são o principal foco executável da v0.1. Eles validam se a API aceita e responde payloads no formato esperado, protegendo a integração entre ESP32, backend e frontend. Como a equipe ainda não tem API própria, a evidência mínima será executada contra a API de referência fornecida em aula.

---

## 5. Técnica moderna por contexto — ADR-TEST-001: Contract Testing

**Contexto.**  
A arquitetura do projeto depende de uma fronteira crítica entre o ESP32 e a API em nuvem. O dispositivo embarcado enviará medições em JSON, e o backend precisará validar campos obrigatórios antes de persistir os dados. Se o formato do payload mudar sem controle, o firmware pode continuar enviando dados que a API rejeita ou interpreta incorretamente.

**Decisão.**  
A equipe adotará contract testing leve para validar o contrato dos endpoints de leitura. Na v0.1, o teste será executado contra a API de referência da aula. Quando a API própria for implementada, o mesmo conceito será migrado para os endpoints reais do projeto. O teste deve verificar status code, schema JSON e presença de campos obrigatórios.

**Alternativa rejeitada — apenas teste manual.**  
Testar manualmente com Postman ou navegador ajuda na depuração, mas não cria evidência repetível no CI. Além disso, um teste manual pode ser esquecido em novos PRs.

**Alternativa rejeitada — somente testes unitários.**  
Testes unitários são úteis para regras puras, mas não validam o contrato real entre cliente e API. O risco principal neste ponto está na fronteira de comunicação, então o teste precisa exercitar o endpoint.

**Consequências positivas.**

- Detecta quebra de contrato antes do merge.
- Cria documentação executável do formato esperado da API.
- Ajuda a alinhar firmware, backend e frontend.

**Consequências negativas.**

- Exige manutenção sempre que o schema do endpoint mudar.
- Não garante que a regra de negócio esteja correta; apenas valida o formato e contrato.
- Pode precisar ser reescrito quando a API própria substituir a API de referência.

**Quando não usar.**  
Essa decisão deixa de ser suficiente se o sistema passar a usar MQTT, WebSocket ou outro protocolo diferente de REST JSON. Nesse caso, a estratégia de contrato precisará ser revista para validar mensagens no novo protocolo.

---

## 6. Estratégia de regressão

Quando alguém abrir um Pull Request para a `main`, a suíte mínima de documentação e testes deve rodar automaticamente no GitHub Actions. Para a v0.1, os testes de contrato devem bloquear o merge caso falhem, pois uma quebra no contrato entre ESP32 e API compromete a coleta de dados.

Os testes unitários e de contrato devem ser obrigatórios quando existirem. Testes de sistema, testes de carga e testes com hardware físico ficam fora do bloqueio obrigatório nesta versão, pois dependem de implementação e ambiente ainda não disponíveis.

A regra de regressão adotada é: todo bug técnico descoberto durante desenvolvimento deve virar um teste permanente. Se uma mudança quebrar algo que já funcionava, a correção deve incluir um teste que reproduza o problema antes de corrigir o comportamento.

---


## 7. Evidência executável

**Teste implementado na v0.1:**

| Arquivo | Nível | UC coberto | Objetivo |
|---------|-------|------------|----------|
| [`tests/contract/test_api_leituras_contract.py`](../tests/contract/test_api_leituras_contract.py) | Contract | UC-02 | Validar contrato mínimo do endpoint `POST /leituras`. |

**Schema validado:**

- [`tests/contract/schemas/leitura_response.schema.json`](../tests/contract/schemas/leitura_response.schema.json)

**API mínima criada:**

- [`app/main.py`](../app/main.py)

**Evidência de execução:**

- [`docs/test-strategy/evidencias/pytest-run-08-05-2026.txt`](./test-strategy/evidencias/pytest-run-08-05-2026.txt)

A equipe criou uma API própria mínima em FastAPI para a v0.1. O endpoint
`POST /leituras` recebe uma medição enviada pelo ESP32 e retorna uma resposta
JSON validada por contract test.

---

## 8. Próximos passos para v0.2

1. Migrar o contract test da API de referência para a API própria da equipe.
2. Criar testes unitários para validação de faixas de sensores e geração de alertas.
3. Criar testes de integração entre FastAPI e PostgreSQL.
4. Adicionar teste de sistema para o fluxo completo de leitura até dashboard.
5. Incluir testes com ESP32 físico quando o firmware estiver funcional.