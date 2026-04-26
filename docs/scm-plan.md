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
```

---

## 1.3 Convenção de Commits

A equipe adotará o padrão **Conventional Commits 1.0.0**.

Especificação:

- https://www.conventionalcommits.org/pt-br/v1.0.0/

Formato adotado:

```text
<tipo>(<escopo>): <descrição>
```

### Tipos mais usados neste projeto

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `refactor`: melhoria interna sem mudar comportamento externo
- `test`: criação ou ajuste de testes
- `chore`: tarefas de manutenção

### Exemplos reais para o projeto da horta

```text
feat(api): adiciona endpoint POST /leituras para dados enviados pelo ESP32
fix(dashboard): corrige falha ao exibir sensor sem leitura recente
docs(srs): atualiza requisito RF-06 de geração de alertas
```

Exemplos adicionais que também fazem sentido neste repositório:

```text
feat(esp32): envia temperatura e umidade em intervalo configurável
fix(api): rejeita payload sem timestamp com resposta HTTP 400
chore(ci): adiciona workflow de validação de arquivos markdown
```

---

## 1.4 Definição de "Pronto" para um PR

Todo Pull Request só pode ser mergeado quando cumprir **todos** os itens abaixo:

- [ ] O título e a descrição do PR explicam **o problema** e **a solução adotada**
- [ ] O PR referencia a atividade, issue ou requisito atendido
- [ ] O escopo do PR está focado em uma mudança principal
- [ ] O autor executou teste manual ou automatizado e registrou como testou
- [ ] A documentação foi atualizada quando a mudança afeta requisitos, arquitetura, API ou fluxo do usuário
- [ ] O CI obrigatório passou sem falhas
- [ ] Pelo menos 1 revisor aprovou
- [ ] O autor do PR não fez autoaprovação nem auto-merge sem revisão

---

## 1.5 Papéis

### Revisão de PRs

A responsabilidade de revisão é de **todos os integrantes da equipe**. Cada membro deve revisar PRs fora do próprio escopo sempre que possível, verificando consistência com requisitos, clareza da solução e impacto no restante do sistema.

### Merge em `main`

O merge em `main` pode ser realizado por qualquer integrante com permissão de escrita, desde que:

- não seja o autor do PR;
- haja pelo menos 1 aprovação;
- o CI esteja aprovado;
- o checklist de pronto esteja completo.

### Manutenção do CI

A manutenção do CI também é responsabilidade da equipe inteira. Na prática, o integrante que alterar workflow, estrutura de diretórios ou regras de documentação deve verificar se o pipeline continua executando corretamente.

---

## Evidência da proteção de branch

A configuração efetiva da proteção de `main` deve ser anexada em `docs/scm-evidence.md` com print de tela ou cópia textual das regras ativas no GitHub. Esse arquivo foi criado junto com este plano para registrar a evidência assim que a configuração for aplicada no repositório remoto.
