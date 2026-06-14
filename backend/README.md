# Horta Monitorada — Backend (FastAPI)

API intermediária em Python/FastAPI que integra com a simulação da horta ([server-horta.onrender.com](https://server-horta.onrender.com/api)) e disponibiliza dados de telemetria, histórico e estatísticas calculadas para o frontend.

---

## Estrutura

```
src/
├── main.py              # Aplicação FastAPI e registro dos routers
├── client.py            # Cliente HTTP assíncrono para a API externa
├── requirements.txt     # Dependências Python
└── routers/
    ├── telemetria.py    # Dados de aquisição básica e avançada
    ├── historico.py     # Histórico completo e por ID
    ├── controle.py      # Controle de chuva, irrigação e reset
    └── estatisticas.py  # Métricas calculadas (não existem na API externa)
```

---

## Instalação e execução

```bash
# 1. Instalar dependências
cd src
pip install -r requirements.txt

# 2. Iniciar o servidor (desenvolvimento)
uvicorn main:app --reload --port 8000

# 3. Acessar a documentação interativa
# http://localhost:8000/docs      ← Swagger UI
# http://localhost:8000/redoc     ← ReDoc
```

---

## Endpoints

### 🌡️ Telemetria

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/telemetria/basica` | Dados simplificados de aquisição (temperatura, umidade, timestamp) |
| GET | `/telemetria/avancada` | Metadados completos: sensores, atuadores e condições ambientais |

### 📜 Histórico

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/historico/completo` | Todos os registros ordenados por tempo (ideal para gráficos) |
| GET | `/historico/minuto/{id}` | Registro específico pelo seu ID numérico |

### 🎛️ Controle

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/controle/chuva` | Injeta evento climático de chuva com `duracao` e `intensidade` |
| POST | `/controle/irrigacao` | Liga/desliga a bomba ou devolve ao modo automático |
| POST | `/controle/reset` | ⚠️ Reset total: apaga histórico e reinicia a simulação |

#### Payloads de controle

**Forçar chuva:**
```json
{ "duracao": 20, "intensidade": "forte" }
```
`intensidade` aceita: `fraca`, `moderada`, `forte`.

**Ligar irrigação manual:**
```json
{ "ligar": "true", "automatico": "false" }
```

**Devolver controle ao automático:**
```json
{ "automatico": "true" }
```

**Reset total:** POST vazio para `/controle/reset`.

### 📊 Estatísticas *(calculadas pela FastAPI)*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/estatisticas/resumo` | Resumo geral: última leitura, médias, saúde e contagem de alertas |
| GET | `/estatisticas/temperatura` | Min, max, média, desvio padrão e distribuição por faixas de temperatura |
| GET | `/estatisticas/umidade` | Min, max, média, desvio padrão e distribuição por faixas de umidade |
| GET | `/estatisticas/alertas` | Lista de registros que violam os limiares padrão |
| GET | `/estatisticas/tendencia` | Variação percentual entre janelas temporais recentes |

#### Parâmetros de query

- **`/estatisticas/temperatura?ultimos=N`** — analisa apenas os N registros mais recentes (0 = todos)
- **`/estatisticas/umidade?ultimos=N`** — idem para umidade
- **`/estatisticas/alertas?ultimos=N`** — analisa os N registros mais recentes (padrão: 50, máx: 500)
- **`/estatisticas/tendencia?janela=N`** — tamanho da janela de comparação (padrão: 10)

#### Limiares padrão usados nas estatísticas

| Variável | Mínimo | Máximo |
|----------|--------|--------|
| Temperatura | 16 °C | 32 °C |
| Umidade do solo | 35 % | 80 % |

---

## Exemplo de resposta — `/estatisticas/resumo`

```json
{
  "ultima_leitura": {
    "timestamp": "2026-06-12T19:45:00Z",
    "temperatura": 24.3,
    "umidade": 62
  },
  "temperatura": {
    "min": 18.1,
    "max": 31.7,
    "media": 24.5,
    "desvio_padrao": 3.2,
    "total": 148
  },
  "umidade": {
    "min": 38,
    "max": 77,
    "media": 61.4,
    "desvio_padrao": 8.7,
    "total": 148
  },
  "saude": "normal",
  "alertas_ativos": 3,
  "total_registros": 148
}
```

---

## Variáveis de ambiente (opcional)

A URL base da API externa está definida em `client.py`:

```python
BASE_URL = "https://server-horta.onrender.com/api"
```

Para apontar para outro ambiente (Azure, local), basta alterar essa constante ou expô-la via variável de ambiente conforme necessário.
