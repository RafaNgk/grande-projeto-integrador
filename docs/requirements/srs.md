# Software Requirements Specification (SRS)

## Sistema de Monitoramento de Horta com ESP32

---

## 1. Visão Geral

Este documento descreve os requisitos funcionais e não-funcionais do sistema de monitoramento de horta, composto por dispositivos embarcados (ESP32), uma API em nuvem e uma aplicação cliente.

O sistema tem como objetivo coletar, transmitir, armazenar e apresentar dados ambientais da horta, permitindo o monitoramento remoto e apoio à tomada de decisão.

---

## 2. Requisitos Funcionais

### RF-01

- **Descrição:** O dispositivo ESP32 DEVE coletar dados de sensores (umidade do solo e temperatura) em intervalos configuráveis.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado o sistema em operação
  - Quando o intervalo configurado for atingido
  - Então uma nova leitura dos sensores deve ser realizada e armazenada localmente

---

### RF-02

- **Descrição:** O dispositivo ESP32 DEVE enviar os dados coletados para a API na nuvem via protocolo HTTP ou HTTPS.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado que exista conectividade com a internet
  - Quando uma leitura for realizada
  - Então os dados devem ser enviados para a API com código de resposta HTTP 2xx

---

### RF-03

- **Descrição:** A API DEVE receber, validar e armazenar os dados enviados pelos dispositivos.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado uma requisição válida contendo dados de sensores
  - Quando a API processar a requisição
  - Então os dados devem ser persistidos no banco de dados

---

### RF-04

- **Descrição:** A aplicação cliente DEVE permitir a visualização dos dados mais recentes coletados.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado que existam dados armazenados
  - Quando o usuário acessar a aplicação
  - Então os dados mais recentes devem ser exibidos

---

### RF-05

- **Descrição:** A aplicação cliente DEVE permitir a visualização do histórico de medições.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado que existam dados históricos armazenados
  - Quando o usuário solicitar o histórico
  - Então o sistema deve apresentar os registros ordenados por data

---

### RF-06

- **Descrição:** O sistema DEVE gerar alertas quando os valores de sensores ultrapassarem limites configurados.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado um limite configurado para um sensor
  - Quando um valor exceder esse limite
  - Então um alerta deve ser registrado e disponibilizado na aplicação

---

### RF-07

- **Descrição:** A API NÃO DEVE aceitar dados fora do formato esperado.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado uma requisição com dados inválidos ou campos ausentes
  - Quando a API processar a requisição
  - Então deve retornar código HTTP 400 e não persistir os dados

---

## 3. Requisitos Não-Funcionais (FURPS+)

### 3.1 Funcionalidade (F)

#### RNF-01

- **Descrição:** A API DEVE validar o formato dos dados recebidos (JSON com campos obrigatórios: timestamp, temperatura, umidade).
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado um payload JSON
  - Quando enviado para a API
  - Então deve conter todos os campos obrigatórios para ser aceito

---

### 3.2 Usabilidade (U)

#### RNF-02

- **Descrição:** A aplicação cliente DEVE carregar a tela principal em até 2 segundos em conexão de 10 Mbps.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado acesso via navegador com conexão de 10 Mbps
  - Quando o usuário acessar a aplicação
  - Então o tempo de carregamento inicial deve ser menor ou igual a 2000 ms

---

### 3.3 Confiabilidade (R)

#### RNF-03

- **Descrição:** O dispositivo ESP32 DEVE armazenar localmente até 100 leituras em caso de falha de conexão.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado perda de conexão com a internet
  - Quando novas leituras forem realizadas
  - Então até 100 registros devem ser armazenados localmente sem perda de dados

---

#### RNF-04

- **Descrição:** O sistema DEVE garantir taxa de perda de dados inferior a 1% em condições normais de operação.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado 1000 leituras enviadas
  - Quando processadas pelo sistema
  - Então pelo menos 990 devem estar armazenadas corretamente

---

### 3.4 Performance (P)

#### RNF-05

- **Descrição:** A API DEVE responder às requisições em até 500 ms sob carga de até 100 requisições por minuto.
- **Prioridade:** MUST
- **Critério de Aceitação:**
  - Dado carga de 100 requisições por minuto
  - Quando a API for testada
  - Então 95% das respostas devem ter tempo inferior ou igual a 500 ms

---

#### RNF-06

- **Descrição:** O tempo entre coleta e persistência dos dados NÃO DEVE exceder 2 segundos.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado uma leitura realizada pelo dispositivo
  - Quando enviada à API
  - Então o tempo até armazenamento deve ser menor ou igual a 2000 ms

---

### 3.5 Suportabilidade (S)

#### RNF-07

- **Descrição:** A API DEVE ser compatível com dispositivos que utilizem HTTP/1.1 e payload JSON de até 1 KB por requisição.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado uma requisição com tamanho de até 1024 bytes
  - Quando enviada para a API
  - Então deve ser processada corretamente

---

### 3.6 Restrições (+)

#### RNF-08

- **Descrição:** O dispositivo ESP32 DEVE operar com consumo médio inferior a 150 mA durante transmissão de dados.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado o dispositivo em operação
  - Quando medido o consumo durante transmissão
  - Então a corrente média deve ser inferior a 150 mA

---

#### RNF-09

- **Descrição:** A comunicação entre dispositivo e API DEVE utilizar criptografia TLS 1.2 ou superior.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado uma conexão estabelecida
  - Quando inspecionada
  - Então deve utilizar protocolo HTTPS com TLS 1.2 ou superior

---

#### RNF-10

- **Descrição:** O sistema DEVE operar com disponibilidade mínima de 95% ao longo de um período de 30 dias.
- **Prioridade:** SHOULD
- **Critério de Aceitação:**
  - Dado monitoramento contínuo por 30 dias
  - Quando calculada a disponibilidade
  - Então deve ser maior ou igual a 95%

---

## 4. Considerações Finais

Este documento define os requisitos mínimos para o sistema, com foco na integração entre dispositivos embarcados, serviços em nuvem e aplicação cliente.

Não estão incluídos nesta versão:

- Casos de uso detalhados
- Diagramas de arquitetura
- Modelos de estado

Esses itens poderão ser definidos em versões futuras.
