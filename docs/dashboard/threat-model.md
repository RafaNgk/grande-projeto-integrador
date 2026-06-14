# Threat Model — Dashboard

## Objetivo

Este documento complementa o threat model geral do sistema e é focado especificamente no dashboard web utilizado para visualização e gerenciamento da horta monitorada.

## Ativos Protegidos

### Dados exibidos no dashboard
- Leituras de temperatura, umidade e umidade do solo.
- Estado dos canteiros.
- Histórico de medições.
- Eventos de irrigação.

### Credenciais de acesso
- Credenciais de autenticação do usuário (caso a autenticação seja habilitada em versões futuras).
- Tokens de acesso utilizados para comunicação com APIs.

### Endpoints consumidos pelo frontend
- Endpoints de telemetria.
- Endpoints de histórico.
- Endpoints de controle de irrigação.
- Endpoints de estatísticas e agregações.

---

## Ameaças e Mitigações

### 1. Cross-Site Scripting (XSS) em nomes de canteiros

**Cenário:** Um usuário malicioso cadastra um nome de canteiro contendo código JavaScript que posteriormente é exibido na interface.

**Impacto:**
- Execução de scripts no navegador.
- Roubo de sessão.
- Manipulação da interface.

**Mitigação:**
- Uso de React/Next.js, que realiza escaping automático dos dados renderizados.
- Não utilização de `dangerouslySetInnerHTML` para exibição de dados de usuários.
- Validação de entrada utilizando schemas da aplicação.

**Status:** Mitigação implementada.

---

### 2. Exposição de credenciais ou informações sensíveis em logs do frontend

**Cenário:** Informações de configuração do ESP32, tokens ou credenciais são registradas em logs acessíveis pelo navegador.

**Impacto:**
- Vazamento de credenciais.
- Acesso não autorizado à infraestrutura.

**Mitigação:**
- Não armazenar credenciais do dispositivo no frontend.
- Não registrar segredos em logs do navegador.
- Utilizar variáveis de ambiente apenas para informações públicas quando necessário.

**Status:** Mitigação implementada.

---

### 3. Dados em trânsito sem TLS

**Cenário:** Comunicação entre dashboard e API realizada via HTTP sem criptografia.

**Impacto:**
- Interceptação de tráfego.
- Vazamento de dados.
- Manipulação das respostas da API.

**Mitigação:**
- Exigir HTTPS em ambientes de produção.
- Configurar certificados TLS no ambiente de hospedagem.
- Bloquear endpoints inseguros durante o deploy.

**Status:** Dívida técnica registrada para ambiente acadêmico/local. Em produção o uso de TLS é obrigatório.

---

### 4. Injeção em filtros e parâmetros enviados à API

**Cenário:** Um usuário manipula filtros, parâmetros ou identificadores enviados para endpoints do backend.

**Impacto:**
- Consultas indevidas.
- Exposição de informações.
- Possíveis falhas de processamento.

**Mitigação:**
- Validação de parâmetros no backend.
- Uso de tipagem forte e validação de entrada.
- Rejeição de dados fora do formato esperado.

**Status:** Mitigação parcialmente implementada. Deve ser reforçada na API definitiva.

---

## Evidência de Scanning de Dependências (SCA)

### Ferramenta

- npm audit

### Procedimento

Executar na pasta `frontend`:

```bash
npm audit
```

ou

```bash
pnpm audit
```

### Evidência desta release

A evidência deve ser atualizada a cada release e anexada abaixo:

```text
[Inserir saída do npm audit ou print da execução]
```

Exemplo de evidência aceita:
- Captura de tela do terminal executando `npm audit`.
- Relatório exportado do Dependabot.
- Relatório de ferramenta SCA equivalente.

## Riscos Residuais

- Ausência de autenticação e autorização completas no dashboard atual.
- Dependência de configuração correta de HTTPS no ambiente de hospedagem.
- Necessidade de validações adicionais quando houver integração com API real.
