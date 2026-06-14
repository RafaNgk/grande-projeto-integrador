# HortaMonitor — Dashboard de Sensores para Horta

Dashboard de monitoramento IoT para hortas, com dados de sensores (temperatura, umidade do ar, umidade do solo e luminosidade) organizados por canteiros. Totalmente funcional E2E com dados mockados realistas.

## Setup

Pré-requisitos: Node.js 18+ e [pnpm](https://pnpm.io/).

```bash
git clone <url-do-repositorio>
cd <pasta-do-repositorio>
pnpm install
pnpm dev
```

Acesse `http://localhost:3000`. Não há variáveis de ambiente obrigatórias — o app roda 100% com dados mockados.

```bash
pnpm build   # build de produção
pnpm start   # roda o build
```

## Telas

1. **Principal** (`/`) — KPIs agregados, gráficos de temperatura/umidade/luminosidade ao longo do tempo (com seletor de canteiro), status atual de todos os canteiros e seção de relatório (consumo semanal de água + irrigações por canteiro).
2. **Alertas** (`/alertas`) — Notificações com filtros por canteiro, por tipo e por período.
3. **Histórico** (`/historico`) — Leituras passadas em tabela com paginação e exportação para CSV.
4. **Cadastro de Canteiros** (`/canteiros`) — CRUD completo (criar, editar, excluir) com validação de formulário.

## Arquitetura

- **Next.js (App Router)** + TypeScript + Tailwind CSS v4 + shadcn/ui.
- **Camada de dados isolada e plugável** em `lib/`:
  - `lib/api.ts` — única fonte de acesso a dados. Hoje lê do mock-db com latência simulada; para plugar uma API real, basta trocar as implementações deste arquivo por chamadas `fetch` (a assinatura das funções permanece igual).
  - `lib/hooks.ts` — hooks SWR consumidos pelas telas.
  - `lib/mock-db.ts` — dados mockados em memória.
  - `lib/alerts.ts` — regras de geração de alertas.
  - `lib/types.ts` — tipos compartilhados.
  - `lib/validation.ts` — schemas de validação (Zod).

### Trocar mock pela API real

Cada função em `lib/api.ts` é o ponto de integração. Exemplo:

```ts
// antes (mock)
export async function getCanteiros() {
  await delay()
  return db.canteiros
}

// depois (API real)
export async function getCanteiros() {
  const res = await fetch(`${BASE_URL}/canteiros`)
  if (!res.ok) throw new Error("Falha ao carregar canteiros")
  return res.json()
}
```

Os hooks e componentes não precisam mudar.

## Dados mockados e casos de borda

Os dados cobrem o caminho feliz e bordas explícitas:

- **Sensor offline** — canteiro com leitura indisponível (valores `null`, exibidos como "—").
- **Dado parcial** — leituras onde alguns campos não foram reportados.
- **Leitura suspeita** — valores fora da faixa física plausível, sinalizados.
- **Irrigação manual** — eventos de irrigação acionados manualmente além dos automáticos.

## Sistema de alertas

As regras em `lib/alerts.ts` disparam alertas com base em condições mockadas, por exemplo **umidade do solo abaixo de 30%**, temperatura fora da faixa ideal e sensor offline. Os alertas aparecem na Principal e na tela de Alertas.

## Estados de erro

Todas as telas tratam de forma consistente os estados de **carregando**, **erro** (com botão de tentar novamente) e **vazio**, via os componentes em `components/data-states.tsx`.

## Responsividade

Layout mobile-first: navegação lateral em desktop e menu (sheet) em telas pequenas; grids e gráficos se adaptam ao viewport.
