# Evidência de Proteção da Branch `main`

Cole neste arquivo um print de tela da configuração ativa da proteção da branch `main` no GitHub.

## O que deve aparecer no print

- Branch name pattern: `main`
- Pull Request obrigatório
- 1 aprovação obrigatória
- Status checks obrigatórios
- Bloqueio de force push
- Bloqueio de exclusão da branch
- Histórico linear habilitado

> Este arquivo existe para registrar a evidência exigida na atividade. O print deve ser adicionado manualmente após a configuração no GitHub.
# Evidência da Proteção da Branch `main`

> **Status atual:** arquivo preparado para receber a evidência após a configuração no GitHub.
>
> Eu consegui deixar neste repositório a documentação, os templates e um workflow de CI. A ativação da proteção da branch precisa ser feita diretamente no GitHub por alguém com permissão administrativa do repositório.

## Regras que devem aparecer ativas no print

- Branch name pattern: `main`
- Require a pull request before merging: **enabled**
- Require approvals: **1**
- Dismiss stale approvals when new commits are pushed: **recommended**
- Require status checks to pass before merging: **enabled**
- Required status check: `CI / docs-validation`
- Require branches to be up to date before merging: **enabled**
- Require linear history: **enabled**
- Allow force pushes: **disabled**
- Allow deletions: **disabled**

## Onde capturar no GitHub

1. Acesse o repositório no GitHub
2. Entre em `Settings`
3. Abra `Branches`
4. Edite ou crie a regra de proteção para `main`
5. Tire um print da regra ativa
6. Cole a imagem abaixo ou substitua este trecho por uma cópia textual da configuração

## Espaço para evidência

```text
[COLE AQUI O PRINT DA TELA OU A CÓPIA TEXTUAL DAS REGRAS DE PROTEÇÃO DA BRANCH MAIN]
```
