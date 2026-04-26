# Plano de SCM do Repositório

Este documento define como o repositório da equipe será organizado, revisado e evoluído a partir da atividade A1.5. O objetivo é manter um fluxo simples, auditável e viável para uma equipe pequena, evitando tanto caos quanto burocracia excessiva.

## 1.1 Política de Branching

### Modelo adotado

A equipe adotará **GitHub Flow**.

### Por que este modelo

Escolhemos GitHub Flow porque o projeto tem equipe pequena, ciclo curto de entregas e um repositório que ainda está evoluindo rapidamente em documentação, requisitos e implementação. Nesse contexto, manter uma única branch principal estável e usar branches curtas por tarefa reduz conflito, simplifica revisão e deixa claro o que está pronto para integrar.

Não adotamos GitFlow porque ele adiciona branches de suporte como `develop`, `release` e `hotfix`, o que tende a aumentar overhead para um time de quatro pessoas e para entregas acadêmicas frequentes. Também não adotamos trunk-based puro porque, embora ele seja muito ágil, ele normalmente pressupõe integração ainda mais frequente, forte automação e disciplina alta com branches muito curtas, o que ainda não corresponde ao estágio atual do repositório.

### Nomes de branch permitidos

As branches devem seguir um prefixo que indique a natureza da mudança:

- `feat/<escopo>` para novas funcionalidades
- `fix/<escopo>` para correções
- `docs/<escopo>` para mudanças de documentação
- `chore/<escopo>` para ajustes operacionais, estrutura ou automação
- `refactor/<escopo>` para refatorações sem mudança de comportamento externo
-
Exemplos válidos:

- `feat/api-recebimento-leituras`
- `fix/dashboard-alerta-nulo`
- `docs/scm-plan`
- `chore/github-templates`

### Regras de merge em `main`

A branch `main` representa a linha estável do repositório.

- Não é permitido push direto em `main`
- Toda alteração deve entrar por Pull Request
- O merge em `main` só pode ser feito após aprovação e checks obrigatórios aprovados
- O autor do PR não deve aprovar o próprio PR
- O merge deve ser realizado por um integrante com permissão de escrita, desde que não quebre as regras acima

## 1.2 Proteção da branch `main`

As seguintes regras devem estar ativas no GitHub para a branch `main`:

- **Pull Request obrigatório**: ninguém pode fazer push direto em `main`
- **Mínimo de 1 aprovação** antes do merge
- **Status checks obrigatórios**: no mínimo um workflow de CI deve passar antes do merge
- **Sem force push** em `main`
- **Sem delete da branch `main`**
- **Histórico linear habilitado**, para evitar merges desnecessários e facilitar auditoria do histórico

### Quantidade de aprovações

A equipe definiu **1 aprovação obrigatória**.

Esse número foi escolhido porque o time é pequeno e exigir 2 aprovações em todo PR pode travar o fluxo quando parte da equipe estiver indisponível. Ao mesmo tempo, exigir ao menos 1 aprovação preserva revisão entre pares, reduzindo risco de erro e melhorando rastreabilidade.

### Status checks obrigatórios

O check obrigatório inicial do repositório será um workflow simples de validação de Markdown no GitHub Actions, suficiente para garantir que a documentação principal do projeto não seja integrada com erros básicos de formatação.

### Onde configurar no GitHub

As regras devem ser configuradas em:

**Settings → Branches → Branch protection rules**

## 1.3 Convenção de Commits

A equipe seguirá o padrão **Conventional Commits 1.0.0**.

Especificação adotada:

- https://www.conventionalcommits.org/pt-br/v1.0.0/

### Formato

```text
<tipo>[escopo opcional]: <descrição>
```

### Tipos mais usados pela equipe

- `feat`: nova funcionalidade
- `fix`: correção de defeito
- `docs`: documentação
- `chore`: ajustes de infraestrutura, templates e automação
- `refactor`: reorganização interna sem alterar comportamento esperado

### Exemplos reais para este projeto

- `feat(api): adiciona endpoint POST /leituras para dados do ESP32`
- `fix(dashboard): corrige exibição quando leitura de umidade vem nula`
- `docs(scm): adiciona plano de branching e templates de PR e issue`

## 1.4 Definição de "Pronto" para um PR

Todo Pull Request só pode ser mergeado se cumprir todos os itens abaixo:

- A descrição explica o problema resolvido e a motivação da mudança
- O PR referencia a issue, requisito, caso de uso ou atividade relacionada
- O autor realizou teste compatível com a mudança e descreveu como testou
- Pelo menos 1 revisor aprovou o PR
- O CI obrigatório passou com sucesso
- A documentação foi atualizada quando a mudança afeta requisitos, arquitetura, fluxo de uso, contrato de API ou processo do time
- O PR está focado em um único objetivo, sem misturar correções não relacionadas

## 1.5 Papéis

### Revisão de PRs

Todos os integrantes da equipe são responsáveis por revisar Pull Requests. A expectativa é que qualquer mudança relevante receba revisão de pelo menos um colega antes do merge.

### Merge em `main`

Qualquer integrante com permissão de escrita pode realizar o merge em `main`, desde que:

- não seja por push direto
- o PR tenha pelo menos 1 aprovação
- os checks obrigatórios estejam verdes
- o autor não esteja burlando a revisão do próprio trabalho

### Manutenção do CI

A responsabilidade pelo CI é compartilhada por toda a equipe, mas o **autor do PR é o primeiro responsável por corrigir falhas abertas pela sua própria alteração**. Se a falha estiver no workflow, configuração ou infraestrutura do repositório, qualquer integrante pode abrir correção via `chore/ci-*`.

## Evidência de aplicação

A equipe deve colar ao final deste documento, ou em `docs/scm-evidence.md`, um print de tela das regras ativas de proteção da branch `main` no GitHub.

### Checklist da evidência

- Regra aplicada à branch `main`
- Require a pull request before merging
- Require approvals: 1
- Require status checks to pass before merging
- Block force pushes
- Block branch deletion
- Require linear history

> Observação: este arquivo documenta a regra. A evidência visual da configuração ativa deve ser adicionada manualmente pela equipe após configurar o repositório no GitHub.
# Plano de SCM

## Contexto

Este plano define como o repositório do projeto **Sistema de Monitoramento de Horta com ESP32** será versionado, revisado e integrado a partir desta atividade. O objetivo é garantir que qualquer integrante da equipe consiga entender o histórico, revisar mudanças com segurança e evoluir o sistema sem depender de conhecimento implícito.

---

## 1.1 Política de Branching

### Modelo adotado

A equipe adotará o **GitHub Flow**.

### Justificativa

O projeto da horta é mantido por uma equipe pequena, com entregas incrementais e escopo acadêmico, então um fluxo simples com branches curtas e merge por Pull Request reduz atrito e facilita a revisão. O GitFlow foi descartado porque introduz branches de release e hotfix que aumentam a burocracia para um projeto que ainda está evoluindo rapidamente. O trunk-based também foi considerado, mas o time ainda depende de revisão explícita antes do merge, o que torna o GitHub Flow mais natural para o ritmo atual do repositório.

### Convenção de nomes de branch

As branches permitidas são:

- `feat/<escopo>` para novas funcionalidades
- `fix/<escopo>` para correções de defeitos
- `docs/<escopo>` para documentação
- `refactor/<escopo>` para melhorias internas sem alterar comportamento externo
- `test/<escopo>` para criação ou ajuste de testes
- `chore/<escopo>` para manutenção de configuração, CI e dependências

### Regras de uso

- Toda mudança deve nascer a partir de `main`
- Não é permitido trabalhar diretamente em `main`
- Cada branch deve tratar um único objetivo principal
- O merge deve ocorrer apenas por Pull Request

### Quem pode mergear em `main`

Qualquer integrante com permissão de escrita no repositório pode realizar o merge em `main`, **desde que não seja o autor do PR** e que as seguintes condições tenham sido atendidas:

1. o PR esteja aprovado;
2. o checklist de pronto esteja completo;
3. o CI obrigatório esteja verde.

---

## 1.2 Proteção da branch `main`

As seguintes regras devem ficar ativas na proteção da branch `main` no GitHub:

- **Pull Request obrigatório**: ninguém pode fazer push direto em `main`
- **Mínimo de 1 aprovação** antes do merge
- **Status checks obrigatórios**: o workflow de CI precisa passar antes do merge
- **Require branches to be up to date before merging** habilitado
- **Require linear history** habilitado
- **Force push bloqueado**
- **Deletion da branch `main` bloqueada**

### Quantidade mínima de aprovações

A equipe definiu **1 aprovação obrigatória**.

Essa escolha equilibra controle de qualidade e fluidez. Como o time é pequeno, exigir 2 aprovações em todo PR pode travar o fluxo quando algum integrante estiver indisponível. Uma aprovação obrigatória já garante revisão por outra pessoa, reduzindo risco de erro e mudança não discutida.

### Status checks obrigatórios

O check obrigatório será:

- `CI / docs-validation`

Esse check valida a documentação do repositório e garante que arquivos Markdown importantes, como requisitos, processo e plano de SCM, não sejam quebrados por erro de formatação básica.

### Configuração esperada no GitHub

As regras acima devem ser configuradas em:

`Settings -> Branches -> Branch protection rules -> Add rule`

Branch name pattern:

```text
main
