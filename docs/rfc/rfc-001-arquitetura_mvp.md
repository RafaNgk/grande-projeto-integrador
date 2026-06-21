# RFC-001: Arquitetura do MVP — Grande Projeto Integrador

## Cabeçalho

| Campo     | Valor                                                                              |
|-----------|------------------------------------------------------------------------------------|
| Status    | Aceito                                                                             |
| Versão    | 0.1                                                                                |
| Autores   | Lucas Kather Dziaduk; Pedro Reis Simões Valença; Rafael Carvalho; Rafael Lindquist |
| Data      | 2026-04-26                                                                         |
| Marco     | Marco 2 — Projetos conceituais aprovados                                           |
| Substitui | —                                                                                  |

---

## 1. Contexto e Motivação

O Grande Projeto Integrador propõe um sistema de monitoramento de horta voltado ao acompanhamento remoto de condições ambientais relevantes para cultivo. O sistema coleta leituras de umidade do solo e temperatura em um dispositivo embarcado, registra falhas de leitura quando necessário, envia os dados para uma aplicação central e disponibiliza uma visão web para consulta do estado atual, histórico e alertas. O cenário de uso é acadêmico, com demonstração em ambiente controlado, baixa complexidade operacional e necessidade de funcionamento tolerante a falhas temporárias de conectividade. O objetivo do MVP é entregar uma arquitetura simples, auditável e implementável pela equipe na Release 1, sem introduzir tecnologias desnecessárias para o escopo atual.

---

## 2. Escopo deste Marco

**Dentro do escopo:**

- Coleta periódica de leituras de umidade do solo e temperatura pelo dispositivo embarcado.
- Armazenamento local temporário das leituras no dispositivo quando a conexão falhar.
- Envio das leituras para uma API central via requisições HTTP/HTTPS.
- Validação de payloads recebidos pela API antes da persistência.
- Persistência das medições em banco de dados relacional.
- Visualização web dos dados mais recentes da horta.
- Consulta do histórico de medições ordenado por data e hora.
- Geração e exibição de alertas quando valores ultrapassarem limites definidos para o MVP.
- Dashboard responsivo para uso em navegador.

**Fora do escopo (próximas RFCs):**

- Múltiplos dispositivos por zona da horta.
- Comunicação em tempo real via WebSocket ou MQTT.
- Automação de atuadores físicos, como irrigação automática.
- Inteligência artificial, análise preditiva ou recomendação automática de ações.
- Cadastro dinâmico de usuários com níveis de permissão.
- Configuração avançada de limites por perfil de usuário.
- Notificações automáticas por e-mail, push ou WhatsApp.

---

## 3. Requisitos Atendidos

- SRS (A1.2): [`docs/requirements/srs.md`](../requirements/srs.md)
- Casos de Uso (A1.3): [`docs/requirements/usecases.md`](../requirements/usecases.md)

**Requisitos funcionais e não funcionais diretamente suportados:**

- **RF-01** — Coletar dados de sensores em intervalos configuráveis.
- **RF-02** — Enviar dados coletados para a API via HTTP/HTTPS.
- **RF-03** — Receber, validar e armazenar dados enviados pelos dispositivos.
- **RF-04** — Visualizar os dados mais recentes coletados.
- **RF-05** — Visualizar histórico de medições.
- **RF-06** — Gerar alertas quando valores ultrapassarem limites configurados.
- **RF-07** — Rejeitar dados fora do formato esperado.
- **RNF-03** — Armazenar localmente até 100 leituras em caso de falha de conexão.
- **RNF-05** — Responder 95% das requisições em até 500 ms sob carga de até 100 requisições/minuto.
- **RNF-09** — Utilizar TLS 1.2 ou superior na comunicação com a API.

**UCs críticos suportados por esta RFC:**

- **UC-01** — Coletar Dados dos Sensores
- **UC-02** — Enviar Dados para a API na Nuvem
- **UC-03** — Visualizar Dados e Alertas da Horta

---

| Camada                                    | Tecnologia                               |          Versão pinada | Justificativa                                                                                                   |
| ----------------------------------------- | ---------------------------------------- | ---------------------: | --------------------------------------------------------------------------------------------------------------- |
| **Microcontrolador**                      | ESP32-WROOM-32                           |                 Rev. 1 | Possui Wi-Fi nativo, baixo custo e capacidade suficiente para leitura de sensores e envio de dados via HTTP.      |

| **Firmware / Toolchain**                  | Arduino Core for ESP32                   |                 2.0.17 | Reduz a curva de aprendizado e facilita a integração entre sensores, Wi-Fi e lógica embarcada.                      |

| **Linguagem do firmware**                 | C++ para Arduino                         |                  C++11 | É o padrão prático do ecossistema Arduino utilizado no desenvolvimento para ESP32.                           |

| **Sensor de umidade do solo**             | Sensor capacitivo de umidade do solo     |                   v1.2 | Evita a corrosão comum em sensores resistivos e atende ao monitoramento básico do MVP.                           |

| **Sensor de temperatura e umidade do ar** | DHT22 / AM2302                           |                    1.0 | Mede temperatura e umidade do ar com integração simples ao ESP32.                                                 |

| **Comunicação dispositivo → API**         | HTTP/1.1 sobre HTTPS / REST JSON         |     HTTP/1.1 + TLS 1.2 | Atende ao envio periódico de medições com baixa complexidade técnica e fácil depuração.                             |

| **Backend / API**                         | Python                                   |                 3.12.3 | Oferece boa produtividade para a equipe e compatibilidade direta com o FastAPI.                                  |

| **Framework backend**                     | FastAPI                                  |               0.115.12 | Permite validação tipada, documentação OpenAPI automática e criação simples de endpoints REST.                   |

| **Servidor ASGI**                         | Uvicorn                                  |                 0.34.0 | Servidor leve, compatível com FastAPI e adequado para execução da API no MVP.                                    |

| **Validação de dados**                    | Pydantic                                 |                 2.10.6 | Garante validação explícita e estruturada dos payloads recebidos do ESP32.                                         |

| **ORM / acesso ao banco**                 | SQLAlchemy                               |                 2.0.40 | Facilita a modelagem 

| **Migrações de banco**                    | Alembic                                  |                 1.15.2 | Controla a evolução do schema do banco com histórico versionado.                                              |

| **Banco de dados**                        | PostgreSQL                               |                   16.3 | Oferece consistência, consultas por período e boa evolução para armazenamento histórico de medições.         |

| **Frontend**                              | React                                    |                 18.3.1 | Facilita a criação de componentes reutilizáveis para dashboard, histórico, alertas e configurações.          |

| **Build frontend**                        | Vite                                     |                 5.4.19 | Mantém o ambiente de desenvolvimento e o processo de build simples para uma SPA pequena.                    |

| **Linguagem frontend**                    | TypeScript                               |                  5.4.5 | Reduz erros nos contratos de dados entre API e interface.                                                           |

| **Estilo visual**                         | Tailwind CSS                             |                 3.4.17 | Acelera a criação de layouts responsivos com baixo esforço de CSS manual.                                           |

| **Gráficos**                              | Recharts                                 |                 2.12.7 | Permite construir gráficos simples de histórico sem implementar visualizações do zero.                            |

| **Hospedagem da API**                     | Google Cloud Run                         |     Fully managed gen2 | Permite publicar a API containerizada com HTTPS e escala adequada ao MVP.                                     |

| **Containerização**                       | Docker                                   |                 26.1.4 | Padroniza o ambiente da API entre desenvolvimento, testes e deploy.                                                |

| **Hospedagem do frontend**                | Vercel                                   |    Build Output API v3 | Facilita a publicação do dashboard estático com baixo atrito operacional.                                       |

| **Armazenamento local do dispositivo**    | NVS Preferences do ESP32 + fila circular | API Preferences 2.0.17 | Permite reter leituras pendentes sem depender de cartão SD no MVP.                                            |

| **Controle de versão**                    | Git + GitHub Flow                        |             Git 2.44.0 | Mantém rastreabilidade por branches curtas e Pull Requests antes da integração na `main`.                                                                                |


---

## 5. Arquitetura do Sistema

### 5.1 Diagrama de Componentes

```mermaid
flowchart LR
  S1[Sensor de umidade do solo] ----- sinal analógico -------> ESP[ESP32\nFirmware Arduino]
  S2[Sensor de temperatura DHT22] ----- sinal digital -------> ESP
  ESP ---- grava leituras pendentes ------> BUF[(Fila local\nNVS Preferences)]
  ESP ----- HTTPS REST\nPOST /leituras\nJSON -------> API[API FastAPI\nCloud Run]
  API ----- validação de schema\nPydantic -------> VAL[Camada de validação]
  VAL ----- SQLAlchemy/Alembic\nSQL -------> DB[(PostgreSQL 16.3)]
  WEB[Dashboard React\nVercel] ----- HTTPS REST\nGET /leituras /historico /alertas -------> API
  USER[Admin\nNavegador] ----- HTTPS -------> WEB
```

A arquitetura é separada em três blocos principais: dispositivo embarcado, backend em nuvem e frontend web. O ESP32 é responsável apenas por coletar, organizar e enviar leituras; a API é responsável por validar, persistir e expor dados; o dashboard é responsável por apresentar estado atual, histórico e alertas ao usuário. O banco não é acessado diretamente pelo frontend nem pelo ESP32, preservando a API como fronteira única de validação e integração.

### 5.2 Fluxo de Dados (Cenários)

**Cenário 1: Coleta local de dados dos sensores (atende UC-01)**

1. **ESP32:** inicia o ciclo de monitoramento após ligar e carregar as configurações locais.
2. **Firmware:** verifica se o intervalo configurado para nova leitura foi atingido.
3. **Sensor de umidade do solo:** envia o valor analógico para o ESP32.
4. **Sensor DHT22:** envia o valor digital de temperatura para o ESP32.
5. **Firmware:** normaliza os valores coletados e monta uma estrutura local com `device_id`, `timestamp`, `temperatura_c`, `umidade_solo_percentual` e `status_leitura`.
6. **Firmware:** valida faixas mínimas e máximas esperadas; se algum sensor falhar, marca o campo como indisponível e registra o erro localmente.
7. **ESP32:** grava a leitura em uma fila local para envio posterior, respeitando o limite de até 100 registros pendentes.
8. **Sistema:** finaliza o ciclo e aguarda o próximo intervalo de coleta.

**Cenário 2: Envio das leituras para a API na nuvem (atende UC-02)**

1. **ESP32:** verifica se existem leituras pendentes na fila local.
2. **Firmware:** testa conectividade Wi-Fi e disponibilidade básica da API.
3. **Firmware:** monta uma requisição `POST /leituras` com payload JSON e cabeçalho `Content-Type: application/json`.
4. **ESP32:** envia a requisição por HTTPS usando TLS 1.2 ou superior.
5. **API FastAPI:** recebe o payload e executa validação com Pydantic.
6. **API FastAPI:** rejeita payloads inválidos com HTTP 400 sem persistir dados.
7. **API FastAPI:** persiste payloads válidos no PostgreSQL usando SQLAlchemy.
8. **API FastAPI:** retorna HTTP 201 para confirmar o registro da medição.
9. **ESP32:** remove da fila local a leitura confirmada pela API.
10. **ESP32:** se houver falha de conexão ou erro temporário 5xx, mantém a leitura na fila e tenta novamente no próximo ciclo.

**Cenário 3: Visualização do dashboard e histórico da horta (atende UC-03)**

1. **Admin:** acessa o dashboard web pelo navegador.
2. **Frontend React:** carrega a tela inicial e solicita `GET /leituras/recentes` à API.
3. **API FastAPI:** consulta o PostgreSQL e retorna as últimas leituras em JSON.
4. **Frontend React:** renderiza cards de temperatura, umidade do solo e status geral da horta.
5. **Frontend React:** executa polling leve em intervalo moderado para atualizar os dados recentes sem WebSocket.
6. **Admin:** acessa a tela de histórico e seleciona um período.
7. **Frontend React:** solicita `GET /leituras?inicio=AAAA-MM-DD&fim=AAAA-MM-DD`.
8. **API FastAPI:** consulta o PostgreSQL com filtro por período e ordenação por data/hora.
9. **Frontend React:** exibe gráfico e tabela com as medições encontradas.
10. **Frontend React:** destaca valores fora dos limites fixos definidos para o MVP.

**Cenário 4: Geração e consulta de alertas (atende UC-03, RF-06)**

1. **API FastAPI:** recebe uma nova leitura validada do ESP32.
2. **API FastAPI:** compara os valores recebidos com limites fixos configurados no backend para o MVP.
3. **API FastAPI:** quando algum limite é ultrapassado, registra um alerta vinculado à leitura no PostgreSQL.
4. **Frontend React:** solicita `GET /alertas` quando o usuário abre a tela de alertas.
5. **API FastAPI:** retorna alertas ativos e últimos alertas registrados.
6. **Admin:** visualiza o alerta, consulta o histórico relacionado e decide a ação operacional fora do sistema.

### 5.3 Fronteiras e Responsabilidades

Esta seção define o papel de cada componente dentro da arquitetura do MVP.  
O objetivo é deixar claro o que cada parte do sistema deve fazer e, principalmente, o que não é responsabilidade dela.

   #### Sensores ambientais

   **Responsável por:**  
   Capturar grandezas físicas do ambiente, como umidade do solo, temperatura e umidade do ar.

   **Não faz:**  
   Não valida regras de negócio, não armazena histórico e não se comunica diretamente com a nuvem.

---

   #### ESP32 / firmware

   **Responsável por:**  
   Ler os sensores, montar os payloads de medição, manter a fila local, enviar leituras para a API e registrar falhas temporárias de envio.

   **Não faz:**  
   Não persiste histórico definitivo, não renderiza dashboard, não acessa o banco de dados e não toma decisões automáticas de irrigação.

---

   #### Fila local no ESP32

   **Responsável por:**  
   Guardar temporariamente as leituras que não puderam ser enviadas em caso de falha de conexão.
   **Não faz:**  
   Não substitui o banco central, não mantém histórico permanente e não realiza análise dos dados.

   ---
   #### API FastAPI

   **Responsável por:**  
   Receber leituras, validar payloads, persistir medições, gerar alertas e expor endpoints REST para o frontend.
   **Não faz:**  
   Não lê sensores diretamente, não renderiza a interface final e não executa automação física.

   ---
   #### PostgreSQL

   **Responsável por:**  
   Armazenar medições, alertas e metadados necessários para consultas históricas.
   **Não faz:**  
   Não conversa diretamente com o ESP32 ou com o frontend e não valida payloads HTTP.

   ---
   #### Frontend React

   **Responsável por:**  
   Exibir dashboard, histórico, alertas e telas de configuração inicial do MVP.
   **Não faz:**  
   Não acessa o banco diretamente, não valida payloads enviados pelo ESP32 e não envia comandos físicos para o dispositivo.

   ---
   #### Admin / usuário

   **Responsável por:**  
   Consultar os dados exibidos pelo sistema e interpretar alertas para apoiar a tomada de decisão operacional.
   **Não faz:**  
   Não interage diretamente com sensores, banco de dados ou infraestrutura de nuvem.


---

## 6. Decisões de Arquitetura (ADRs)

### ADR-001: Usar HTTP/HTTPS REST em vez de MQTT para envio de leituras

**Status:** Aceito  
**Data:** 24/04/2026

**Contexto.** O ESP32 precisa enviar leituras periódicas para uma aplicação central, com facilidade de teste, logs compreensíveis e baixa complexidade operacional. O MVP não exige telemetria em tempo real nem comunicação bidirecional contínua. A equipe precisa de uma solução compatível com o prazo acadêmico e com os casos de uso UC-01 e UC-02.

**Opções consideradas:**

1. **HTTP/HTTPS REST**
   - Prós: simples de implementar no ESP32, fácil de testar com ferramentas comuns, compatível com FastAPI e com logs HTTP tradicionais.
   - Contras: maior overhead por requisição e menor eficiência do que protocolos especializados em telemetria.
2. **MQTT**
   - Prós: leve, adequado para IoT, eficiente em cenários com muitos dispositivos e comunicação pub/sub.
   - Contras: exige broker, configuração adicional, monitoramento extra e uma curva operacional maior para o MVP.
3. **WebSocket**
   - Prós: permite conexão persistente e comunicação bidirecional.
   - Contras: aumenta a complexidade no firmware e no backend sem necessidade real para leituras periódicas.

**Decisão.** Escolhemos **HTTP/HTTPS REST** porque o MVP precisa priorizar simplicidade, rastreabilidade e velocidade de implementação. Como as leituras são periódicas e o escopo não exige tempo real, o custo operacional de MQTT ou WebSocket não se justifica neste marco.

**Consequências.**

- Positivas: integração direta com a API, depuração simples, menor infraestrutura e maior facilidade de demonstração.
- Negativas: maior overhead por envio, latência ligeiramente superior e menor eficiência caso o projeto evolua para muitos dispositivos ou alta frequência de leituras.

### ADR-002: Usar PostgreSQL em vez de SQLite ou MongoDB para persistência central

**Status:** Aceito  
**Data:** 2026-04-26

**Contexto.** O sistema precisa armazenar medições ao longo do tempo, consultar histórico por período e associar alertas a leituras específicas. Mesmo sendo um MVP, o domínio é estruturado e tende a crescer em volume histórico. A decisão precisa reduzir retrabalho futuro sem tornar a implementação inviável.

**Opções consideradas:**

1. **PostgreSQL**
   - Prós: modelo relacional robusto, consultas por período, índices por timestamp, consistência transacional e boa evolução futura.
   - Contras: exige configuração de serviço de banco e cuidado maior com variáveis de ambiente e migrações.
2. **SQLite**
   - Prós: configuração mínima, bom para protótipo local e fácil de copiar em ambiente de desenvolvimento.
   - Contras: menos adequado para backend em nuvem com múltiplos acessos e crescimento histórico contínuo.
3. **MongoDB**
   - Prós: flexibilidade de documento JSON e menor rigidez inicial de schema.
   - Contras: não traz vantagem clara para medições estruturadas e pode dificultar integridade entre medições, dispositivos e alertas.

**Decisão.** Escolhemos **PostgreSQL** porque as entidades do sistema são naturalmente relacionais e a consulta histórica é parte central do UC-03. O esforço operacional adicional é aceitável frente ao ganho de consistência e evolução.

**Consequências.**

- Positivas: melhor organização do histórico, consultas mais confiáveis, suporte a índices e menor risco de migração precoce.
- Negativas: exige provisionamento de banco, migrations, gerenciamento de credenciais e mais disciplina de ambiente do que SQLite.

### ADR-003: Usar polling leve no dashboard em vez de WebSocket ou SSE

**Status:** Aceito  
**Data:** 24/04/2026

**Contexto.** O dashboard precisa apresentar dados recentes, mas não precisa atualizar em milissegundos. O usuário principal consulta o estado da horta e o histórico; não há colaboração simultânea nem controle físico imediato. A equipe precisa preservar simplicidade no frontend e no backend.

**Opções consideradas:**

1. **Polling leve via HTTP**
   - Prós: simples, previsível, compatível com a API REST e suficiente para atualização periódica do dashboard.
   - Contras: gera chamadas mesmo quando não há novos dados e pode desperdiçar rede se o intervalo for mal configurado.
2. **WebSocket**
   - Prós: baixa latência e atualização quase em tempo real.
   - Contras: exige gerenciamento de conexão, estado, reconexão e infraestrutura mais complexa.
3. **Server-Sent Events (SSE)**
   - Prós: mais simples que WebSocket para fluxo servidor → cliente.
   - Contras: ainda adiciona uma camada de streaming desnecessária para o MVP.

**Decisão.** Escolhemos **polling leve** com intervalo moderado, pois atende à necessidade de atualização visual sem ampliar o risco técnico. A API permanece REST e o frontend pode atualizar cards e alertas de forma simples.

**Consequências.**

- Positivas: menor complexidade, testes mais simples e boa aderência ao escopo atual.
- Negativas: atraso pequeno entre coleta e exibição, chamadas periódicas sem mudanças e possível necessidade de migração para SSE/WebSocket se o projeto exigir tempo real no futuro.

### ADR-004: Separar frontend e backend em vez de um monólito único

**Status:** Aceito  
**Data:** 24/04/2026

**Contexto.** A equipe precisa entregar uma API consumida pelo dashboard e pelo dispositivo embarcado. O ESP32 não consome HTML; ele envia JSON. Separar frontend e backend deixa mais claro o contrato da API e facilita testar endpoints independentemente da interface.

**Opções consideradas:**

1. **Frontend e backend separados**
   - Prós: separa responsabilidades, facilita deploy do dashboard estático e permite testar API com OpenAPI/Postman/cURL.
   - Contras: exige lidar com CORS, variáveis de ambiente e dois pipelines de publicação.
2. **Monólito servindo HTML e API no mesmo backend**
   - Prós: um único deploy e menor configuração inicial.
   - Contras: mistura renderização de interface com endpoints do ESP32 e reduz clareza do contrato da API.

**Decisão.** Escolhemos **frontend e backend separados** porque o contrato REST é central para o UC-02 e o UC-03. Essa separação reduz acoplamento e torna a arquitetura mais clara para a Release 1.

**Consequências.**

- Positivas: responsabilidades claras, API independente, frontend publicável como site estático e melhor organização do código.
- Negativas: maior número de serviços, necessidade de configurar CORS e mais pontos de configuração em ambiente.

---

## 7. Telas (Wireframes)

Os wireframes abaixo estão embutidos em texto para manter a RFC autocontida, conforme permitido pelo exercício. Eles representam estrutura, informações, ações e navegação; não são a identidade visual final.

### 7.1 Tela 1 — Dashboard da Horta (atende UC-03)

```text
+-------------------------------------------------------------------+
| Grande Projeto Integrador                         [Atualizar]     |
+-------------------------------------------------------------------+
| Status geral: ATENÇÃO                                             |
| Última sincronização: 26/04/2026 14:30                            |
+-------------------------------------------------------------------+
| [Temperatura atual]     [Umidade do solo]      [Status conexão]   |
|  31,2 °C                34 %                   Online             |
+-------------------------------------------------------------------+
| Últimas leituras                                                  |
| 14:30  Temp: 31,2 °C  Solo: 34 %  ALERTA                          |
| 14:15  Temp: 30,8 °C  Solo: 37 %  Atenção                         |
| 14:00  Temp: 29,9 °C  Solo: 42 %  Normal                          | 
+-------------------------------------------------------------------+
| Alertas ativos                                                    |
| - Umidade do solo abaixo do limite mínimo                         |
+-------------------------------------------------------------------+
| [Ver histórico] [Ver alertas] [Configuração inicial]              |
+-------------------------------------------------------------------+
```

**Informações exibidas:** estado atual da horta, última sincronização, temperatura, umidade do solo, últimas leituras e alertas ativos.  
**Ações disponíveis:** atualizar dados, acessar histórico, acessar alertas e abrir configuração inicial.  
**Navegação:** tela inicial do sistema; direciona para Histórico, Alertas e Configuração.

### 7.2 Tela 2 — Histórico de Medições (atende UC-03)

```text
+-------------------------------------------------------------------+
| < Voltar ao dashboard              Histórico de medições          |
+-------------------------------------------------------------------+
| Período: [data inicial] [data final] [Buscar]                     |
+-------------------------------------------------------------------+
| Gráfico                                                           |
| Temperatura e umidade do solo ao longo do tempo                   |
| [ área do gráfico de linhas ]                                     |
+-------------------------------------------------------------------+
| Tabela de leituras                                                |
| Data/Hora        | Temperatura | Umidade solo | Status            |
| 26/04 14:30      | 31,2 °C     | 34 %         | Alerta            |
| 26/04 14:15      | 30,8 °C     | 37 %         | Atenção           |
| 26/04 14:00      | 29,9 °C     | 42 %         | Normal            |
+-------------------------------------------------------------------+
| [Exportar CSV - futuro] [Voltar]                                  |
+-------------------------------------------------------------------+
```

**Informações exibidas:** filtro de período, gráfico de variação, tabela ordenada por data/hora e status de cada medição.  
**Ações disponíveis:** filtrar por período e retornar ao dashboard.  
**Navegação:** acessada a partir do Dashboard; pode encaminhar o usuário para Alertas quando houver medições críticas.

### 7.3 Tela 3 — Alertas da Horta (atende UC-03 e RF-06)

```text
+------------------------------------------------------------------+
| < Voltar ao dashboard                         Alertas             |
+------------------------------------------------------------------+
| Alertas ativos                                                   |
| [CRÍTICO] Umidade do solo abaixo de 35 %                          |
|          Leitura: 34 % em 24/04/2026 14:30                        |
|                                                                  |
| [ATENÇÃO] Temperatura acima de 30 °C                              |
|          Leitura: 31,2 °C em 26/04/2026 14:30                     |
+------------------------------------------------------------------+
| Últimos alertas registrados                                       |
| 26/04 14:30 - Solo abaixo do limite                               |
| 26/04 13:45 - Temperatura alta                                    |
+------------------------------------------------------------------+
| [Ver histórico relacionado] [Voltar ao dashboard]                 |
+------------------------------------------------------------------+
```

**Informações exibidas:** alertas ativos, severidade, valor medido, data/hora da ocorrência e lista de alertas recentes.  
**Ações disponíveis:** abrir histórico relacionado e voltar ao dashboard.  
**Navegação:** acessada pelo Dashboard ou por medições destacadas no Histórico.

### 7.4 Tela 4 — Configuração Inicial da Horta (atende UC-03; suporte ao RF-06)

```text
+-------------------------------------------------------------------+
| < Voltar                                  Configuração inicial    |
+-------------------------------------------------------------------+
| Identificação                                                     |
| Nome da horta:        [ Horta experimental ]                      |
| Local:                [ Laboratório / campus ]                    |
+-------------------------------------------------------------------+
| Limites fixos do MVP                                              |
| Temperatura máxima:   [ 30 ] °C                                   |
| Umidade solo mínima:  [ 35 ] %                                    |
| Intervalo de coleta:  [ 15 ] minutos                              |
+-------------------------------------------------------------------+
| Dispositivo                                                       |
| ID do dispositivo:    [ ESP32-HORTA-01 ]                          |
| Status:               Vinculado                                   |
+-------------------------------------------------------------------+
| [Salvar configuração] [Cancelar]                                  |
+-------------------------------------------------------------------+
```

**Informações exibidas:** nome da horta, local, limites usados para alerta, intervalo de coleta e identificação do dispositivo.  
**Ações disponíveis:** salvar configuração inicial ou cancelar.  
**Navegação:** acessada pelo Dashboard; após salvar, retorna ao Dashboard.

---

## 8. Riscos e Mitigações

## 8. Riscos e Mitigações

Esta seção apresenta os principais riscos técnicos relacionados à arquitetura escolhida para o MVP, junto com suas respectivas estratégias de mitigação.

---

### Risco 1 — Perda temporária de internet no ESP32

**Probabilidade:** Média  
**Impacto:** Alto  

**Descrição:**  
A perda temporária de internet pode impedir que o ESP32 envie as leituras para a API no momento da coleta.

**Mitigação:**  
Manter uma fila local de até 100 leituras e reenviar os registros em ordem quando a conexão for restabelecida.

---

### Risco 2 — Fila local do ESP32 ficar cheia

**Probabilidade:** Média  
**Impacto:** Médio  

**Descrição:**  
Em uma indisponibilidade longa de conexão, a fila local do ESP32 pode atingir sua capacidade máxima.

**Mitigação:**  
Usar fila circular com descarte controlado dos registros mais antigos e registrar um contador de perdas para diagnóstico posterior.

---

### Risco 3 — API aceitar payload inconsistente

**Probabilidade:** Baixa  
**Impacto:** Alto  

**Descrição:**  
Caso a API aceite dados inválidos ou incompletos, o histórico de medições pode ser comprometido.

**Mitigação:**  
Validar todos os campos com Pydantic, rejeitar payloads inválidos com HTTP 400 e registrar logs de erro.

---

### Risco 4 — Crescimento do histórico prejudicar consultas

**Probabilidade:** Média  
**Impacto:** Médio  

**Descrição:**  
Com o crescimento do volume de medições armazenadas, as consultas históricas podem se tornar lentas.

**Mitigação:**  
Criar índices por `timestamp` e `device_id`, além de prever uma política futura de retenção ou arquivamento de dados.

---

### Risco 5 — Polling do dashboard gerar carga desnecessária

**Probabilidade:** Média  
**Impacto:** Médio  

**Descrição:**  
O frontend pode gerar chamadas frequentes à API mesmo quando não houver novas medições disponíveis.

**Mitigação:**  
Definir um intervalo moderado de atualização automática e permitir atualização manual quando necessário.

---

### Risco 6 — Falha de sensor gerar leituras inválidas

**Probabilidade:** Média  
**Impacto:** Médio  

**Descrição:**  
Um sensor com defeito pode gerar leituras nulas, inconsistentes ou fora da faixa física esperada.

**Mitigação:**  
Validar faixas tanto no firmware quanto na API, marcando o sensor como indisponível sem interromper todo o ciclo de coleta.

---

### Risco 7 — Erro de CORS ou variáveis de ambiente bloquear a integração

**Probabilidade:** Média  
**Impacto:** Médio  

**Descrição:**  
Configurações incorretas de CORS ou variáveis de ambiente podem impedir a comunicação entre frontend e API.

**Mitigação:**  
Documentar as variáveis obrigatórias, manter um arquivo `.env.example` e testar a integração em ambiente de homologação antes do Pull Request final.

---

### Risco 8 — Frontend e backend em plataformas diferentes aumentarem pontos de falha

**Probabilidade:** Baixa  
**Impacto:** Médio  

**Descrição:**  
Como frontend e backend são hospedados em plataformas diferentes, falhas de configuração, indisponibilidade ou URLs incorretas podem afetar a experiência do usuário.

**Mitigação:**  
Manter health check da API, página de erro amigável no frontend e documentação de deploy com as URLs esperadas.

---

## 9. Fora do Escopo / Próximos Passos

- Definir autenticação e perfis de usuário para versões futuras.
- Implementar múltiplos dispositivos por horta ou por zona de cultivo.
- Avaliar migração de polling para SSE ou WebSocket caso haja necessidade real de atualização em tempo real.
- Implementar controle de atuadores físicos, como irrigação automática.
- Criar módulo de notificações automáticas.
- Adicionar exportação de histórico em CSV ou PDF.
- Criar política de retenção e arquivamento do histórico de medições.
- Escrever documentação de endpoints da API e exemplos de payload para o ESP32.
- Criar `.env.example`, `docker-compose.yml` de desenvolvimento e scripts mínimos de seed/teste.

---

## Referências


- [SRS do projeto](../requirements/srs.md)
- [Casos de Uso do projeto](../requirements/usecases.md)
- [Plano de SCM](../scm-plan.md)
- [Documentação oficial do ESP32 / Arduino Core for ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [Documentação oficial do FastAPI](https://fastapi.tiangolo.com/)
- [Documentação oficial do PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação oficial do React](https://react.dev/)
- [Documentação oficial do Vite](https://vite.dev/)
- [Documentação oficial do Tailwind CSS](https://tailwindcss.com/docs)
