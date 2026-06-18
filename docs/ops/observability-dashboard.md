# Observability Dashboard

## Objetivo

Descrever a observabilidade aplicada ao dashboard, incluindo logs estruturados, métricas coletadas, procedimento de investigação e evidências de funcionamento.

---

## Logs Estruturados

O frontend deve registrar eventos utilizando formato JSON estruturado para facilitar análise e correlação.

### Campos mínimos

```json
{
  "timestamp": "2026-06-14T14:30:22.150Z",
  "level": "error",
  "requestId": "req-a8f32d1",
  "event": "fetch_sensor_data_failed",
  "message": "Failed to load sensor readings",
  "url": "/api/sensors"
}
```

### Correlação

Sempre que a API retornar um identificador de requisição (Request-Id, Trace-Id ou equivalente), o valor deve ser propagado para os logs do frontend.

### Evento `fetch_sensor_data_failed`

A função `getAggregates` registra este evento quando um canteiro não pode participar das médias agregadas por falha de dados do sensor. O caso parcial ocorre quando a última leitura tem status `partial` ou algum campo atual usado no agregado está `null`.

Campos de rastreabilidade aplicáveis ao caminho parcial:

```json
{
  "event": "fetch_sensor_data_failed",
  "source": "getAggregates",
  "reason": "partial_sensor_data",
  "requestId": "req-...",
  "canteiroId": "parcial-temp-ok",
  "sensorId": "sensor-parcial-temp-ok",
  "latestSensorStatus": "partial",
  "missingFields": ["currentHumidity"],
  "includedInAggregate": false
}
```

---

## Métricas Instrumentadas

### 1. Contagem de erros de requisições

Métrica:

```text
frontend_fetch_errors_total
```

Descrição:
- Incrementada sempre que uma chamada para a API falha.

Objetivo:
- Detectar indisponibilidade da API ou problemas de rede.

### 2. Tempo de carregamento da página principal

Métrica:

```text
dashboard_home_render_duration_ms
```

Descrição:
- Mede o tempo entre o carregamento inicial da página e a renderização completa dos componentes principais.

Objetivo:
- Detectar degradação de performance.

---

## Trace Observável

Evento rastreado:

```text
Dashboard Load
```

Fluxo:
1. Usuário acessa dashboard.
2. Dashboard solicita dados dos sensores.
3. Dashboard solicita eventos de irrigação.
4. Dashboard renderiza os componentes.

Tempo total do fluxo deve ser registrado para análise.

---

## Runbook

### Cenário

Dashboard apresenta erro persistente em produção.

### Passo 1 — Verificar console e logs

Confirmar ocorrência dos eventos:

```text
fetch_sensor_data_failed
fetch_irrigation_events_failed
```

Verificar Request Id associado.

### Passo 2 — Verificar API

Utilizar o Request Id para localizar a requisição correspondente nos logs do backend.

Confirmar:
- Código HTTP retornado.
- Tempo de resposta.
- Exceções registradas.

### Passo 3 — Verificar conectividade

Validar:
- Disponibilidade da API.
- DNS.
- Certificado TLS.
- Firewall ou proxy.

### Passo 4 — Verificar dados

Confirmar se:
- Banco de dados está acessível.
- Sensores estão enviando dados.
- Eventos recentes estão sendo persistidos.

### Passo 5 — Escalonamento

Caso o problema persista:
1. Acionar responsável pela API.
2. Acionar responsável pela infraestrutura.
3. Abrir incidente contendo Request Id e horário da ocorrência.

---

## Evidência de Funcionamento

### Exemplo de log local

```text
[INFO] {
  "timestamp":"2026-06-14T15:22:11.120Z",
  "event":"dashboard_loaded",
  "requestId":"req-7f3a21",
  "renderDurationMs":482
}

[ERROR] {
  "timestamp":"2026-06-14T15:23:45.910Z",
  "event":"fetch_sensor_data_failed",
  "requestId":"req-8c91ab",
  "status":500
}

[ERROR] {
  "timestamp":"2026-06-18T21:51:29.000Z",
  "event":"fetch_sensor_data_failed",
  "requestId":"req-...",
  "source":"getAggregates",
  "canteiroId":"parcial-temp-ok",
  "canteiroName":"Parcial temp ok",
  "sensorId":"sensor-parcial-temp-ok",
  "canteiroStatus":"healthy",
  "latestSensorStatus":"partial",
  "reason":"partial_sensor_data",
  "missingFields":["currentHumidity"],
  "includedInAggregate":false
}
```

### Exemplo de métrica coletada

```text
frontend_fetch_errors_total=3

dashboard_home_render_duration_ms=482
```

### Evidência desta release

Anexar nesta seção:
- Print do console exibindo logs estruturados.
- Print da métrica sendo atualizada em ambiente local.
- Ou captura do terminal mostrando a instrumentação em execução.

Observação: a evidência deve ser atualizada a cada release do projeto.

### Evidência automatizada da correção `getAggregates`

Correção rastreada:
- `getAggregates` exclui canteiros parciais das três médias agregadas.
- O mesmo conjunto de canteiros íntegros alimenta `avgTemperature`, `avgHumidity` e `avgSoilMoisture`.
- O caminho parcial emite log estruturado com `reason: "partial_sensor_data"` e `includedInAggregate: false`.
- O caminho sem regressão, com todos os canteiros saudáveis, não emite `console.error`.

Teste executado:

```bash
npm test -- lib/api.test.ts
```

Resultado local:

```text
lib/api.test.ts (2 tests)
✓ getAggregates > exclui canteiro parcial das tres medias e emite log estruturado
✓ getAggregates > mantem medias sem regressao quando todos os canteiros estao saudaveis
```
