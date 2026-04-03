# Casos de Uso Críticos --- Projeto Integrador da Horta

## Caso de Uso 1: UC-01 --- Coletar Dados dos Sensores

### 1. Nome do Caso de Uso & ID

**UC-01 --- Coletar Dados dos Sensores**

### 2. Ator Principal

ESP32

### 3. Pré-condições

-   O ESP32 deve estar ligado e funcionando corretamente\
-   Os sensores de umidade do solo e temperatura devem estar conectados\
-   O intervalo de coleta deve estar configurado

### 4. Fluxo Principal

1.  O ESP32 inicia o ciclo de monitoramento\
2.  O sistema verifica se o tempo configurado para nova leitura foi
    atingido\
3.  O ESP32 realiza a leitura do sensor de umidade do solo\
4.  O ESP32 realiza a leitura do sensor de temperatura\
5.  O sistema organiza os dados coletados\
6.  Os dados são armazenados localmente no dispositivo\
7.  O processo de coleta é finalizado com sucesso

### 5. Fluxos Alternativos

-   **5.1:** Caso apenas um sensor responda corretamente, o sistema
    registra o valor disponível e marca o outro como indisponível\
-   **5.2:** Caso o intervalo de coleta ainda não tenha sido atingido, o
    sistema aguarda até o próximo ciclo

### 6. Fluxos de Exceção

-   **6.1:** Se o sensor retornar valor nulo ou inválido, o sistema
    registra falha na leitura\
-   **6.2:** Se o sensor estiver desconectado, o ESP32 interrompe a
    leitura daquele sensor e gera um registro de erro

### 7. Pós-condições

-   Os dados dos sensores ficam armazenados localmente para posterior
    envio\
-   Em caso de falha, o erro fica registrado no sistema

## Caso de Uso 2: UC-02 --- Enviar Dados para a API na Nuvem

### 1. Nome do Caso de Uso & ID

**UC-02 --- Enviar Dados para a API na Nuvem**

### 2. Ator Principal

ESP32

### 3. Pré-condições

-   O ESP32 deve ter dados coletados previamente\
-   O dispositivo deve estar conectado à internet\
-   A API deve estar disponível para receber os dados

### 4. Fluxo Principal

1.  O ESP32 verifica se existem dados armazenados para envio\
2.  O sistema monta a requisição com os dados coletados\
3.  O ESP32 envia os dados para a API em nuvem via HTTP/HTTPS\
4.  A API recebe a requisição\
5.  A API valida o formato dos dados recebidos\
6.  A API armazena os dados no banco de dados\
7.  A API retorna uma resposta de sucesso\
8.  O ESP32 registra que o envio foi concluído

### 5. Fluxos Alternativos

-   **5.1:** Caso existam vários dados armazenados localmente, o sistema
    envia todos em sequência\
-   **5.2:** Caso a API processe os dados com sucesso, o sistema remove
    ou marca os registros locais como enviados

### 6. Fluxos de Exceção

-   **6.1:** Se não houver conexão com a internet, o ESP32 mantém os
    dados armazenados localmente\
-   **6.2:** Se a API retornar erro de validação, os dados não são
    persistidos e o sistema registra a falha\
-   **6.3:** Se ocorrer perda de conexão durante o envio, o sistema
    interrompe a transmissão e tenta novamente depois

### 7. Pós-condições

-   Os dados ficam armazenados na nuvem quando o envio é bem-sucedido\
-   Em caso de falha, os dados continuam salvos localmente para reenvio
    posterior

## Caso de Uso 3: UC-03 --- Visualizar Dados e Alertas da Horta

### 1. Nome do Caso de Uso & ID

**UC-03 --- Visualizar Dados e Alertas da Horta**

### 2. Ator Principal

Admin

### 3. Pré-condições

-   O usuário deve ter acesso à aplicação cliente\
-   Devem existir dados armazenados na base do sistema\
-   A aplicação deve estar conectada à API

### 4. Fluxo Principal

1.  O Admin acessa a aplicação cliente\
2.  O sistema solicita os dados mais recentes à API\
3.  A API consulta o banco de dados\
4.  O sistema exibe ao usuário os valores atuais de temperatura e
    umidade do solo\
5.  O Admin solicita o histórico de medições\
6.  O sistema apresenta os registros ordenados por data e hora\
7.  O sistema verifica se algum valor ultrapassou os limites
    configurados\
8.  O sistema exibe alertas de anomalia ao usuário\
9.  O Admin analisa as informações e finaliza a consulta

### 5. Fluxos Alternativos

-   **5.1:** O usuário pode optar por visualizar apenas os dados mais
    recentes\
-   **5.2:** O usuário pode consultar apenas o histórico sem verificar
    alertas\
-   **5.3:** Caso não existam alertas, o sistema exibe somente os dados
    monitorados

### 6. Fluxos de Exceção

-   **6.1:** Se não houver dados no banco, o sistema informa que ainda
    não existem medições registradas\
-   **6.2:** Se a API estiver indisponível, a aplicação informa erro ao
    carregar os dados\
-   **6.3:** Se os dados vierem incompletos, o sistema exibe aviso de
    inconsistência

### 7. Pós-condições

-   O usuário visualiza o estado atual da horta e o histórico
    disponível\
-   Caso existam valores fora do limite, os alertas ficam registrados e
    exibidos
